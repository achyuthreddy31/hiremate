import mongoose from 'mongoose';

const practiceAttemptSchema = new mongoose.Schema({
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
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PracticeQuestion',
    required: true
  },
  type: {
    type: String,
    required: true
  },
  topic: {
    type: String,
    required: true,
    index: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  userAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeTakenSeconds: {
    type: Number,
    required: true
  },
  testSessionId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

practiceAttemptSchema.index({ firebaseUid: 1, applicationId: 1, topic: 1 });

export const PracticeAttempt = mongoose.model('PracticeAttempt', practiceAttemptSchema);
