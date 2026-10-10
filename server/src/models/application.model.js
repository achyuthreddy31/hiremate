import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  jobUrl: {
    type: String,
    trim: true,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    default: ''
  },
  employmentType: {
    type: String,
    enum: ['full_time', 'part_time', 'internship', 'contract', 'remote'],
    default: 'full_time'
  },
  experienceLevel: {
    type: String,
    enum: ['entry_level', 'mid_level', 'senior_level', 'lead'],
    default: 'entry_level'
  },
  interviewDate: {
    type: Date,
    default: null
  },
  availableDays: {
    type: Number,
    default: 14,
    min: 1,
    max: 180
  },
  dailyPreparationMinutes: {
    type: Number,
    default: 60,
    min: 20,
    max: 480
  },
  status: {
    type: String,
    enum: ['applied', 'interviewing', 'offer', 'rejected', 'archived'],
    default: 'interviewing'
  }
}, {
  timestamps: true
});

applicationSchema.index({ firebaseUid: 1, _id: 1 });
applicationSchema.index({ firebaseUid: 1, createdAt: -1 });

export const Application = mongoose.model('Application', applicationSchema);
