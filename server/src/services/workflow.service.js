import { WORKFLOW_STAGES } from '../../../shared/constants.js';
import { GenerationJob } from '../models/generationJob.model.js';
import { Application } from '../models/application.model.js';
import { JobAnalysis } from '../models/jobAnalysis.model.js';
import { CandidateProfile } from '../models/candidateProfile.model.js';
import { Resume } from '../models/resume.model.js';
import { MatchReport } from '../models/matchReport.model.js';
import { Roadmap } from '../models/roadmap.model.js';
import { CompanyResearch } from '../models/companyResearch.model.js';
import { PracticeQuestion } from '../models/practiceQuestion.model.js';
import { InterviewPreparation } from '../models/interviewPreparation.model.js';
import { Checklist } from '../models/checklist.model.js';
import { ReadinessSnapshot } from '../models/readinessSnapshot.model.js';

import { analyzeJobDescription, generateMatchReportData } from './jobAnalysis.service.js';
import { buildCompanyResearchDataset } from './companyResearch.service.js';
import { generateRoadmapPlan } from './roadmap.service.js';
import { generateCuratedQuestions } from './practice.service.js';
import { buildInterviewPrepDataset } from './interviewPrep.service.js';
import { calculateInterviewReadinessScore } from './scoring/interviewReadinessScore.js';

/**
 * On server start, marks any 'processing' jobs older than 10 minutes as failed (Section 7).
 */
export async function cleanStaleJobsOnStartup() {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const result = await GenerationJob.updateMany(
      { status: 'processing', updatedAt: { $lt: tenMinutesAgo } },
      { $set: { status: 'failed', 'stages.$[elem].status': 'failed', 'stages.$[elem].error': 'Job timed out on server restart' } },
      { arrayFilters: [{ 'elem.status': 'processing' }] }
    );
    if (result.modifiedCount > 0) {
      console.log(`Cleaned ${result.modifiedCount} stale background generation jobs on startup.`);
    }
  } catch (err) {
    console.warn('Stale job cleanup notice:', err.message);
  }
}

/**
 * Executes or resumes a staged workflow.
 * Strictly preserves completed stages and retries ONLY failed ones.
 */
export async function executeGenerationWorkflow(jobId) {
  const job = await GenerationJob.findById(jobId);
  if (!job) return;

  job.status = 'processing';
  await job.save();

  const { applicationId, firebaseUid } = job;
  const app = await Application.findOne({ _id: applicationId, firebaseUid });
  if (!app) {
    job.status = 'failed';
    await job.save();
    return;
  }

  // Iterate over 15 stages in strict sequential order
  for (let i = 0; i < job.stages.length; i++) {
    const stage = job.stages[i];

    // Preserve completed stages! Never rerun unless user explicitly requests
    if (stage.status === 'completed') {
      continue;
    }

    job.currentStage = stage.name;
    stage.status = 'processing';
    await job.save();

    try {
      await executeIndividualStage({ stageName: stage.name, applicationId, firebaseUid, app });
      stage.status = 'completed';
      stage.error = null;
      stage.completedAt = new Date();
      job.progress = Math.round(((i + 1) / job.stages.length) * 100);
      await job.save();
    } catch (err) {
      stage.status = 'failed';
      stage.error = err.message;
      stage.retries = (stage.retries || 0) + 1;
      job.status = 'failed';
      await job.save();
      console.error(`Stage ${stage.name} failed:`, err.message);
      return; // Stop at failed stage boundary
    }
  }

  job.status = 'completed';
  job.progress = 100;
  await job.save();
}

/**
 * Executes a single granular stage.
 */
async function executeIndividualStage({ stageName, applicationId, firebaseUid, app }) {
  switch (stageName) {
    case 'validate_input':
      if (!app.jobDescription || app.jobDescription.length < 10) {
        throw new Error('Target job description is missing or too short.');
      }
      break;

    case 'analyze_job': {
      const analysisData = await analyzeJobDescription(app.jobDescription);
      await JobAnalysis.findOneAndUpdate(
        { applicationId, firebaseUid },
        { ...analysisData, firebaseUid, applicationId },
        { upsert: true }
      );
      break;
    }

    case 'parse_resume':
    case 'analyze_resume':
      // Handled during resume upload or verified by existing Resume doc
      break;

    case 'compare_resume_with_job':
    case 'calculate_job_match_score':
    case 'generate_skill_gaps': {
      const [jobAnalysis, profile, resume] = await Promise.all([
        JobAnalysis.findOne({ applicationId, firebaseUid }),
        CandidateProfile.findOne({ applicationId, firebaseUid }),
        Resume.findOne({ applicationId, firebaseUid }).select('+extractedText')
      ]);
      if (!jobAnalysis) throw new Error('Job analysis required before match calculation.');

      const reportData = generateMatchReportData({
        jobAnalysis,
        candidateProfile: profile || {},
        resumeQualityChecklist: resume?.qualityChecklist || {},
        resumeText: resume?.extractedText || ''
      });

      await MatchReport.findOneAndUpdate(
        { applicationId, firebaseUid },
        { ...reportData, firebaseUid, applicationId, version: 1 },
        { upsert: true }
      );
      break;
    }

    case 'research_company': {
      const researchData = buildCompanyResearchDataset(app.companyName);
      await CompanyResearch.findOneAndUpdate(
        { applicationId, firebaseUid },
        { ...researchData, firebaseUid, applicationId },
        { upsert: true }
      );
      break;
    }

    case 'generate_roadmap': {
      const matchReport = await MatchReport.findOne({ applicationId, firebaseUid }).sort({ version: -1 });
      const roadmapData = generateRoadmapPlan({
        userAvailableDays: app.availableDays,
        interviewDate: app.interviewDate,
        dailyPreparationMinutes: app.dailyPreparationMinutes,
        requirementsResults: matchReport?.requirementsResults || []
      });
      await Roadmap.findOneAndUpdate(
        { applicationId, firebaseUid },
        { ...roadmapData, firebaseUid, applicationId },
        { upsert: true }
      );
      break;
    }

    case 'generate_practice_tests':
    case 'generate_coding_practice': {
      const jobAnalysis = await JobAnalysis.findOne({ applicationId, firebaseUid });
      const questions = generateCuratedQuestions({
        applicationId,
        firebaseUid,
        requirements: jobAnalysis?.requirements || []
      });
      await PracticeQuestion.deleteMany({ applicationId, firebaseUid });
      await PracticeQuestion.insertMany(questions);
      break;
    }

    case 'generate_resume_suggestions':
      // Truthful suggestions ready on-demand
      break;

    case 'generate_interview_preparation': {
      const profile = await CandidateProfile.findOne({ applicationId, firebaseUid });
      const prepData = buildInterviewPrepDataset({
        companyName: app.companyName,
        jobTitle: app.jobTitle,
        candidateProfile: profile || {}
      });
      await InterviewPreparation.findOneAndUpdate(
        { applicationId, firebaseUid },
        { ...prepData, firebaseUid, applicationId },
        { upsert: true }
      );
      break;
    }

    case 'calculate_interview_readiness': {
      const matchReport = await MatchReport.findOne({ applicationId, firebaseUid }).sort({ version: -1 });
      const readinessResult = calculateInterviewReadinessScore({
        skillMatchTotal: matchReport?.totalScore || 0
      });
      await ReadinessSnapshot.create({
        firebaseUid,
        applicationId,
        totalScore: readinessResult.total,
        areasStartedCount: readinessResult.areasStartedCount,
        totalAreas: readinessResult.totalAreas,
        statusSummary: readinessResult.statusSummary,
        categories: readinessResult.categories,
        disclaimer: readinessResult.disclaimer
      });
      break;
    }

    case 'generate_final_checklist': {
      const items = [
        {
          category: 'required_skills',
          title: 'Review Core Job Requirements & Architecture',
          priority: 'critical',
          status: 'pending',
          reason: 'Verify mastery across all critical technical competencies.'
        },
        {
          category: 'coding_practice',
          title: 'Complete Auto-Graded Debugging & Output Prediction Drills',
          priority: 'critical',
          status: 'pending',
          reason: 'Build speed and precision under interview-like time limits.'
        },
        {
          category: 'company_research',
          title: `Study ${app.companyName} Values & Pass Knowledge Quiz`,
          priority: 'important',
          status: 'pending',
          reason: 'Demonstrate deep organizational alignment.'
        }
      ];
      await Checklist.findOneAndUpdate(
        { applicationId, firebaseUid },
        { firebaseUid, applicationId, items, completionPercentage: 0 },
        { upsert: true }
      );
      break;
    }

    default:
      break;
  }
}
