import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    sparse: true,
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
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    select: false
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

userSchema.pre('save', async function (next) {
  if (!this.firebaseUid) {
    this.firebaseUid = this._id ? this._id.toString() : new mongoose.Types.ObjectId().toString();
  }
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model('User', userSchema);
