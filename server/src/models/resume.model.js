import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
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
  originalFilename: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  extractedText: {
    type: String,
    select: false // not selected by default for performance and privacy
  },
  parsedData: {
    contactDetails: {
      fullName: { value: String, confidence: Number, userVerified: { type: Boolean, default: false } },
      email: { value: String, confidence: Number, userVerified: { type: Boolean, default: false } },
      phone: { value: String, confidence: Number, userVerified: { type: Boolean, default: false } },
      location: { value: String, confidence: Number, userVerified: { type: Boolean, default: false } },
      links: {
        github: { value: String, confidence: Number, userVerified: { type: Boolean, default: false } },
        linkedin: { value: String, confidence: Number, userVerified: { type: Boolean, default: false } },
        portfolio: { value: String, confidence: Number, userVerified: { type: Boolean, default: false } }
      }
    },
    skills: [{
      name: String,
      normalizedName: String,
      category: String,
      confidence: Number,
      userVerified: { type: Boolean, default: false }
    }],
    experience: [{
      company: String,
      role: String,
      startDate: String,
      endDate: String,
      isInternship: Boolean,
      bullets: [String],
      confidence: Number,
      userVerified: { type: Boolean, default: false }
    }],
    projects: [{
      title: String,
      description: String,
      skills: [String],
      bullets: [String],
      confidence: Number,
      userVerified: { type: Boolean, default: false }
    }],
    education: [{
      institution: String,
      degree: String,
      fieldOfStudy: String,
      level: String,
      endYear: Number,
      confidence: Number,
      userVerified: { type: Boolean, default: false }
    }],
    certifications: [{
      name: String,
      issuer: String,
      confidence: Number,
      userVerified: { type: Boolean, default: false }
    }]
  },
  parsingStatus: {
    type: String,
    enum: ['uploaded', 'processing', 'completed', 'failed'],
    default: 'uploaded'
  },
  qualityChecklist: {
    hasContactDetails: Boolean,
    hasSkillsSection: Boolean,
    hasProjectsOrExperience: Boolean,
    hasEducation: Boolean,
    actionVerbRatio: Number,
    hasSensibleLength: Boolean,
    isCleanlyExtracted: Boolean,
    hasProfessionalLinks: Boolean
  }
}, {
  timestamps: true
});

resumeSchema.index({ firebaseUid: 1, applicationId: 1 });

export const Resume = mongoose.model('Resume', resumeSchema);
