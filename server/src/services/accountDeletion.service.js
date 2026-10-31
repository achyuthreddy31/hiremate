import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Application } from '../models/application.model.js';
import { CandidateProfile } from '../models/candidateProfile.model.js';
import { Resume } from '../models/resume.model.js';
import { JobAnalysis } from '../models/jobAnalysis.model.js';
import { MatchReport } from '../models/matchReport.model.js';
import { Roadmap } from '../models/roadmap.model.js';
import { LearningRecommendation } from '../models/learningRecommendation.model.js';
import { PracticeQuestion } from '../models/practiceQuestion.model.js';
import { PracticeAttempt } from '../models/practiceAttempt.model.js';
import { CompanyResearch } from '../models/companyResearch.model.js';
import { InterviewPreparation } from '../models/interviewPreparation.model.js';
import { Checklist } from '../models/checklist.model.js';
import { ReadinessSnapshot } from '../models/readinessSnapshot.model.js';
import { GenerationJob } from '../models/generationJob.model.js';

export const USER_DEPENDENT_MODELS = [
  { name: 'PracticeAttempt', model: PracticeAttempt },
  { name: 'PracticeQuestion', model: PracticeQuestion },
  { name: 'Checklist', model: Checklist },
  { name: 'ReadinessSnapshot', model: ReadinessSnapshot },
  { name: 'LearningRecommendation', model: LearningRecommendation },
  { name: 'InterviewPreparation', model: InterviewPreparation },
  { name: 'CompanyResearch', model: CompanyResearch },
  { name: 'Roadmap', model: Roadmap },
  { name: 'MatchReport', model: MatchReport },
  { name: 'Resume', model: Resume },
  { name: 'CandidateProfile', model: CandidateProfile },
  { name: 'JobAnalysis', model: JobAnalysis },
  { name: 'GenerationJob', model: GenerationJob }
];

/**
 * Permanently deletes a user account and cascades across all 15 collections.
 * Uses database transactions where supported by the MongoDB deployment.
 * Strictly scopes every deletion by firebaseUid to guarantee user isolation.
 */
export async function performCompleteAccountDeletion(firebaseUid) {
  if (!firebaseUid) {
    throw new Error('firebaseUid is required for account deletion');
  }

  const deletionSummary = {};
  let totalDeleted = 0;

  // Attempt transactional deletion ONLY if active live connection is ready
  let session = null;
  let useTransaction = false;
  if (mongoose.connection && mongoose.connection.readyState === 1 && typeof mongoose.startSession === 'function') {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch (sessErr) {
      if (session) {
        await session.endSession().catch(() => {});
        session = null;
      }
      useTransaction = false;
    }
  }

  const deleteOp = async (sessionOption = {}) => {
    // 1. Delete from all 13 dependent collections
    for (const { name, model } of USER_DEPENDENT_MODELS) {
      const res = await model.deleteMany({ firebaseUid }, sessionOption);
      deletionSummary[name] = res?.deletedCount || 0;
      totalDeleted += res?.deletedCount || 0;
    }

    // 2. Delete Applications owned by user
    const appRes = await Application.deleteMany({ firebaseUid }, sessionOption);
    deletionSummary['Application'] = appRes?.deletedCount || 0;
    totalDeleted += appRes?.deletedCount || 0;

    // 3. Delete User profile record
    const userRes = await User.deleteMany({ firebaseUid }, sessionOption);
    deletionSummary['User'] = userRes?.deletedCount || 0;
    totalDeleted += userRes?.deletedCount || 0;
  };

  try {
    if (useTransaction && session) {
      await deleteOp({ session });
      await session.commitTransaction();
      await session.endSession();
    } else {
      await deleteOp({});
    }

    return {
      success: true,
      firebaseUid,
      totalDeleted,
      deletionSummary
    };
  } catch (error) {
    if (useTransaction && session) {
      await session.abortTransaction().catch(() => {});
      await session.endSession().catch(() => {});
    }
    throw error;
  }
}
