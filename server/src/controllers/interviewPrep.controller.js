import { Application } from '../models/application.model.js';
import { CandidateProfile } from '../models/candidateProfile.model.js';
import { InterviewPreparation } from '../models/interviewPreparation.model.js';
import { Resume } from '../models/resume.model.js';
import { buildInterviewPrepDataset, generateTruthfulResumeImprovements } from '../services/interviewPrep.service.js';

export async function generateInterviewPrep(req, res) {
  try {
    const { applicationId } = req.params;
    const [app, profile] = await Promise.all([
      Application.findOne({ _id: applicationId, firebaseUid: req.user.uid }),
      CandidateProfile.findOne({ applicationId, firebaseUid: req.user.uid })
    ]);

    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found' }
      });
    }

    const prepData = buildInterviewPrepDataset({
      companyName: app.companyName,
      jobTitle: app.jobTitle,
      candidateProfile: profile || {}
    });

    const prep = await InterviewPreparation.findOneAndUpdate(
      { applicationId, firebaseUid: req.user.uid },
      {
        ...prepData,
        firebaseUid: req.user.uid,
        applicationId
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      data: prep
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'INTERVIEW_PREP_GEN_ERROR', message: error.message }
    });
  }
}

export async function getInterviewPrep(req, res) {
  try {
    const { applicationId } = req.params;
    const prep = await InterviewPreparation.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!prep) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Interview prep not found. Please generate.' }
      });
    }

    return res.status(200).json({
      success: true,
      data: prep
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}

export async function updateQuestionStatus(req, res) {
  try {
    const { applicationId, questionType, questionIndex } = req.params;
    const { prepared, privateNotes } = req.body;

    const prep = await InterviewPreparation.findOne({ applicationId, firebaseUid: req.user.uid });
    if (!prep) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Interview prep record not found' }
      });
    }

    const list = prep[questionType];
    const idx = parseInt(questionIndex, 10);
    if (!Array.isArray(list) || idx < 0 || idx >= list.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INDEX', message: 'Question not found at index' }
      });
    }

    if (prepared !== undefined) list[idx].prepared = prepared;
    if (privateNotes !== undefined) list[idx].privateNotes = privateNotes;

    await prep.save();

    return res.status(200).json({
      success: true,
      data: list[idx]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: error.message }
    });
  }
}

export async function getResumeImprovements(req, res) {
  try {
    const { applicationId } = req.params;
    const [resume, profile] = await Promise.all([
      Resume.findOne({ applicationId, firebaseUid: req.user.uid }).select('+extractedText'),
      CandidateProfile.findOne({ applicationId, firebaseUid: req.user.uid })
    ]);

    const improvements = generateTruthfulResumeImprovements({
      resumeText: resume?.extractedText || '',
      candidateProfile: profile || {}
    });

    return res.status(200).json({
      success: true,
      data: improvements
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
    });
  }
}
