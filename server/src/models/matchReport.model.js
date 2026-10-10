import mongoose from 'mongoose';

const matchReportSchema = new mongoose.Schema({
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
  version: {
    type: Number,
    default: 1
  },
  totalScore: {
    type: Number,
    required: true
  },
  coverage: {
    type: Number,
    required: true
  },
  isProvisional: {
    type: Boolean,
    default: false
  },
  requirementsResults: [{
    requirementRef: String,
    name: String,
    normalizedName: String,
    category: String,
    importance: String,
    status: {
      type: String,
      enum: ['missing', 'insufficient_data', 'strong', 'good', 'needs_improvement']
    },
    score: Number,
    evidenceItems: [{
      evidenceType: String,
      quote: String,
      confidence: Number
    }],
    confidence: Number,
    explanation: String,
    recommendedAction: String
  }],
  categoryScores: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  excludedCategories: [{
    category: String,
    reason: String,
    explanation: String
  }],
  disclaimer: {
    type: String,
    default: 'HireMate AI alignment score reflects target job alignment and preparation progress. It is never a hiring probability.'
  },
  promptVersion: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

matchReportSchema.index({ firebaseUid: 1, applicationId: 1, version: -1 });

export const MatchReport = mongoose.model('MatchReport', matchReportSchema);
