import mongoose from 'mongoose';

const generationJobSchema = new mongoose.Schema({
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
  jobType: {
    type: String,
    default: 'prepare_completely'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  currentStage: {
    type: String,
    default: 'validate_input'
  },
  progress: {
    type: Number,
    default: 0
  },
  idempotencyKey: {
    type: String,
    required: true
  },
  stages: [{
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    error: {
      type: String,
      default: null
    },
    retries: {
      type: Number,
      default: 0
    },
    completedAt: {
      type: Date,
      default: null
    }
  }]
}, {
  timestamps: true
});

generationJobSchema.index({ firebaseUid: 1, applicationId: 1, status: 1 });
generationJobSchema.index({ idempotencyKey: 1 }, { unique: true });

export const GenerationJob = mongoose.model('GenerationJob', generationJobSchema);
