import { Application } from '../models/application.model.js';
import { JobAnalysis } from '../models/jobAnalysis.model.js';
import { MatchReport } from '../models/matchReport.model.js';
import { CandidateProfile } from '../models/candidateProfile.model.js';
import { Resume } from '../models/resume.model.js';
import { analyzeJobDescription, generateMatchReportData } from '../services/jobAnalysis.service.js';

export async function analyzeJob(req, res) {
  try {
    const { applicationId } = req.params;
    const app = await Application.findOne({ _id: applicationId, firebaseUid: req.user.uid });
    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found or unauthorized' }
      });
    }

    const analysisData = await analyzeJobDescription(app.jobDescription);

    const jobAnalysis = await JobAnalysis.findOneAndUpdate(
      { applicationId, firebaseUid: req.user.uid },
      {
        ...analysisData,
        firebaseUid: req.user.uid,
        applicationId
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: jobAnalysis
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'JOB_ANALYSIS_ERROR', message: error.message }
    });
  }
}

export async function getJobAnalysis(req, res) {
  try {
    const { applicationId } = req.params;
    const analysis = await JobAnalysis.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!analysis) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Job analysis not found. Please trigger analysis.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}

export async function runJobMatch(req, res) {
  try {
    const { applicationId } = req.params;

    const [jobAnalysis, candidateProfile, resume] = await Promise.all([
      JobAnalysis.findOne({ applicationId, firebaseUid: req.user.uid }),
      CandidateProfile.findOne({ applicationId, firebaseUid: req.user.uid }),
      Resume.findOne({ applicationId, firebaseUid: req.user.uid }).select('+extractedText')
    ]);

    if (!jobAnalysis) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_ANALYSIS', message: 'Please run job analysis first.' }
      });
    }

    // Get previous version number
    const latestReport = await MatchReport.findOne({ applicationId, firebaseUid: req.user.uid }).sort({ version: -1 });
    const nextVersion = (latestReport?.version || 0) + 1;

    const reportData = generateMatchReportData({
      jobAnalysis,
      candidateProfile: candidateProfile || {},
      resumeQualityChecklist: resume?.qualityChecklist || {},
      resumeText: resume?.extractedText || ''
    });

    const matchReport = new MatchReport({
      ...reportData,
      firebaseUid: req.user.uid,
      applicationId,
      version: nextVersion
    });
    await matchReport.save();

    return res.status(200).json({
      success: true,
      data: matchReport
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'MATCH_CALCULATION_ERROR', message: error.message }
    });
  }
}

export async function getMatchReport(req, res) {
  try {
    const { applicationId } = req.params;
    const report = await MatchReport.findOne({ applicationId, firebaseUid: req.user.uid }).sort({ version: -1 });

    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'REPORT_NOT_FOUND', message: 'No match report generated yet.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}

export async function getMatchHistory(req, res) {
  try {
    const { applicationId } = req.params;
    const history = await MatchReport.find({ applicationId, firebaseUid: req.user.uid })
      .select('version totalScore coverage isProvisional createdAt')
      .sort({ version: -1 });

    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}
