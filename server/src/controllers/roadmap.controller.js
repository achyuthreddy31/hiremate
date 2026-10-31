import { Application } from '../models/application.model.js';
import { MatchReport } from '../models/matchReport.model.js';
import { Roadmap } from '../models/roadmap.model.js';
import { LearningRecommendation } from '../models/learningRecommendation.model.js';
import { JobAnalysis } from '../models/jobAnalysis.model.js';
import { CandidateProfile } from '../models/candidateProfile.model.js';
import { Resume } from '../models/resume.model.js';
import { analyzeJobDescription, generateMatchReportData } from '../services/jobAnalysis.service.js';
import { generateRoadmapPlan, generateRecommendationsForGaps } from '../services/roadmap.service.js';

export async function generateRoadmap(req, res) {
  try {
    const { applicationId } = req.params;
    let [app, matchReport, candidateProfile] = await Promise.all([
      Application.findOne({ _id: applicationId, firebaseUid: req.user.uid }),
      MatchReport.findOne({ applicationId, firebaseUid: req.user.uid }).sort({ version: -1 }),
      CandidateProfile.findOne({ applicationId, firebaseUid: req.user.uid })
    ]);

    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    if (!matchReport) {
      // Deterministically analyze job and generate match report if not yet run
      let jobAnalysis = await JobAnalysis.findOne({ applicationId, firebaseUid: req.user.uid });
      if (!jobAnalysis) {
        const textToAnalyze = (app.jobDescription && app.jobDescription.trim().length > 20)
          ? app.jobDescription
          : `${app.jobTitle || 'Software Engineer'}. Requirements: Modern development, architecture, testing, database design, and coding standards.`;
        const analysisData = await analyzeJobDescription(textToAnalyze);
        jobAnalysis = await JobAnalysis.findOneAndUpdate(
          { applicationId, firebaseUid: req.user.uid },
          { ...analysisData, applicationId, firebaseUid: req.user.uid },
          { upsert: true, new: true }
        );
      }

      const resume = await Resume.findOne({ applicationId, firebaseUid: req.user.uid }).select('+extractedText');
      const reportData = generateMatchReportData({
        jobAnalysis,
        candidateProfile: candidateProfile || {},
        resumeQualityChecklist: resume?.qualityChecklist || {},
        resumeText: resume?.extractedText || ''
      });

      matchReport = await MatchReport.create({
        ...reportData,
        firebaseUid: req.user.uid,
        applicationId,
        version: 1
      });
    }

    // Preserve previously completed tasks if re-generating
    const existingRoadmap = await Roadmap.findOne({ applicationId, firebaseUid: req.user.uid });
    const completedTasksMap = new Map();
    if (existingRoadmap?.tasks) {
      for (const t of existingRoadmap.tasks) {
        if (t.status === 'completed') {
          completedTasksMap.set(t.topic.toLowerCase(), t);
          if (t.requirementRef) completedTasksMap.set(t.requirementRef.toLowerCase(), t);
          completedTasksMap.set(`day_${t.day}`, t);
        }
      }
    }

    const roadmapData = generateRoadmapPlan({
      userAvailableDays: app.availableDays,
      interviewDate: app.interviewDate,
      dailyPreparationMinutes: app.dailyPreparationMinutes,
      requirementsResults: matchReport.requirementsResults,
      jobTitle: app.jobTitle,
      jobDescription: app.jobDescription
    });

    // Carry over completed status for previously completed tasks
    let completedCount = 0;
    if (completedTasksMap.size > 0 && Array.isArray(roadmapData.tasks)) {
      roadmapData.tasks = roadmapData.tasks.map(t => {
        const prev = completedTasksMap.get(t.topic.toLowerCase()) ||
                     completedTasksMap.get((t.requirementRef || '').toLowerCase()) ||
                     completedTasksMap.get(`day_${t.day}`);
        if (prev) {
          completedCount++;
          return {
            ...t,
            status: 'completed',
            completedAt: prev.completedAt || new Date()
          };
        }
        return t;
      });
      roadmapData.completionPercentage = Math.round((completedCount / roadmapData.tasks.length) * 100);
    }

    const roadmap = await Roadmap.findOneAndUpdate(
      { applicationId, firebaseUid: req.user.uid },
      {
        ...roadmapData,
        firebaseUid: req.user.uid,
        applicationId
      },
      { new: true, upsert: true }
    );

    // Generate learning recommendations for uncovered and existing gaps
    const gaps = (matchReport.requirementsResults || []).filter(r => r.status !== 'strong');
    const gapsForRecs = (gaps.length > 0)
      ? gaps
      : (roadmapData.tasks || [])
          .filter(t => t.requirementRef !== 'revision_comprehensive' && t.requirementRef !== 'final_checklist_audit')
          .map(t => ({ requirementRef: t.requirementRef, name: t.topic, normalizedName: t.topic, score: 30 }));

    const recs = generateRecommendationsForGaps({
      applicationId,
      firebaseUid: req.user.uid,
      gaps: gapsForRecs
    });

    await LearningRecommendation.deleteMany({ applicationId, firebaseUid: req.user.uid });
    if (recs.length > 0) {
      await LearningRecommendation.insertMany(recs);
    }

    return res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'ROADMAP_GEN_ERROR', message: error.message }
    });
  }
}

export async function getRoadmap(req, res) {
  try {
    const { applicationId } = req.params;
    const roadmap = await Roadmap.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Roadmap not found. Please generate one.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}

export async function updateTaskStatus(req, res) {
  try {
    const { applicationId, taskId } = req.params;
    const { status } = req.body; // 'pending' | 'in_progress' | 'completed' | 'skipped'

    const roadmap = await Roadmap.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!roadmap) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Roadmap not found' }
      });
    }

    const task = roadmap.tasks.id(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task ID not found in roadmap' }
      });
    }

    task.status = status;
    task.completedAt = status === 'completed' ? new Date() : null;

    // Recalculate completion percentage
    const completedCount = roadmap.tasks.filter(t => t.status === 'completed').length;
    roadmap.completionPercentage = Math.round((completedCount / roadmap.tasks.length) * 100);

    await roadmap.save();

    return res.status(200).json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_TASK_ERROR', message: error.message }
    });
  }
}

export async function getRecommendations(req, res) {
  try {
    const { applicationId } = req.params;
    const recs = await LearningRecommendation.find({ applicationId, firebaseUid: req.user.uid });
    return res.status(200).json({
      success: true,
      data: recs
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}
