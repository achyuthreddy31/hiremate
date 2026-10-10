import { Application } from '../models/application.model.js';
import { MatchReport } from '../models/matchReport.model.js';
import { Roadmap } from '../models/roadmap.model.js';
import { LearningRecommendation } from '../models/learningRecommendation.model.js';
import { generateRoadmapPlan, generateRecommendationsForGaps } from '../services/roadmap.service.js';

export async function generateRoadmap(req, res) {
  try {
    const { applicationId } = req.params;
    const [app, matchReport] = await Promise.all([
      Application.findOne({ _id: applicationId, firebaseUid: req.user.uid }),
      MatchReport.findOne({ applicationId, firebaseUid: req.user.uid }).sort({ version: -1 })
    ]);

    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    if (!matchReport) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_MATCH_REPORT', message: 'Run job match before generating roadmap.' }
      });
    }

    const roadmapData = generateRoadmapPlan({
      userAvailableDays: app.availableDays,
      interviewDate: app.interviewDate,
      dailyPreparationMinutes: app.dailyPreparationMinutes,
      requirementsResults: matchReport.requirementsResults
    });

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
    const gaps = matchReport.requirementsResults.filter(r => r.status !== 'strong');
    const recs = generateRecommendationsForGaps({
      applicationId,
      firebaseUid: req.user.uid,
      gaps
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
