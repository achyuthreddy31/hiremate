import mongoose from 'mongoose';

const companyResearchSchema = new mongoose.Schema({
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
  companyName: {
    type: String,
    required: true
  },
  items: [{
    information: { type: String, required: true },
    category: {
      type: String,
      enum: ['overview', 'culture_values', 'tech_stack', 'interview_process', 'products_news', 'recent_developments'],
      default: 'overview'
    },
    label: {
      type: String,
      enum: ['verified', 'inferred', 'predicted', 'unavailable'],
      required: true
    },
    confidence: { type: Number, min: 0, max: 1, default: 0.8 },
    sourceUrl: { type: String, default: '' },
    retrievedAt: { type: Date, default: Date.now }
  }],
  sectionsReviewed: [{
    category: String,
    reviewed: Boolean,
    reviewedAt: Date
  }],
  quiz: [{
    question: String,
    options: [String],
    correctAnswerIndex: Number,
    explanation: String,
    sourceUrl: String
  }],
  latestQuizScore: {
    type: Number,
    default: null
  }
}, {
  timestamps: true
});

companyResearchSchema.index({ firebaseUid: 1, applicationId: 1 }, { unique: true });

export const CompanyResearch = mongoose.model('CompanyResearch', companyResearchSchema);
