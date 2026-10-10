import mongoose from 'mongoose';

const jobAnalysisSchema = new mongoose.Schema({
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
  requirements: [{
    name: { type: String, required: true },
    normalizedName: { type: String, required: true },
    category: {
      type: String,
      enum: ['language', 'frontend', 'backend', 'database', 'cloud', 'devops', 'testing', 'tool', 'ai', 'concept', 'other'],
      default: 'concept'
    },
    requiredOrPreferred: {
      type: String,
      enum: ['required', 'preferred'],
      default: 'required'
    },
    importance: {
      type: String,
      enum: ['critical', 'important', 'beneficial'],
      default: 'important'
    },
    evidence: {
      type: String, // exact quote from job description
      required: true
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.95
    },
    sourceType: {
      type: String,
      default: 'job_description'
    },
    uncertain: {
      type: Boolean,
      default: false
    }
  }],
  experienceRequirement: {
    minYears: { type: Number, default: 0 },
    evidence: String,
    uncertain: Boolean
  },
  educationRequirement: {
    level: {
      type: String,
      enum: ['none', 'diploma', 'bachelor', 'master', 'doctorate'],
      default: 'bachelor'
    },
    evidence: String,
    uncertain: Boolean
  },
  atsKeywords: [{
    keyword: String,
    category: String
  }],
  responsibilities: [String],
  assessmentTopics: [String]
}, {
  timestamps: true
});

jobAnalysisSchema.index({ firebaseUid: 1, applicationId: 1 }, { unique: true });

export const JobAnalysis = mongoose.model('JobAnalysis', jobAnalysisSchema);
