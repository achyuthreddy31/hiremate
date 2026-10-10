import mongoose from 'mongoose';

const candidateProfileSchema = new mongoose.Schema({
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
  fullName: String,
  email: String,
  phone: String,
  links: {
    github: String,
    linkedin: String,
    portfolio: String
  },
  skills: [{
    name: String,
    normalizedName: String,
    category: String,
    source: String, // 'profile' | 'resume'
    userVerified: Boolean
  }],
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    isInternship: Boolean,
    bullets: [String]
  }],
  projects: [{
    title: String,
    description: String,
    skills: [String],
    link: String
  }],
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    level: String,
    endYear: Number
  }],
  certifications: [{
    name: String,
    issuer: String
  }],
  calculatedExperienceYears: {
    type: Number,
    default: 0
  },
  highestEducationLevel: {
    type: String,
    default: 'bachelor'
  }
}, {
  timestamps: true
});

candidateProfileSchema.index({ firebaseUid: 1, applicationId: 1 }, { unique: true });

export const CandidateProfile = mongoose.model('CandidateProfile', candidateProfileSchema);
