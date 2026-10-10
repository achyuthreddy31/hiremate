import { describe, it, expect } from 'vitest';
import {
  normalizeSkill,
  calculateRequirementScore,
  calculateCandidateExperienceYears,
  calculateResumeQualityScore,
  calculateJobMatchScore,
  calculateInterviewReadinessScore,
  evaluateAdaptiveDifficulty,
  allocateRoadmapSlots
} from '../src/services/scoring/index.js';
import { RequirementStatus, EvidenceType, DifficultyLevel } from '../../shared/enums.js';

describe('HireMate AI Deterministic Scoring Unit Tests', () => {

  describe('3.1 Skill Normalization & Aliases', () => {
    it('normalizes exact canonical skill', () => {
      const res = normalizeSkill('JavaScript');
      expect(res.normalized).toBe('JavaScript');
      expect(res.matchedVia).toBe('canonical');
    });

    it('normalizes common aliases (JS, ECMAScript, ES6)', () => {
      expect(normalizeSkill('JS').normalized).toBe('JavaScript');
      expect(normalizeSkill('ECMAScript').normalized).toBe('JavaScript');
      expect(normalizeSkill('ES6').normalized).toBe('JavaScript');
    });

    it('normalizes other tech aliases correctly', () => {
      expect(normalizeSkill('TS').normalized).toBe('TypeScript');
      expect(normalizeSkill('Py').normalized).toBe('Python');
      expect(normalizeSkill('Golang').normalized).toBe('Go');
      expect(normalizeSkill('K8s').normalized).toBe('Kubernetes');
      expect(normalizeSkill('Mongo').normalized).toBe('MongoDB');
    });

    it('handles prefix stripping (e.g., proficient in Python)', () => {
      const res = normalizeSkill('proficient in Python');
      expect(res.normalized).toBe('Python');
    });

    it('flags genuinely unknown skill with normalized: null', () => {
      const res = normalizeSkill('HyperSuperCustomFrameworkXYZ');
      expect(res.normalized).toBeNull();
      expect(res.original).toBe('HyperSuperCustomFrameworkXYZ');
    });
  });

  describe('3.2 Evidence Strength & Requirement Scoring', () => {
    it('maps single mention_only to 15 points and needs_improvement', () => {
      const res = calculateRequirementScore([{ evidenceType: EvidenceType.MENTION_ONLY, confidence: 0.9 }]);
      expect(res.score).toBe(15);
      expect(res.status).toBe(RequirementStatus.NEEDS_IMPROVEMENT);
    });

    it('ensures single mention can never be strong', () => {
      const res = calculateRequirementScore([{ evidenceType: EvidenceType.MENTION_ONLY, confidence: 1.0 }]);
      expect(res.score).toBeLessThan(75);
      expect(res.status).not.toBe(RequirementStatus.STRONG);
    });

    it('professional experience + internship gives highest + distinct bonus', () => {
      const items = [
        { evidenceType: EvidenceType.PROFESSIONAL_EXPERIENCE, confidence: 0.95 },
        { evidenceType: EvidenceType.INTERNSHIP, confidence: 0.9 }
      ];
      // 90 (highest) + 5 (1 distinct additional) = 95
      const res = calculateRequirementScore(items);
      expect(res.score).toBe(95);
      expect(res.status).toBe(RequirementStatus.STRONG);
    });

    it('awards practice bonus (+10) when attempts >= 5 and accuracy >= 70%', () => {
      const items = [
        { evidenceType: EvidenceType.PERSONAL_PROJECT, confidence: 0.9 } // 65
      ];
      const practice = { attemptsCount: 6, accuracy: 0.85 };
      // 65 + 10 = 75 -> STRONG
      const res = calculateRequirementScore(items, practice);
      expect(res.score).toBe(75);
      expect(res.bonusAwarded).toBe(true);
      expect(res.status).toBe(RequirementStatus.STRONG);
    });

    it('flags insufficient_data when best confidence is below 0.5', () => {
      const items = [{ evidenceType: EvidenceType.PROFESSIONAL_EXPERIENCE, confidence: 0.4 }];
      const res = calculateRequirementScore(items);
      expect(res.status).toBe(RequirementStatus.INSUFFICIENT_DATA);
    });

    it('flags missing when no evidence items provided', () => {
      const res = calculateRequirementScore([]);
      expect(res.status).toBe(RequirementStatus.MISSING);
      expect(res.score).toBe(0);
    });
  });

  describe('3.3 Job Match Score & Re-weighting', () => {
    it('calculates candidate experience years with internship at 50% and merged overlaps', () => {
      const exps = [
        { startDate: '2022-01-01', endDate: '2023-01-01', isInternship: false }, // 1 yr full-time
        { startDate: '2023-01-01', endDate: '2024-01-01', isInternship: true }  // 1 yr internship -> 0.5 yr
      ];
      const yrs = calculateCandidateExperienceYears(exps);
      expect(yrs).toBeCloseTo(1.5, 1);
    });

    it('scores Resume Quality deterministically', () => {
      const checklist = {
        hasContactDetails: true,      // 10
        hasSkillsSection: true,       // 15
        hasProjectsOrExperience: true,// 15
        hasEducation: true,           // 10
        actionVerbRatio: 0.7,         // 20
        hasSensibleLength: true,      // 10
        isCleanlyExtracted: true,     // 10
        hasProfessionalLinks: true    // 10
      };
      const res = calculateResumeQualityScore(checklist);
      expect(res.score).toBe(100);
    });

    it('flags provisional when coverage is below 60%', () => {
      // Exclude technicalSkills (35) and experience (15) -> total included 50 < 60
      const res = calculateJobMatchScore({
        technicalRequirements: [], // insufficient_data
        requiredYears: null,      // not_applicable
        candidateProjects: [{ skills: ['React'] }],
        requiredSkills: ['React'],
        candidateEducationLevel: 'bachelor',
        requiredEducationLevel: 'bachelor',
        atsKeywords: ['React'],
        resumeText: 'Experienced in React',
        resumeQualityChecklist: { hasContactDetails: true }
      });

      expect(res.isProvisional).toBe(true);
      expect(res.coverage).toBeLessThan(60);
      expect(res.excludedCategories.length).toBeGreaterThan(0);
    });
  });

  describe('3.4 Interview Readiness Score', () => {
    it('marks unstarted areas as 0 contribution and shows X of 7 areas started', () => {
      const res = calculateInterviewReadinessScore({
        skillMatchTotal: 80,
        codingAttempts: [],
        practiceTestScores: [85, 90],
        resumeQualityScore: 90
      });

      expect(res.categories.coding.status).toBe('not_started');
      expect(res.categories.coding.score).toBe(0);
      expect(res.areasStartedCount).toBe(3); // skillMatch, practiceTests, resume
      expect(res.statusSummary).toBe('3 of 7 areas started');
    });
  });

  describe('3.5 Adaptive Difficulty', () => {
    it('promotes difficulty when accuracy >= 80% and median time <= expected time', () => {
      const attempts = [
        { isCorrect: true, timeTakenSeconds: 30 },
        { isCorrect: true, timeTakenSeconds: 35 },
        { isCorrect: true, timeTakenSeconds: 40 },
        { isCorrect: true, timeTakenSeconds: 25 },
        { isCorrect: true, timeTakenSeconds: 30 }
      ]; // 100% accuracy, median time 30s <= 45s
      const res = evaluateAdaptiveDifficulty({
        currentDifficulty: DifficultyLevel.MEDIUM,
        recentAttempts: attempts,
        expectedTimeSeconds: 45
      });

      expect(res.newDifficulty).toBe(DifficultyLevel.HARD);
      expect(res.changed).toBe(true);
    });

    it('demotes difficulty when accuracy < 40%', () => {
      const attempts = [
        { isCorrect: false, timeTakenSeconds: 40 },
        { isCorrect: false, timeTakenSeconds: 40 },
        { isCorrect: false, timeTakenSeconds: 40 },
        { isCorrect: true, timeTakenSeconds: 40 },
        { isCorrect: false, timeTakenSeconds: 40 }
      ]; // 20% accuracy
      const res = evaluateAdaptiveDifficulty({
        currentDifficulty: DifficultyLevel.MEDIUM,
        recentAttempts: attempts
      });

      expect(res.newDifficulty).toBe(DifficultyLevel.EASY);
      expect(res.changed).toBe(true);
    });

    it('triggers foundational task when 3 consecutive sessions are < 50%', () => {
      const res = evaluateAdaptiveDifficulty({
        currentDifficulty: DifficultyLevel.MEDIUM,
        recentAttempts: [],
        pastSessionAccuracies: [0.4, 0.35, 0.45]
      });

      expect(res.needsFoundationalTask).toBe(true);
    });
  });

  describe('3.6 Roadmap Allocation', () => {
    it('reserves final day for revision and checklist and prioritizes critical gaps', () => {
      const gaps = [
        { id: 'g1', name: 'Docker', importance: 'critical', score: 20 },
        { id: 'g2', name: 'GraphQL', importance: 'beneficial', score: 40 }
      ];

      const res = allocateRoadmapSlots({
        userAvailableDays: 5,
        dailyPreparationMinutes: 60,
        gaps
      });

      expect(res.totalDays).toBe(5);
      expect(res.studyDays).toBe(4);
      // Day 5 should have revision & checklist tasks
      const day5Tasks = res.scheduledTasks.filter(t => t.day === 5);
      expect(day5Tasks.length).toBe(2);
      expect(day5Tasks.some(t => t.topic.includes('Review'))).toBe(true);
      expect(day5Tasks.some(t => t.topic.includes('Checklist'))).toBe(true);
    });
  });

});
