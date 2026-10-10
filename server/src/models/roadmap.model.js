import mongoose from 'mongoose';

const roadmapSchema = new mongoose.Schema({
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
  totalDays: {
    type: Number,
    required: true
  },
  dailyMinutes: {
    type: Number,
    default: 60
  },
  completionPercentage: {
    type: Number,
    default: 0
  },
  tasks: [{
    day: { type: Number, required: true },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    requirementRef: { type: String, required: true },
    gapRef: { type: String, required: true },
    reason: { type: String, required: true },
    learningActivity: { type: String, default: '' },
    practiceActivity: { type: String, default: '' },
    estimatedMinutes: { type: Number, default: 30 },
    priority: { type: String, enum: ['critical', 'important', 'beneficial'], default: 'important' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending'
    },
    completedAt: { type: Date, default: null }
  }],
  uncoveredGaps: [{
    name: String,
    importance: String,
    reason: String
  }]
}, {
  timestamps: true
});

roadmapSchema.index({ firebaseUid: 1, applicationId: 1 }, { unique: true });

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
