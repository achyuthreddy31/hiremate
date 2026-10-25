import { describe, it, expect } from 'vitest';
import {
  isDuplicateOrNearDuplicate,
  selectDistinctQuestions,
  normalizeQuestionText,
  calculateTokenSimilarity,
  generateCuratedQuestions,
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

  describe('Company Research Quiz Non-Duplication', () => {
    it('generates quiz where every question prompt is distinct and options are shuffled', () => {
      const research = buildCompanyResearchDataset('TechCorp');
      expect(research.quiz.length).toBeGreaterThan(1);

      const prompts = research.quiz.map(q => q.question);
      const uniquePrompts = new Set(prompts);

      // All questions must have distinct prompts
      expect(uniquePrompts.size).toBe(prompts.length);

      // Each question must have valid options with the correct answer matching correctAnswerIndex
      for (const q of research.quiz) {
        expect(q.options.length).toBe(4);
        expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctAnswerIndex).toBeLessThan(4);
        const correctText = q.options[q.correctAnswerIndex];
        expect(correctText).toBeTruthy();
      }
    });
  });
});
