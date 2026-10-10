import { Application } from '../models/application.model.js';
import { MatchReport } from '../models/matchReport.model.js';
import { PracticeAttempt } from '../models/practiceAttempt.model.js';
import { Resume } from '../models/resume.model.js';
import { InterviewPreparation } from '../models/interviewPreparation.model.js';
import { CompanyResearch } from '../models/companyResearch.model.js';
import { Roadmap } from '../models/roadmap.model.js';
import { Checklist } from '../models/checklist.model.js';
import { ReadinessSnapshot } from '../models/readinessSnapshot.model.js';
import { calculateInterviewReadinessScore } from '../services/scoring/interviewReadinessScore.js';

export async function calculateAndSaveReadiness(req, res) {
  try {
    const { applicationId } = req.params;

    const [
      matchReport,
      practiceAttempts,
      resume,
      interviewPrep,
      companyResearch,
      roadmap
    ] = await Promise.all([
      MatchReport.findOne({ applicationId, firebaseUid: req.user.uid }).sort({ version: -1 }),
      PracticeAttempt.find({ applicationId, firebaseUid: req.user.uid }),
      Resume.findOne({ applicationId, firebaseUid: req.user.uid }),
      InterviewPreparation.findOne({ applicationId, firebaseUid: req.user.uid }),
      CompanyResearch.findOne({ applicationId, firebaseUid: req.user.uid }),
      Roadmap.findOne({ applicationId, firebaseUid: req.user.uid })
    ]);

    // Calculate Interview Preparation metrics
    let totalQ = 0;
    let prepQ = 0;
    let totalC = 0;
    let doneC = 0;

    if (interviewPrep) {
      const qTypes = ['technicalQuestions', 'behavioralQuestions', 'projectBasedQuestions', 'resumeBasedQuestions'];
      for (const t of qTypes) {
        const arr = interviewPrep[t] || [];
        totalQ += arr.length;
        prepQ += arr.filter(item => item.prepared).length;
      }
      for (const stage of (interviewPrep.stageChecklists || [])) {
        totalC += (stage.items || []).length;
        doneC += (stage.items || []).filter(i => i.done).length;
      }
    }

    // Company research metrics
    let quizScore = companyResearch?.latestQuizScore || null;
    let reviewedRatio = null;
    if (companyResearch && companyResearch.sectionsReviewed?.length > 0) {
      const doneSections = companyResearch.sectionsReviewed.filter(s => s.reviewed).length;
      reviewedRatio = doneSections / companyResearch.sectionsReviewed.length;
    }

    // Roadmap metrics
    const completedTasks = (roadmap?.tasks || []).filter(t => t.status === 'completed').length;
    const totalTasks = (roadmap?.tasks || []).length;

    // Practice test scores (from test sessions or attempts)
    const testScores = [];
    if (practiceAttempts.length >= 5) {
      const correct = practiceAttempts.filter(a => a.isCorrect).length;
      testScores.push(Math.round((correct / practiceAttempts.length) * 100));
    }

    const readinessResult = calculateInterviewReadinessScore({
      skillMatchTotal: matchReport?.totalScore || 0,
      codingAttempts: practiceAttempts,
      practiceTestScores: testScores,
      resumeQualityScore: matchReport?.categoryScores?.resumeQuality?.score || 0,
      interviewPrepData: {
        preparedQuestions: prepQ,
        totalQuestions: totalQ,
        checklistDone: doneC,
        totalChecklist: totalC
      },
      companyKnowledgeData: {
        quizScore,
        sectionsReviewedRatio: reviewedRatio
      },
      roadmapData: {
        completedTasks,
        totalTasks
      }
    });

    const snapshot = new ReadinessSnapshot({
      firebaseUid: req.user.uid,
      applicationId,
      totalScore: readinessResult.total,
      areasStartedCount: readinessResult.areasStartedCount,
      totalAreas: readinessResult.totalAreas,
      statusSummary: readinessResult.statusSummary,
      categories: readinessResult.categories,
      disclaimer: readinessResult.disclaimer
    });
    await snapshot.save();

    return res.status(200).json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'READINESS_CALC_ERROR', message: error.message }
    });
  }
}

export async function getReadinessSnapshot(req, res) {
  try {
    const { applicationId } = req.params;
    const snapshot = await ReadinessSnapshot.findOne({ applicationId, firebaseUid: req.user.uid }).sort({ createdAt: -1 });
    if (!snapshot) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No readiness snapshot found. Please trigger calculation.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: snapshot
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}

export async function generateFinalChecklist(req, res) {
  try {
    const { applicationId } = req.params;
    const [matchReport, roadmap, app] = await Promise.all([
      MatchReport.findOne({ applicationId, firebaseUid: req.user.uid }).sort({ version: -1 }),
      Roadmap.findOne({ applicationId, firebaseUid: req.user.uid }),
      Application.findOne({ _id: applicationId, firebaseUid: req.user.uid })
    ]);

    const items = [
      {
        category: 'required_skills',
        title: 'Review Core Job Requirements & Architecture',
        priority: 'critical',
        status: 'pending',
        reason: 'Verify mastery across all critical technical competencies specified in target job posting.'
      },
      {
        category: 'resume_fixes',
        title: 'Polish Resume Bullets with Action Verbs & Metrics',
        priority: 'important',
        status: 'pending',
        reason: 'Ensure top ATS readability and clear project outcome framing.'
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
        title: `Study ${app?.companyName || 'Target Company'} Values & Pass Knowledge Quiz`,
        priority: 'important',
        status: 'pending',
        reason: 'Demonstrate deep organizational alignment and genuine motivation.'
      },
      {
        category: 'behavioral_prep',
        title: 'Finalize 3 STAR Stories for Team Collaboration & Conflict Scenarios',
        priority: 'critical',
        status: 'pending',
        reason: 'Behavioral rounds evaluate leadership, ownership, and communication.'
      },
      {
        category: 'roadmap_tasks',
        title: 'Complete Final Roadmap Day 14 Revision & Logistics Plan',
        priority: 'important',
        status: 'pending',
        reason: 'Conclude remaining dated study slots before the target interview date.'
      }
    ];

    const checklist = await Checklist.findOneAndUpdate(
      { applicationId, firebaseUid: req.user.uid },
      {
        firebaseUid: req.user.uid,
        applicationId,
        items,
        completionPercentage: 0
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'CHECKLIST_GEN_ERROR', message: error.message }
    });
  }
}

export async function getChecklist(req, res) {
  try {
    const { applicationId } = req.params;
    const checklist = await Checklist.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!checklist) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Checklist not found' }
      });
    }

    return res.status(200).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}

export async function updateChecklistItem(req, res) {
  try {
    const { applicationId, itemIndex } = req.params;
    const { status } = req.body; // 'pending' | 'completed'

    const checklist = await Checklist.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!checklist) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Checklist not found' }
      });
    }

    const idx = parseInt(itemIndex, 10);
    if (!checklist.items[idx]) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INDEX', message: 'Checklist item index out of bounds' }
      });
    }

    checklist.items[idx].status = status;
    checklist.items[idx].completedAt = status === 'completed' ? new Date() : null;

    const completed = checklist.items.filter(i => i.status === 'completed').length;
    checklist.completionPercentage = Math.round((completed / checklist.items.length) * 100);

    await checklist.save();

    return res.status(200).json({
      success: true,
      data: checklist
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: error.message }
    });
  }
}

export async function getDashboardOverview(req, res) {
  try {
    const { applicationId } = req.params;

    const [app, matchReport, readiness, roadmap, checklist] = await Promise.all([
      Application.findOne({ _id: applicationId, firebaseUid: req.user.uid }),
      MatchReport.findOne({ applicationId, firebaseUid: req.user.uid }).sort({ version: -1 }),
      ReadinessSnapshot.findOne({ applicationId, firebaseUid: req.user.uid }).sort({ createdAt: -1 }),
      Roadmap.findOne({ applicationId, firebaseUid: req.user.uid }),
      Checklist.findOne({ applicationId, firebaseUid: req.user.uid })
    ]);

    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        application: {
          id: app._id,
          companyName: app.companyName,
          jobTitle: app.jobTitle,
          status: app.status,
          interviewDate: app.interviewDate
        },
        jobMatchScore: matchReport ? {
          total: matchReport.totalScore,
          coverage: matchReport.coverage,
          isProvisional: matchReport.isProvisional,
          categoryScores: matchReport.categoryScores
        } : null,
        interviewReadinessScore: readiness ? {
          total: readiness.totalScore,
          areasStartedCount: readiness.areasStartedCount,
          statusSummary: readiness.statusSummary,
          categories: readiness.categories
        } : null,
        roadmap: roadmap ? {
          totalDays: roadmap.totalDays,
          completionPercentage: roadmap.completionPercentage,
          pendingTasksCount: roadmap.tasks.filter(t => t.status === 'pending').length,
          completedTasksCount: roadmap.tasks.filter(t => t.status === 'completed').length
        } : null,
        checklist: checklist ? {
          completionPercentage: checklist.completionPercentage,
          totalItems: checklist.items.length,
          completedItems: checklist.items.filter(i => i.status === 'completed').length
        } : null
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'DASHBOARD_FETCH_ERROR', message: error.message }
    });
  }
}
