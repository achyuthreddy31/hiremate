import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  education: [{
    institution: String,
    degree: String,
    fieldOfStudy: String,
    startYear: Number,
    endYear: Number,
    level: {
      type: String,
      enum: ['diploma', 'bachelor', 'master', 'doctorate', 'other'],
      default: 'bachelor'
    }
  }],
  skills: [{
    type: String,
    trim: true
  }],
  softSkills: [{
    type: String,
    trim: true
  }],
  experience: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    isCurrent: Boolean,
    isInternship: { type: Boolean, default: false },
    description: String
  }],
  projects: [{
    title: String,
    description: String,
    skills: [String],
    link: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    issueDate: Date,
    credentialUrl: String
  }],
  links: {
    github: { type: String, trim: true, default: '' },
    linkedin: { type: String, trim: true, default: '' },
    portfolio: { type: String, trim: true, default: '' }
  },
  careerInterests: [{
    type: String,
    trim: true
  }],
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  }
}, {
  timestamps: true
});

userSchema.index({ firebaseUid: 1 });

export const User = mongoose.model('User', userSchema);
