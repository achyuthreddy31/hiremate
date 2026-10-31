import { describe, it, expect } from 'vitest';
import {
  isDuplicateOrNearDuplicate,
  selectDistinctQuestions,
  normalizeQuestionText,
  calculateTokenSimilarity,
  calculateContentSimilarity,
  extractContentTokens,
  generateCuratedQuestions,
  generateTargetedPracticeQuestions,
  validateQuestionFormat
} from '../src/services/practice.service.js';
import { buildCompanyResearchDataset } from '../src/services/companyResearch.service.js';

describe('Question Deduplication & Session Selection Tests', () => {
  describe('normalizeQuestionText and calculateTokenSimilarity', () => {
    it('normalizes whitespace, punctuation, and casing', () => {
      const raw = '  What is the EVENT loop in Node.js?!  ';
      expect(normalizeQuestionText(raw)).toBe('what is the event loop in nodejs');
    });

    it('calculates 1.0 similarity for identical text after normalization', () => {
      const textA = 'What is the primary benefit of React hooks?';
      const textB = 'what is the primary benefit of react hooks???';
      expect(calculateTokenSimilarity(textA, textB)).toBe(1);
    });

    it('calculates proportional similarity for overlapping tokens', () => {
      const textA = 'How does JavaScript manage event loop microtasks';
      const textB = 'How does JavaScript handle event loop macrotasks';
      const sim = calculateTokenSimilarity(textA, textB);
      expect(sim).toBeGreaterThan(0.5);
      expect(sim).toBeLessThan(1.0);
    });
  });

  describe('isDuplicateOrNearDuplicate', () => {
    const existingList = [
      {
        question: 'In modern software architecture, what is a primary design benefit of utilizing React?',
        codeSnippet: ''
      },
      {
        question: 'Consider the following function execution in Python. What is the expected console output?',
        codeSnippet: 'def add(a, b): return a + b'
      }
    ];

    it('flags exact match as duplicate', () => {
      const candidate = 'In modern software architecture, what is a primary design benefit of utilizing React?';
      expect(isDuplicateOrNearDuplicate(candidate, existingList)).toBe(true);
    });

    it('flags near-duplicate with minor wording or punctuation variations', () => {
      const candidate = 'In modern software architecture, what is a primary design benefit of utilizing React';
      expect(isDuplicateOrNearDuplicate(candidate, existingList)).toBe(true);
    });

    it('flags candidate with identical code snippet and high similarity', () => {
      const candidate = {
        question: 'What is the expected console output of this Python function execution?',
        codeSnippet: 'def add(a, b): return a + b'
      };
      expect(isDuplicateOrNearDuplicate(candidate, existingList)).toBe(true);
    });

    it('does NOT flag a distinct question on the same skill', () => {
      const candidate = {
        question: 'Why should useEffect cleanup functions return a function when unmounting?',
        codeSnippet: ''
      };
      expect(isDuplicateOrNearDuplicate(candidate, existingList)).toBe(false);
    });
  });

  describe('selectDistinctQuestions', () => {
    const mockPool = [
      { _id: 'q1', question: 'Question 1: Explain React virtual DOM diffing', difficulty: 'medium' },
      { _id: 'q2', question: 'Question 2: Explain Node.js event loop queues', difficulty: 'hard' },
      { _id: 'q3', question: 'Question 3: Explain SQL index scans vs table scans', difficulty: 'medium' },
      { _id: 'q4', question: 'Question 4: Explain TypeScript generics and constraints', difficulty: 'easy' },
      { _id: 'q5', question: 'Question 5: Explain Python GIL concurrency limitations', difficulty: 'medium' },
      // Duplicate of q1 with different ID
      { _id: 'q6', question: 'Question 1: Explain React virtual DOM diffing', difficulty: 'medium' }
    ];

    it('ensures no duplicate question IDs in the selected session', () => {
      const selected = selectDistinctQuestions({ pool: mockPool, count: 5 });
      const ids = selected.map(q => q._id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('rejects duplicate or near-duplicate question text even with distinct IDs', () => {
      const selected = selectDistinctQuestions({ pool: mockPool, count: 6 });
      const questions = selected.map(q => q.question);
      const uniqueQuestions = new Set(questions);
      expect(uniqueQuestions.size).toBe(questions.length);
      // q1 and q6 cannot both be in the result
      const includesQ1 = selected.some(q => q._id === 'q1');
      const includesQ6 = selected.some(q => q._id === 'q6');
      expect(includesQ1 && includesQ6).toBe(false);
    });

    it('strictly excludes previously served question IDs (excludeIds)', () => {
      const selected = selectDistinctQuestions({
        pool: mockPool,
        count: 5,
        excludeIds: ['q1', 'q3']
      });

      const selectedIds = selected.map(q => q._id);
      expect(selectedIds).not.toContain('q1');
      expect(selectedIds).not.toContain('q3');
    });

    it('strictly excludes previously answered question texts (excludeQuestions)', () => {
      const selected = selectDistinctQuestions({
        pool: mockPool,
        count: 5,
        excludeQuestions: ['Question 2: Explain Node.js event loop queues']
      });

      const selectedIds = selected.map(q => q._id);
      expect(selectedIds).not.toContain('q2');
    });

    it('handles an exhausted pool gracefully by returning empty array without repeating questions', () => {
      const selected = selectDistinctQuestions({
        pool: mockPool,
        count: 5,
        excludeIds: ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']
      });

      expect(selected).toEqual([]);
      expect(selected.length).toBe(0);
    });
  });

  describe('generateCuratedQuestions across consecutive sessions', () => {
    it('generates completely distinct questions when passing existingQuestions', () => {
      const batch1 = generateCuratedQuestions({
        applicationId: 'app_1',
        firebaseUid: 'user_1',
        requirements: [{ name: 'JavaScript' }, { name: 'React' }],
        count: 5
      });

      expect(batch1.length).toBe(5);

      // Generate batch 2 passing batch 1 as existing
      const batch2 = generateCuratedQuestions({
        applicationId: 'app_1',
        firebaseUid: 'user_1',
        requirements: [{ name: 'JavaScript' }, { name: 'React' }],
        count: 5,
        existingQuestions: batch1
      });

      expect(batch2.length).toBe(5);

      // Verify ZERO overlap between batch1 and batch2
      for (const q2 of batch2) {
        expect(isDuplicateOrNearDuplicate(q2, batch1)).toBe(false);
        expect(validateQuestionFormat(q2)).toBe(true);
      }
    });
  });

  describe('Company Research 7-Area Hub Non-Duplication', () => {
    it('generates research items where every claim is distinct across 7 research hub categories', () => {
      const research = buildCompanyResearchDataset('TechCorp');
      expect(research.items.length).toBeGreaterThanOrEqual(14);
      expect(research.sectionsReviewed.length).toBe(7);

      const statements = research.items.map(item => item.information.trim().toLowerCase());
      const uniqueStatements = new Set(statements);

      // All research bullet points must be distinct statements
      expect(uniqueStatements.size).toBe(statements.length);

      // Each category must have valid items with source URLs
      for (const item of research.items) {
        expect(item.sourceUrl).toBeTruthy();
        expect(item.confidence).toBeGreaterThanOrEqual(0.7);
      }
    });
  });

  describe('Cross-Skill & Procedural Template Deduplication Resilience', () => {
    it('does NOT flag procedural template questions across different skills as duplicates', () => {
      const qPython = {
        question: 'When profiling an application utilizing Python, what is the most effective approach to identify and resolve high CPU contention?',
        skill: 'Python',
        category: 'Programming Languages',
        mode: 'mcq'
      };
      const qReact = {
        question: 'When profiling an application utilizing React, what is the most effective approach to identify and resolve high CPU contention?',
        skill: 'React',
        category: 'Web Development',
        mode: 'mcq'
      };

      // Cross-skill object comparison must never be flagged as duplicates
      expect(isDuplicateOrNearDuplicate(qPython, [qReact])).toBe(false);
      expect(isDuplicateOrNearDuplicate(qReact, [qPython])).toBe(false);

      // String-level check recognizing different core technical skills
      expect(isDuplicateOrNearDuplicate(qPython.question, [qReact.question])).toBe(false);
    });

    it('does NOT flag distinct conceptual questions within the same skill as duplicates', () => {
      const qPass = {
        question: 'In Python, what is the primary purpose of the pass statement?',
        skill: 'Python',
        mode: 'mcq'
      };
      const qYield = {
        question: 'In Python, what is the primary purpose of the yield statement?',
        skill: 'Python',
        mode: 'mcq'
      };

      expect(isDuplicateOrNearDuplicate(qPass, [qYield])).toBe(false);
      expect(isDuplicateOrNearDuplicate(qYield, [qPass])).toBe(false);
    });

    it('does NOT flag questions of different modes (MCQ vs Coding Challenge) as duplicates', () => {
      const mcqQ = {
        question: 'Reverse an array of numbers',
        skill: 'JavaScript',
        mode: 'mcq'
      };
      const codingQ = {
        question: 'Reverse an array of numbers',
        problemStatement: 'Reverse an array of numbers',
        skill: 'JavaScript',
        mode: 'coding_challenges'
      };

      expect(isDuplicateOrNearDuplicate(mcqQ, [codingQ])).toBe(false);
    });

    it('flags genuine exact and near-duplicates within the same skill', () => {
      const qOriginal = {
        question: 'Explain how React virtual DOM diffing algorithm operates.',
        skill: 'React',
        mode: 'mcq'
      };
      const qExact = {
        question: 'explain how react virtual dom diffing algorithm operates',
        skill: 'React',
        mode: 'mcq'
      };
      const qPunctuation = {
        question: 'Explain how React virtual DOM diffing algorithm operates?!?!',
        skill: 'React',
        mode: 'mcq'
      };

      expect(isDuplicateOrNearDuplicate(qExact, [qOriginal])).toBe(true);
      expect(isDuplicateOrNearDuplicate(qPunctuation, [qOriginal])).toBe(true);
    });
  });

  describe('Requested Question Counts Fulfillment (5, 10, 15, 20)', () => {
    it('fulfills exact requested count of 5 for MCQs', async () => {
      const questions = await generateTargetedPracticeQuestions({
        applicationId: '507f1f77bcf86cd799439011',
        firebaseUid: 'test_user_counts',
        category: 'Programming Languages',
        skill: 'Python',
        difficulty: 'medium',
        count: 5,
        mode: 'mcq'
      });

      expect(questions).toHaveLength(5);
      const uniquePrompts = new Set(questions.map(q => normalizeQuestionText(q.question)));
      expect(uniquePrompts.size).toBe(5);
      for (const q of questions) {
        expect(validateQuestionFormat(q)).toBe(true);
      }
    });

    it('fulfills exact requested count of 10 for MCQs', async () => {
      const questions = await generateTargetedPracticeQuestions({
        applicationId: '507f1f77bcf86cd799439011',
        firebaseUid: 'test_user_counts',
        category: 'Programming Languages',
        skill: 'JavaScript',
        difficulty: 'medium',
        count: 10,
        mode: 'mcq'
      });

      expect(questions).toHaveLength(10);
      const uniquePrompts = new Set(questions.map(q => normalizeQuestionText(q.question)));
      expect(uniquePrompts.size).toBe(10);
    });

    it('fulfills exact requested count of 15 for MCQs', async () => {
      const questions = await generateTargetedPracticeQuestions({
        applicationId: '507f1f77bcf86cd799439011',
        firebaseUid: 'test_user_counts',
        category: 'Web Development',
        skill: 'React',
        difficulty: 'medium',
        count: 15,
        mode: 'mcq'
      });

      expect(questions).toHaveLength(15);
      const uniquePrompts = new Set(questions.map(q => normalizeQuestionText(q.question)));
      expect(uniquePrompts.size).toBe(15);
    });

    it('fulfills exact requested count of 20 for MCQs', async () => {
      const questions = await generateTargetedPracticeQuestions({
        applicationId: '507f1f77bcf86cd799439011',
        firebaseUid: 'test_user_counts',
        category: 'Databases',
        skill: 'SQL',
        difficulty: 'medium',
        count: 20,
        mode: 'mcq'
      });

      expect(questions).toHaveLength(20);
      const uniquePrompts = new Set(questions.map(q => normalizeQuestionText(q.question)));
      expect(uniquePrompts.size).toBe(20);
    });

    it('fulfills exact requested counts for Coding Challenges (5, 10, 15, 20)', async () => {
      for (const count of [5, 10, 15, 20]) {
        const challenges = await generateTargetedPracticeQuestions({
          applicationId: '507f1f77bcf86cd799439011',
          firebaseUid: 'test_user_coding_counts',
          category: 'Programming Languages',
          skill: 'Python',
          difficulty: 'medium',
          count,
          mode: 'coding_challenges'
        });

        expect(challenges).toHaveLength(count);
        const uniqueStatements = new Set(challenges.map(c => normalizeQuestionText(c.problemStatement || c.question)));
        expect(uniqueStatements.size).toBe(count);

        for (const c of challenges) {
          expect(validateQuestionFormat(c)).toBe(true);
          expect(c.starterCode).toBeTruthy();
          expect(Array.isArray(c.testCases)).toBe(true);
          expect(c.testCases.length).toBeGreaterThan(0);
          expect(c.correctAnswer).toBeTruthy();
        }
      }
    });
  });

  describe('Repeated Question Avoidance & Fresh Question Prioritization', () => {
    it('serves completely fresh unserved questions across consecutive sessions', async () => {
      // Session 1: 5 questions
      const session1 = await generateTargetedPracticeQuestions({
        applicationId: '507f1f77bcf86cd799439011',
        firebaseUid: 'user_session_tracker',
        skill: 'Python',
        difficulty: 'medium',
        count: 5,
        mode: 'mcq'
      });

      expect(session1).toHaveLength(5);

      // Session 2: 5 questions excluding session 1
      const session2 = await generateTargetedPracticeQuestions({
        applicationId: '507f1f77bcf86cd799439011',
        firebaseUid: 'user_session_tracker',
        skill: 'Python',
        difficulty: 'medium',
        count: 5,
        mode: 'mcq',
        existingQuestions: session1
      });

      expect(session2).toHaveLength(5);

      // Ensure 0 overlap between session 1 and session 2
      for (const q2 of session2) {
        expect(isDuplicateOrNearDuplicate(q2, session1)).toBe(false);
      }
    });

    it('handles pool exhaustion gracefully when all questions are excluded', () => {
      const dummyPool = [
        { _id: '1', question: 'Question 1', difficulty: 'medium' },
        { _id: '2', question: 'Question 2', difficulty: 'medium' }
      ];

      const result = selectDistinctQuestions({
        pool: dummyPool,
        count: 5,
        excludeIds: ['1', '2']
      });

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it('restores full question availability cleanly upon history reset', async () => {
      // After resetting, excludeIds and excludeQuestions are cleared
      const resetQuestions = await generateTargetedPracticeQuestions({
        applicationId: '507f1f77bcf86cd799439011',
        firebaseUid: 'user_reset_test',
        skill: 'Python',
        difficulty: 'medium',
        count: 10,
        mode: 'mcq',
        existingQuestions: [],
        excludeIds: []
      });

      expect(resetQuestions).toHaveLength(10);
    });
  });
});
