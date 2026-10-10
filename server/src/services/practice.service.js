import { evaluateAdaptiveDifficulty } from './scoring/adaptiveDifficulty.js';

/**
 * Fisher-Yates array shuffling to avoid option position biases.
 */
export function shuffleArray(array = []) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Validates a practice question per Section 5.8:
 * - Exactly one correct option
 * - Distinct options
 * - Non-empty explanation
 * - Linked requirement
 */
export function validateQuestionFormat(q) {
  if (!q.question || !q.explanation || !q.requirementRef) return false;
  if (!Array.isArray(q.options) || q.options.length < 2) return false;

  // Distinct options
  const uniqueOpts = new Set(q.options.map(o => o.trim()));
  if (uniqueOpts.size !== q.options.length) return false;

  // Exactly one correct option that exists in options
  if (!q.correctAnswer || !q.options.includes(q.correctAnswer)) return false;

  return true;
}

/**
 * Deterministic generator for 10-question practice test and coding modules.
 */
export function generateCuratedQuestions({ applicationId, firebaseUid, requirements = [] }) {
  const questions = [];
  const activeSkills = requirements.slice(0, 5).map(r => r.normalizedName || r.name);
  const pool = activeSkills.length > 0 ? activeSkills : ['JavaScript', 'Algorithms', 'Web Development'];

  let count = 0;
  for (const skill of pool) {
    // 1. Technical MCQ
    const mcqRaw = {
      firebaseUid,
      applicationId,
      type: 'mcq',
      question: `In modern software architecture, what is a primary design benefit of utilizing ${skill}?`,
      options: [
        `Provides standardized abstractions and modular maintainability for ${skill}.`,
        `Eliminates the requirement for any automated integration testing.`,
        `Directly converts all asynchronous network calls into blocking operations.`,
        `Bypasses operating system memory safety rules automatically.`
      ],
      correctAnswer: `Provides standardized abstractions and modular maintainability for ${skill}.`,
      explanation: `${skill} provides structured paradigms and community-tested architectural patterns.`,
      difficulty: 'medium',
      skill,
      requirementRef: skill,
      expectedTimeSeconds: 45
    };
    mcqRaw.options = shuffleArray(mcqRaw.options);
    if (validateQuestionFormat(mcqRaw)) questions.push(mcqRaw);
    count++;

    // 2. Auto-graded Coding Item (Debugging / Output Prediction)
    const codingRaw = {
      firebaseUid,
      applicationId,
      type: 'output_prediction',
      question: `Consider the following function execution in ${skill}. What is the exact expected console output?`,
      codeSnippet: `function evaluate(val) {\n  let result = val * 2;\n  return result > 10 ? 'HIGH' : 'LOW';\n}\nconsole.log(evaluate(6));`,
      options: ['HIGH', 'LOW', 'undefined', 'ReferenceError'],
      correctAnswer: 'HIGH',
      explanation: '6 * 2 is 12, which is greater than 10, evaluating the ternary branch to "HIGH".',
      difficulty: 'medium',
      skill,
      requirementRef: skill,
      expectedTimeSeconds: 60
    };
    codingRaw.options = shuffleArray(codingRaw.options);
    if (validateQuestionFormat(codingRaw)) questions.push(codingRaw);
    count++;

    if (count >= 10) break;
  }

  // Ensure exactly 10 questions for full test suite
  while (questions.length < 10) {
    const idx = questions.length + 1;
    const genericQ = {
      firebaseUid,
      applicationId,
      type: idx % 2 === 0 ? 'debugging' : 'scenario',
      question: `Scenario #${idx}: How should an engineer resolve a high-latency bottleneck when querying large datasets in ${pool[0]}?`,
      options: [
        'Add proper indexing and implement pagination/caching strategies.',
        'Load the entire unindexed dataset into client-side component memory.',
        'Convert all database tables to raw unstructured text files.',
        'Disable request rate limiters and retry loops.'
      ],
      correctAnswer: 'Add proper indexing and implement pagination/caching strategies.',
      explanation: 'Indexing and caching reduce database query execution time and server load.',
      difficulty: 'medium',
      skill: pool[0],
      requirementRef: pool[0],
      expectedTimeSeconds: 50
    };
    genericQ.options = shuffleArray(genericQ.options);
    if (validateQuestionFormat(genericQ)) questions.push(genericQ);
  }

  return questions.slice(0, 10);
}
