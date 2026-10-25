import mongoose from 'mongoose';

const practiceQuestionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['mcq', 'coding_mcq', 'debugging', 'output_prediction', 'code_reading', 'code_writing', 'sql', 'aptitude', 'reasoning', 'scenario'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  codeSnippet: {
    type: String,
    default: ''
  },
  options: [{
    type: String,
    required: true
  }],
  // Rule: correctAnswer is never sent to client before submission
  correctAnswer: {
    type: String,
    required: true,
    select: false
  },
  explanation: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  skill: {
    type: String,
    required: true
  },
  requirementRef: {
    type: String,
    required: true
  },
  expectedTimeSeconds: {
    type: Number,
    default: 60
  },
  testSessionId: {
    type: String,
    default: null,
    index: true
  },
  served: {
    type: Boolean,
    default: false
  },
  servedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

practiceQuestionSchema.index({ firebaseUid: 1, applicationId: 1, skill: 1 });
practiceQuestionSchema.index({ firebaseUid: 1, applicationId: 1, testSessionId: 1 });

export const PracticeQuestion = mongoose.model('PracticeQuestion', practiceQuestionSchema);
