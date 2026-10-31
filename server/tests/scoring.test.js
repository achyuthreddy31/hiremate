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

    it('enforces strict topic continuity with contiguous blocks and no modulo round-robin jumping', () => {
      const gaps = [
        { id: 'g1', name: 'React', importance: 'critical', score: 20 },
        { id: 'g2', name: 'Node.js', importance: 'critical', score: 25 },
        { id: 'g3', name: 'PostgreSQL', importance: 'important', score: 40 }
      ];

      const res = allocateRoadmapSlots({
        userAvailableDays: 14,
        dailyPreparationMinutes: 60,
        gaps
      });

      expect(res.totalDays).toBe(14);
      expect(res.studyDays).toBe(13);

      const studyTasks = res.scheduledTasks.filter(t => t.day <= 13);
      // Group study days by topic
      const topicDayMap = new Map();
      studyTasks.forEach(task => {
        if (!topicDayMap.has(task.topic)) {
          topicDayMap.set(task.topic, []);
        }
        topicDayMap.get(task.topic).push(task.day);
      });

      // Verify that every topic's days are strictly contiguous: min to max without breaks
      for (const [topic, days] of topicDayMap.entries()) {
        const sortedDays = [...days].sort((a, b) => a - b);
        for (let i = 1; i < sortedDays.length; i++) {
          expect(sortedDays[i]).toBe(sortedDays[i - 1] + 1);
        }
      }
    });

    it('cleans headings and prevents markdown artifacts or strikethrough characters', () => {
      const gaps = [
        { id: 'g1', name: '~~OldSkill~~ Architecture', importance: 'critical', score: 10 }
      ];

      const res = allocateRoadmapSlots({
        userAvailableDays: 3,
        gaps
      });

      const task = res.scheduledTasks.find(t => t.day === 1);
      expect(task.title).not.toContain('~~');
      expect(task.title).not.toContain('~');
      expect(task.title).toContain('OldSkill Architecture');
    });

    it('assigns structured sub-day task properties to final day revision items', () => {
      const gaps = [
        { id: 'g1', name: 'System Design', importance: 'critical', score: 20 }
      ];

      const res = allocateRoadmapSlots({
        userAvailableDays: 14,
        gaps
      });

      const day14Tasks = res.scheduledTasks.filter(t => t.day === 14);
      expect(day14Tasks.length).toBe(2);
      expect(day14Tasks[0].dayLabel).toBe('Day 14 (Part 1 of 2)');
      expect(day14Tasks[1].dayLabel).toBe('Day 14 (Part 2 of 2)');
      expect(day14Tasks[0].subTask).toBe(1);
      expect(day14Tasks[1].subTask).toBe(2);
    });
  });

  describe('3.7 Phase 3: Language Templates and Auto-Graded Readiness', () => {
    it('provides genuine, authentic language-specific starter templates for all 6 languages', async () => {
      const { CURATED_CODING_CHALLENGES } = await import('../src/services/practiceBank.js');

      // Python
      expect(CURATED_CODING_CHALLENGES.Python).toBeDefined();
      expect(CURATED_CODING_CHALLENGES.Python[0].starterCode).toContain('def ');
      expect(CURATED_CODING_CHALLENGES.Python[0].referenceSolution).toContain('def ');

      // JavaScript
      expect(CURATED_CODING_CHALLENGES.JavaScript).toBeDefined();
      expect(CURATED_CODING_CHALLENGES.JavaScript[0].starterCode).toContain('function ');
      expect(CURATED_CODING_CHALLENGES.JavaScript[0].referenceSolution).toContain('function ');

      // Java
      expect(CURATED_CODING_CHALLENGES.Java).toBeDefined();
      expect(CURATED_CODING_CHALLENGES.Java[0].starterCode).toContain('class Solution');
      expect(CURATED_CODING_CHALLENGES.Java[0].starterCode).toContain('public String reverseString');
      expect(CURATED_CODING_CHALLENGES.Java[0].referenceSolution).toContain('class Solution');
      expect(CURATED_CODING_CHALLENGES.Java[1].starterCode).toContain('public int maxSubArray');

      // C
      expect(CURATED_CODING_CHALLENGES.C).toBeDefined();
      expect(CURATED_CODING_CHALLENGES.C[0].starterCode).toContain('#include <stdio.h>');
      expect(CURATED_CODING_CHALLENGES.C[0].starterCode).toContain('char* reverseString');
      expect(CURATED_CODING_CHALLENGES.C[1].starterCode).toContain('int maxSubArray');

      // C++
      expect(CURATED_CODING_CHALLENGES['C++']).toBeDefined();
      expect(CURATED_CODING_CHALLENGES['C++'][0].starterCode).toContain('class Solution');
      expect(CURATED_CODING_CHALLENGES['C++'][0].starterCode).toContain('std::string reverseString');
      expect(CURATED_CODING_CHALLENGES['C++'][1].starterCode).toContain('int maxSubArray');

      // TypeScript
      expect(CURATED_CODING_CHALLENGES.TypeScript).toBeDefined();
      expect(CURATED_CODING_CHALLENGES.TypeScript[0].starterCode).toContain('function filterEvenNumbers(nums: number[]): number[]');
      expect(CURATED_CODING_CHALLENGES.TypeScript[1].starterCode).toContain('function twoSum(nums: number[], target: number): number[]');
    });

    it('includes code_writing attempts in Interview Readiness Score calculation', () => {
      const res = calculateInterviewReadinessScore({
        skillMatchTotal: 80,
        codingAttempts: [
          { type: 'code_writing', isCorrect: true },
          { type: 'code_writing', isCorrect: true },
          { type: 'code_writing', isCorrect: false }
        ],
        practiceTestScores: [85],
        resumeQualityScore: 90
      });

      expect(res.categories.coding.status).toBe('active');
      expect(res.categories.coding.score).toBe(67);
      expect(res.areasStartedCount).toBe(4);
    });
  });

});
