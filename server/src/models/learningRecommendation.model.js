import mongoose from 'mongoose';

const learningRecommendationSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['documentation', 'tutorial', 'project_idea', 'video', 'article', 'interactive'],
    default: 'documentation'
  },
  // Rule: Link ONLY if it came from grounded search results, otherwise a searchQuery
  link: {
    type: String,
    default: null
  },
  searchQuery: {
    type: String,
    default: ''
  },
  skill: {
    type: String,
    required: true
  },
  requirementRef: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  estimatedMinutes: {
    type: Number,
    default: 45
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.9
  }
}, {
  timestamps: true
});

learningRecommendationSchema.index({ firebaseUid: 1, applicationId: 1 });

export const LearningRecommendation = mongoose.model('LearningRecommendation', learningRecommendationSchema);
