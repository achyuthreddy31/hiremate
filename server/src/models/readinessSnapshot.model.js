import mongoose from 'mongoose';

const readinessSnapshotSchema = new mongoose.Schema({
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
  totalScore: {
    type: Number,
    required: true
  },
  areasStartedCount: {
    type: Number,
    required: true
  },
  totalAreas: {
    type: Number,
    default: 7
  },
  statusSummary: {
    type: String,
    required: true
  },
  categories: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  disclaimer: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

readinessSnapshotSchema.index({ firebaseUid: 1, applicationId: 1, createdAt: -1 });

export const ReadinessSnapshot = mongoose.model('ReadinessSnapshot', readinessSnapshotSchema);
