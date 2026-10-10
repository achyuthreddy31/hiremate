/**
 * Shared Scoring and Configuration Constants
 */
import { EvidenceType, ImportanceWeight } from './enums.js';

export const EVIDENCE_POINTS = {
  [EvidenceType.MENTION_ONLY]: 15,
  [EvidenceType.COURSE_OR_CERTIFICATE]: 35,
  [EvidenceType.ACADEMIC_PROJECT]: 55,
  [EvidenceType.PERSONAL_PROJECT]: 65,
  [EvidenceType.INTERNSHIP]: 80,
  [EvidenceType.PROFESSIONAL_EXPERIENCE]: 90
};

export const ADDITIONAL_EVIDENCE_BONUS = 5;
export const SUCCESSFUL_PRACTICE_BONUS = 10;
export const PRACTICE_BONUS_MIN_ATTEMPTS = 5;
export const PRACTICE_BONUS_MIN_ACCURACY = 0.70;

// Match Score Weights (must sum to 100)
export const MATCH_SCORE_WEIGHTS = {
  technicalSkills: 35,
  experience: 15,
  projects: 15,
  education: 10,
  keywords: 15,
  resumeQuality: 10
};

// Readiness Score Weights (must sum to 100)
export const READINESS_SCORE_WEIGHTS = {
  skillMatch: 25,
  coding: 15,
  practiceTests: 15,
  resume: 15,
  interviewPrep: 15,
  companyKnowledge: 10,
  roadmapCompletion: 5
};

export const PROVISIONAL_COVERAGE_THRESHOLD = 60;

export const EDUCATION_LEVEL_RANKS = {
  none: 0,
  high_school: 0,
  diploma: 1,
  associate: 1,
  bachelor: 2,
  undergraduate: 2,
  master: 3,
  postgraduate: 3,
  doctorate: 4,
  phd: 4
};

export const WORKFLOW_STAGES = [
  'validate_input',
  'analyze_job',
  'parse_resume',
  'analyze_resume',
  'compare_resume_with_job',
  'calculate_job_match_score',
  'generate_skill_gaps',
  'research_company',
  'generate_roadmap',
  'generate_practice_tests',
  'generate_coding_practice',
  'generate_resume_suggestions',
  'generate_interview_preparation',
  'calculate_interview_readiness',
  'generate_final_checklist'
];
