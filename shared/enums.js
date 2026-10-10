/**
 * Shared Enums for HireMate AI
 * Pure JavaScript, zero dependencies.
 */

export const EvidenceType = {
  MENTION_ONLY: 'mention_only',
  COURSE_OR_CERTIFICATE: 'course_or_certificate',
  ACADEMIC_PROJECT: 'academic_project',
  PERSONAL_PROJECT: 'personal_project',
  INTERNSHIP: 'internship',
  PROFESSIONAL_EXPERIENCE: 'professional_experience',
  SUCCESSFUL_PRACTICE: 'successful_practice'
};

export const RequirementStatus = {
  MISSING: 'missing',
  INSUFFICIENT_DATA: 'insufficient_data',
  STRONG: 'strong',
  GOOD: 'good',
  NEEDS_IMPROVEMENT: 'needs_improvement'
};

export const ImportanceWeight = {
  CRITICAL: 3,
  IMPORTANT: 2,
  BENEFICIAL: 1
};

export const ImportanceLevel = {
  CRITICAL: 'critical',
  IMPORTANT: 'important',
  BENEFICIAL: 'beneficial'
};

export const DifficultyLevel = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

export const CompanyFactLabel = {
  VERIFIED: 'verified',
  INFERRED: 'inferred',
  PREDICTED: 'predicted',
  UNAVAILABLE: 'unavailable'
};

export const TaskStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  SKIPPED: 'skipped'
};

export const JobStageStatus = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export const PracticeQuestionType = {
  MCQ: 'mcq',
  CODING_MCQ: 'coding_mcq',
  DEBUGGING: 'debugging',
  OUTPUT_PREDICTION: 'output_prediction',
  CODE_READING: 'code_reading',
  CODE_WRITING: 'code_writing',
  SQL: 'sql',
  APTITUDE: 'aptitude',
  REASONING: 'reasoning',
  SCENARIO: 'scenario'
};
