import mongoose from 'mongoose';

const interviewPreparationSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    index: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  technicalQuestions: [{
    question: String,
    category: String,
    expectedKeyPoints: [String],
    starGuidance: {
      situation: String,
      task: String,
      action: String,
      result: String
    },
    commonMistakes: [String],
    prepared: { type: Boolean, default: false },
    privateNotes: { type: String, default: '' } // Never sent to AI, never scored
  }],
  behavioralQuestions: [{
    question: String,
    competency: String,
    starGuidance: {
      situation: String,
      task: String,
      action: String,
      result: String
    },
    commonMistakes: [String],
    prepared: { type: Boolean, default: false },
    privateNotes: { type: String, default: '' }
  }],
  projectBasedQuestions: [{
    question: String,
    projectTitle: String,
    technicalDeepDive: String,
    prepared: { type: Boolean, default: false },
    privateNotes: { type: String, default: '' }
  }],
  resumeBasedQuestions: [{
    question: String,
    sourceSection: String,
    verificationFocus: String,
    prepared: { type: Boolean, default: false },
    privateNotes: { type: String, default: '' }
  }],
  stageChecklists: [{
    stage: String, // 'Recruiter Screen' | 'Technical Round' | 'System Design' | 'Behavioral / Leadership'
    items: [{
      title: String,
      done: { type: Boolean, default: false }
    }]
  }]
}, {
  timestamps: true
});

interviewPreparationSchema.index({ firebaseUid: 1, applicationId: 1 }, { unique: true });

export const InterviewPreparation = mongoose.model('InterviewPreparation', interviewPreparationSchema);
