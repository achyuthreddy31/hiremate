import mongoose from 'mongoose';

const checklistSchema = new mongoose.Schema({
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
  items: [{
    category: {
      type: String,
      enum: ['required_skills', 'missing_skills', 'resume_fixes', 'coding_practice', 'practice_tests', 'company_research', 'project_revision', 'behavioral_prep', 'roadmap_tasks'],
      required: true
    },
    title: { type: String, required: true },
    priority: { type: String, enum: ['critical', 'important', 'beneficial'], default: 'important' },
    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
    requirementRef: { type: String, default: '' },
    reason: { type: String, required: true },
    completedAt: { type: Date, default: null }
  }],
  completionPercentage: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

checklistSchema.index({ firebaseUid: 1, applicationId: 1 }, { unique: true });

export const Checklist = mongoose.model('Checklist', checklistSchema);
