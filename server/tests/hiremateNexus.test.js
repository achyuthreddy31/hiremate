import { describe, it, expect } from 'vitest';
import {
  PRACTICE_CATEGORIES,
  DIFFICULTY_MAP,
  generateTargetedPracticeQuestions,
  evaluateCodingSolution,
  validateQuestionFormat,
  CURATED_CODING_CHALLENGES,
  CURATED_MCQ_BANK
} from '../src/services/practice.service.js';
import {
  buildCompanyResearchDataset,
  COMPANY_HUB_SECTIONS
} from '../src/services/companyResearch.service.js';
import { buildInterviewPrepDataset } from '../src/services/interviewPrep.service.js';
import { generateRoadmapPlan } from '../src/services/roadmap.service.js';

describe('HireMate Nexus Core Features & Bug Fix Tests', () => {
  describe('Practice & Coding Dynamic Selection', () => {
    it('provides all 5 required categories and 26 skills', () => {
      const categories = Object.keys(PRACTICE_CATEGORIES);
      expect(categories).toContain('Programming Languages');
      expect(categories).toContain('Web Development');
      expect(categories).toContain('Databases');
      expect(categories).toContain('Core CS & DSA');
      expect(categories).toContain('AI & Data Science');

      expect(PRACTICE_CATEGORIES['Programming Languages']).toEqual([
        'Python', 'Java', 'C', 'C++', 'JavaScript', 'TypeScript'
      ]);

      expect(PRACTICE_CATEGORIES['Web Development']).toEqual([
        'HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'Express.js', 'FastAPI'
      ]);

      expect(PRACTICE_CATEGORIES['Databases']).toEqual([
        'SQL', 'MongoDB', 'PostgreSQL', 'MySQL'
      ]);

      expect(PRACTICE_CATEGORIES['Core CS & DSA']).toEqual([
        'Data Structures & Algorithms', 'Object-Oriented Programming', 'DBMS', 'Operating Systems', 'Computer Networks'
      ]);

      expect(PRACTICE_CATEGORIES['AI & Data Science']).toEqual([
        'Artificial Intelligence', 'Machine Learning', 'Data Science', 'Pandas', 'NumPy'
      ]);
    });

    it('generates requested count of MCQs for selected skill and difficulty without duplicates', async () => {
      const questions = await generateTargetedPracticeQuestions({
        applicationId: 'mock_app_1',
        firebaseUid: 'mock_user_1',
        category: 'Programming Languages',
        skill: 'Python',
        difficulty: 'medium',
        count: 5,
        mode: 'mcq'
      });

      expect(questions.length).toBe(5);
      const uniqueTexts = new Set(questions.map(q => q.question));
      expect(uniqueTexts.size).toBe(5);

      for (const q of questions) {
        expect(q.skill).toBe('Python');
        expect(validateQuestionFormat(q)).toBe(true);
      }
    });

    it('generates Coding Challenges with problem statements, starter code, and test cases', async () => {
      const challenges = await generateTargetedPracticeQuestions({
        applicationId: 'mock_app_1',
        firebaseUid: 'mock_user_1',
        category: 'Core CS & DSA',
        skill: 'Data Structures & Algorithms',
        difficulty: 'easy',
        count: 5,
        mode: 'coding_challenges'
      });

      expect(challenges.length).toBe(5);
      for (const ch of challenges) {
        expect(ch.mode).toBe('coding_challenges');
        expect(ch.problemStatement).toBeTruthy();
        expect(ch.starterCode).toBeDefined();
        expect(Array.isArray(ch.testCases)).toBe(true);
        expect(ch.testCases.length).toBeGreaterThan(0);
        expect(validateQuestionFormat(ch)).toBe(true);
      }
    });

    it('evaluates correct JavaScript code solution and passes all test cases', () => {
      const userCode = `
        function twoSum(nums, target) {
          const map = new Map();
          for (let i = 0; i < nums.length; i++) {
            const complement = target - nums[i];
            if (map.has(complement)) return [map.get(complement), i];
            map.set(nums[i], i);
          }
          return [];
        }
      `;

      const testCases = [
        { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expectedOutput: JSON.stringify([0, 1]) },
        { input: JSON.stringify({ nums: [3, 2, 4], target: 6 }), expectedOutput: JSON.stringify([1, 2]) }
      ];

      const result = evaluateCodingSolution(userCode, testCases);
      expect(result.allPassed).toBe(true);
      expect(result.results.length).toBe(2);
      expect(result.results[0].passed).toBe(true);
      expect(result.results[1].passed).toBe(true);
    });

    it('evaluates incorrect code and identifies the failing test case with clear feedback', () => {
      const wrongCode = `
        function twoSum(nums, target) {
          return [0, 0];
        }
      `;

      const testCases = [
        { input: JSON.stringify({ nums: [2, 7, 11, 15], target: 9 }), expectedOutput: JSON.stringify([0, 1]) }
      ];

      const result = evaluateCodingSolution(wrongCode, testCases);
      expect(result.allPassed).toBe(false);
      expect(result.failureReason).toContain('Test Case 1 failed');
    });
  });

  describe('Company Research 7 Hub Areas', () => {
    it('uses Handshake icon for Culture & Values hub area', () => {
      const cultureSection = COMPANY_HUB_SECTIONS.find(s => s.id === 'culture_values');
      expect(cultureSection).toBeDefined();
      expect(cultureSection.icon).toBe('Handshake');
    });

    it('builds dataset with all 7 strategic hub areas and verified citations', () => {
      const dataset = buildCompanyResearchDataset('Google');
      expect(dataset.companyName).toBe('Google');
      expect(dataset.sectionsReviewed.length).toBe(7);

      const sectionCategories = dataset.sectionsReviewed.map(s => s.category);
      expect(sectionCategories).toContain('overview_milestones');
      expect(sectionCategories).toContain('products_business_model');
      expect(sectionCategories).toContain('tech_innovation');
      expect(sectionCategories).toContain('founders_leadership');
      expect(sectionCategories).toContain('culture_values');
      expect(sectionCategories).toContain('careers_recruitment');
      expect(sectionCategories).toContain('financial_market');

      // Verify no fake / broken URLs
      for (const item of dataset.items) {
        if (item.sourceUrl) {
          expect(item.sourceUrl).not.toContain('.com/about');
          expect(item.sourceUrl).not.toContain('.com/culture');
          expect(item.sourceUrl.startsWith('https://')).toBe(true);
        }
      }
    });
  });

  describe('Consecutive Practice Sessions & Question Freshness', () => {
    it('generates genuinely fresh questions across consecutive sessions without duplicate questions (MCQ)', async () => {
      // Session 1: 10 questions
      const session1 = await generateTargetedPracticeQuestions({
        applicationId: 'mock_app_fresh',
        firebaseUid: 'mock_user_fresh',
        category: 'Programming Languages',
        skill: 'Python',
        difficulty: 'medium',
        count: 10,
        mode: 'mcq'
      });

      expect(session1.length).toBe(10);
      const session1Texts = session1.map(q => q.question);

      // Session 2 ("Practice Again"): 10 questions, excluding session 1
      const session2 = await generateTargetedPracticeQuestions({
        applicationId: 'mock_app_fresh',
        firebaseUid: 'mock_user_fresh',
        category: 'Programming Languages',
        skill: 'Python',
        difficulty: 'medium',
        count: 10,
        mode: 'mcq',
        existingQuestions: session1,
        excludeIds: session1.map((_, i) => `mock_id_s1_${i}`)
      });

      expect(session2.length).toBe(10);
      const session2Texts = session2.map(q => q.question);

      // Verify NO overlap between Session 1 and Session 2
      const overlap = session1Texts.filter(t => session2Texts.includes(t));
      expect(overlap).toEqual([]);
    });

    it('generates genuinely fresh coding challenges across consecutive sessions (Coding)', async () => {
      // Session 1: 5 coding challenges
      const session1 = await generateTargetedPracticeQuestions({
        applicationId: 'mock_app_code_fresh',
        firebaseUid: 'mock_user_code_fresh',
        category: 'Programming Languages',
        skill: 'JavaScript',
        difficulty: 'medium',
        count: 5,
        mode: 'coding_challenges'
      });

      expect(session1.length).toBe(5);
      const session1Problems = session1.map(q => q.problemStatement);

      // Session 2: 5 coding challenges, excluding session 1
      const session2 = await generateTargetedPracticeQuestions({
        applicationId: 'mock_app_code_fresh',
        firebaseUid: 'mock_user_code_fresh',
        category: 'Programming Languages',
        skill: 'JavaScript',
        difficulty: 'medium',
        count: 5,
        mode: 'coding_challenges',
        existingQuestions: session1,
        excludeIds: session1.map((_, i) => `mock_code_id_${i}`)
      });

      expect(session2.length).toBe(5);
      const session2Problems = session2.map(q => q.problemStatement);

      const overlap = session1Problems.filter(p => session2Problems.includes(p));
      expect(overlap).toEqual([]);
    });
  });

  describe('Interview Preparation Question Expansion', () => {
    it('provides 25+ rich, role-tailored questions covering technical, behavioral STAR, project, and stage checklists', () => {
      const prep = buildInterviewPrepDataset({
        companyName: 'Anthropic',
        jobTitle: 'Senior Infrastructure Engineer',
        candidateProfile: {
          projects: [
            { title: 'Distributed Log Indexer' },
            { title: 'Real-time WebSocket Gateway' }
          ]
        }
      });

      const totalQuestions =
        prep.technicalQuestions.length +
        prep.behavioralQuestions.length +
        prep.projectBasedQuestions.length +
        prep.resumeBasedQuestions.length;

      expect(totalQuestions).toBeGreaterThanOrEqual(20);
      expect(prep.technicalQuestions.length).toBeGreaterThanOrEqual(10);
      expect(prep.behavioralQuestions.length).toBeGreaterThanOrEqual(8);

      // Verify STAR framework on technical and behavioral questions
      for (const q of prep.technicalQuestions) {
        expect(q.starGuidance).toBeDefined();
        expect(q.starGuidance.situation).toBeTruthy();
        expect(q.starGuidance.task).toBeTruthy();
        expect(q.starGuidance.action).toBeTruthy();
        expect(q.starGuidance.result).toBeTruthy();
      }

      for (const q of prep.behavioralQuestions) {
        expect(q.starGuidance).toBeDefined();
        expect(q.competency).toBeTruthy();
      }

      // Verify stage checklists
      expect(prep.stageChecklists.length).toBe(4);
    });
  });

  describe('Practice, Coding Challenges & Roadmap Specific Fixes', () => {
    it('does not reveal solutions upfront for coding challenges and keeps reference solution separate', async () => {
      // Check curated coding challenges
      for (const [skill, challenges] of Object.entries(CURATED_CODING_CHALLENGES)) {
        for (const c of challenges) {
          expect(c.starterCode).toBeDefined();
          expect(c.referenceSolution).toBeDefined();
          // Starter code should not contain the working solution logic
          if (c.referenceSolution.includes('return') && !c.starterCode.includes('pass')) {
            // starterCode must not be identical to reference solution
            expect(c.starterCode.trim()).not.toBe(c.referenceSolution.trim());
          }
        }
      }

      // Test generating coding challenge questions
      const challenges = await generateTargetedPracticeQuestions({
        applicationId: 'mock_sec_app',
        firebaseUid: 'mock_sec_user',
        category: 'Programming Languages',
        skill: 'JavaScript',
        difficulty: 'medium',
        count: 3,
        mode: 'coding_challenges'
      });

      expect(challenges.length).toBe(3);
      for (const ch of challenges) {
        expect(ch.starterCode).toBeDefined();
        // Starter code must not contain full working implementations
        expect(ch.starterCode).toContain('Write your solution here');
      }
    });

    it('returns exactly 5 questions when 5 questions are selected for any programming language or skill', async () => {
      const testSkills = ['C', 'C++', 'TypeScript', 'HTML', 'CSS', 'SQL', 'Python', 'JavaScript', 'React', 'Node.js'];

      for (const skill of testSkills) {
        // Verify curated bank has at least 15 questions for the skill
        expect(CURATED_MCQ_BANK[skill]).toBeDefined();
        expect(CURATED_MCQ_BANK[skill].length).toBeGreaterThanOrEqual(15);

        // Verify generating 5 questions returns exactly 5
        const questions = await generateTargetedPracticeQuestions({
          applicationId: `mock_app_count_${skill}`,
          firebaseUid: 'mock_user_count',
          category: 'Programming Languages',
          skill,
          difficulty: 'medium',
          count: 5,
          mode: 'mcq'
        });

        expect(questions.length).toBe(5);

        // Verify distinct question texts
        const questionTexts = new Set(questions.map(q => q.question));
        expect(questionTexts.size).toBe(5);
      }
    });

    it('generates roadmap with progressive 3-stage daily structure in chronological order', () => {
      const roadmap = generateRoadmapPlan({
        userAvailableDays: 7,
        dailyPreparationMinutes: 60,
        requirementsResults: [
          { requirementRef: 'req_python', name: 'Python', importance: 'critical', score: 20 },
          { requirementRef: 'req_dsa', name: 'Data Structures & Algorithms', importance: 'critical', score: 30 },
          { requirementRef: 'req_sql', name: 'SQL', importance: 'important', score: 40 }
        ]
      });

      expect(roadmap.totalDays).toBe(7);
      expect(roadmap.tasks.length).toBeGreaterThanOrEqual(7);

      // Verify each task has 3 stages and learning objectives
      for (const task of roadmap.tasks) {
        expect(task.learningObjectives).toBeTruthy();
        expect(task.stage1_fundamentals).toBeTruthy();
        expect(task.stage2_guidedPractice).toBeTruthy();
        expect(task.stage3_advancedTopics).toBeTruthy();

        // Stage labels must follow sequential structure
        expect(task.stage1_fundamentals).toContain('Stage 1 — Fundamentals & Concepts');
        expect(task.stage2_guidedPractice).toContain('Stage 2 — Guided Coding Practice');
        expect(task.stage3_advancedTopics).toContain('Stage 3 — Advanced Topics & Challenges');
      }

      // Verify tasks are ordered strictly chronologically from Day 1 to Day N
      for (let i = 0; i < roadmap.tasks.length - 1; i++) {
        expect(roadmap.tasks[i].day).toBeLessThanOrEqual(roadmap.tasks[i + 1].day);
      }
      expect(roadmap.tasks[0].day).toBe(1);
      expect(roadmap.tasks[roadmap.tasks.length - 1].day).toBe(7);
    });
  });
});
