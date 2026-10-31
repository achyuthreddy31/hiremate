import { PracticeQuestion } from '../models/practiceQuestion.model.js';
import { PracticeAttempt } from '../models/practiceAttempt.model.js';
import { JobAnalysis } from '../models/jobAnalysis.model.js';
import {
  generateCuratedQuestions,
  generateAiPracticeQuestions,
  generateTargetedPracticeQuestions,
  selectDistinctQuestions,
  isDuplicateOrNearDuplicate,
  evaluateCodingSolution,
  DIFFICULTY_MAP
} from '../services/practice.service.js';
import { evaluateAdaptiveDifficulty } from '../services/scoring/adaptiveDifficulty.js';

export async function generatePracticeQuestions(req, res) {
  try {
    const { applicationId } = req.params;
    const isReset = req.query.reset === 'true' || req.body?.reset === true;

    // Optional manual reset of practice progress
    if (isReset) {
      await PracticeAttempt.deleteMany({ applicationId, firebaseUid: req.user.uid });
      await PracticeQuestion.updateMany(
        { applicationId, firebaseUid: req.user.uid },
        { $set: { served: false, testSessionId: null } }
      );
    }

    // Extract dynamic selection controls
    const rawCategory = req.body?.category || req.query?.category || 'Programming Languages';
    const rawSkill = req.body?.skill || req.query?.skill || 'JavaScript';
    const rawDifficulty = req.body?.difficulty || req.query?.difficulty || 'Intermediate';
    const rawCount = req.body?.count || req.query?.count || 10;
    const rawMode = req.body?.mode || req.query?.mode || 'mcq';

    const difficulty = DIFFICULTY_MAP[rawDifficulty] || 'medium';
    const count = Math.max(1, Math.min(20, parseInt(rawCount, 10) || 10));
    const mode = rawMode === 'coding_challenges' ? 'coding_challenges' : 'mcq';

    // 1. Fetch past attempts to identify already answered question IDs
    const attempts = await PracticeAttempt.find({
      applicationId,
      firebaseUid: req.user.uid
    }).select('questionId isCorrect timeTakenSeconds topic difficulty');

    const attemptedIds = attempts.map(a => String(a.questionId));

    // 2. Fetch existing questions for this application
    const existingDocs = await PracticeQuestion.find({
      applicationId,
      firebaseUid: req.user.uid
    });

    // Combine both attempted IDs and previously served/active session IDs so questions from earlier sessions are never re-served
    const servedOrAttemptedIdSet = new Set([
      ...attemptedIds,
      ...existingDocs
        .filter(q => q.served === true || (q.testSessionId && q.testSessionId !== ''))
        .map(q => String(q._id))
    ]);
    const servedOrAttemptedIds = Array.from(servedOrAttemptedIdSet);

    // Scope served question texts to the specific skill and mode being evaluated
    const servedOrAttemptedQuestionsTexts = existingDocs
      .filter(q => servedOrAttemptedIdSet.has(String(q._id)))
      .filter(q => (q.skill === rawSkill || q.requirementRef === rawSkill) && (q.mode || 'mcq') === mode)
      .map(q => q.question || q.problemStatement);

    // 3. Find unattempted and unserved questions matching skill and mode
    let matchingUnattempted = existingDocs.filter(q =>
      !servedOrAttemptedIdSet.has(String(q._id)) &&
      (q.skill === rawSkill || q.requirementRef === rawSkill) &&
      (q.mode || 'mcq') === mode
    );

    const matchingWithTargetDiff = matchingUnattempted.filter(q => q.difficulty === difficulty);

    // 4. If fewer than requested count exist, generate targeted questions with a generous candidate pool
    if (matchingUnattempted.length < count || matchingWithTargetDiff.length < count) {
      const neededPool = Math.max(count * 2, 25);
      const skillExisting = existingDocs.filter(q =>
        (q.skill === rawSkill || q.requirementRef === rawSkill) &&
        (q.mode || 'mcq') === mode
      );

      const targeted = await generateTargetedPracticeQuestions({
        applicationId,
        firebaseUid: req.user.uid,
        category: rawCategory,
        skill: rawSkill,
        difficulty,
        count: neededPool,
        mode,
        existingQuestions: skillExisting,
        excludeIds: servedOrAttemptedIds
      });

      // Insert only genuinely non-duplicate questions
      const toInsert = [];
      for (const cand of targeted) {
        if (!isDuplicateOrNearDuplicate(cand, skillExisting) && !isDuplicateOrNearDuplicate(cand, toInsert)) {
          toInsert.push(cand);
        }
      }

      if (toInsert.length > 0) {
        const inserted = await PracticeQuestion.insertMany(toInsert);
        matchingUnattempted = [...matchingUnattempted, ...inserted];
      }
    }

    // 5. Select distinct questions for this session
    let selected = selectDistinctQuestions({
      pool: matchingUnattempted,
      count,
      excludeIds: servedOrAttemptedIds,
      excludeQuestions: servedOrAttemptedQuestionsTexts,
      targetDifficulty: difficulty
    });

    // Fallback fulfillment: If still below requested count, pull from any unserved questions for this skill
    if (selected.length < count) {
      const broaderUnserved = existingDocs.filter(q =>
        !servedOrAttemptedIdSet.has(String(q._id)) &&
        (q.skill === rawSkill || q.requirementRef === rawSkill) &&
        (q.mode || 'mcq') === mode &&
        !selected.some(s => String(s._id) === String(q._id))
      );

      if (broaderUnserved.length > 0) {
        const fillQuestions = selectDistinctQuestions({
          pool: broaderUnserved,
          count: count - selected.length,
          excludeIds: [...servedOrAttemptedIds, ...selected.map(s => String(s._id))],
          excludeQuestions: [...servedOrAttemptedQuestionsTexts, ...selected.map(s => s.question || s.problemStatement)],
          targetDifficulty: null
        });
        selected = [...selected, ...fillQuestions];
      }
    }

    // 6. Handle exhausted question bank gracefully
    if (selected.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        exhausted: true,
        message: `All available practice questions for ${rawSkill} have been completed. You can practice another skill or reset history.`
      });
    }

    // 7. Assign new session ID and mark selected questions as served
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const selectedIds = selected.map(q => q._id);

    await PracticeQuestion.updateMany(
      { _id: { $in: selectedIds } },
      { $set: { testSessionId: sessionId, served: true, servedAt: new Date() } }
    );

    // Return client-safe questions without correctAnswer or referenceSolution
    const clientSafe = selected.map(q => {
      const obj = typeof q.toObject === 'function' ? q.toObject() : { ...q };
      delete obj.correctAnswer;
      delete obj.referenceSolution;
      return obj;
    });

    return res.status(200).json({
      success: true,
      data: clientSafe,
      sessionId,
      exhausted: false,
      count: clientSafe.length,
      message: clientSafe.length < count
        ? `Displaying all ${clientSafe.length} available unique questions for ${rawSkill} (${rawDifficulty}).`
        : undefined
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'PRACTICE_GEN_ERROR', message: error.message }
    });
  }
}

export async function getPracticeQuestions(req, res) {
  try {
    const { applicationId } = req.params;
    const { skill, mode, difficulty, count } = req.query;

    const reqCount = count ? Math.max(1, Math.min(20, parseInt(count, 10) || 10)) : 10;
    const mappedDiff = difficulty ? (DIFFICULTY_MAP[difficulty] || difficulty) : null;

    // Fetch all attempted question IDs for this user & application
    const attempts = await PracticeAttempt.find({
      applicationId,
      firebaseUid: req.user.uid
    }).select('questionId testSessionId');

    const attemptedIdSet = new Set(attempts.map(a => String(a.questionId)));

    const filter = {
      applicationId,
      firebaseUid: req.user.uid,
      _id: { $nin: Array.from(attemptedIdSet) }
    };
    if (skill) {
      filter.$or = [{ skill }, { requirementRef: skill }];
    }
    if (mode) {
      filter.mode = mode;
    }
    if (mappedDiff) {
      filter.difficulty = mappedDiff;
    }

    // Fetch unattempted questions with correctAnswer and referenceSolution omitted
    let unattempted = await PracticeQuestion.find(filter).select('-correctAnswer -referenceSolution');

    // If an active session exists, focus on remaining questions in that session
    const sessionFilter = {
      applicationId,
      firebaseUid: req.user.uid,
      testSessionId: { $ne: null }
    };
    if (skill) {
      sessionFilter.$or = [{ skill }, { requirementRef: skill }];
    }
    if (mode) {
      sessionFilter.mode = mode;
    }

    const latestServed = await PracticeQuestion.findOne(sessionFilter).sort({ updatedAt: -1 });

    if (latestServed?.testSessionId) {
      const sessionRemaining = unattempted.filter(q => q.testSessionId === latestServed.testSessionId);
      if (sessionRemaining.length > 0) {
        unattempted = sessionRemaining;
      }
    }

    const clientSafe = unattempted.slice(0, reqCount).map(q => {
      const obj = typeof q.toObject === 'function' ? q.toObject() : { ...q };
      delete obj.correctAnswer;
      delete obj.referenceSolution;
      return obj;
    });

    return res.status(200).json({
      success: true,
      data: clientSafe,
      count: clientSafe.length,
      exhausted: unattempted.length === 0
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'PRACTICE_FETCH_ERROR', message: error.message }
    });
  }
}

export async function submitQuestionAttempt(req, res) {
  try {
    const { applicationId, questionId } = req.params;
    const { answer, timeTakenSeconds } = req.body;

    const question = await PracticeQuestion.findOne({
      _id: questionId,
      applicationId,
      firebaseUid: req.user.uid
    }).select('+correctAnswer +referenceSolution');

    if (!question) {
      return res.status(404).json({
        success: false,
        error: { code: 'QUESTION_NOT_FOUND', message: 'Question not found' }
      });
    }

    let isCorrect = false;
    let feedbackMessage = '';
    let testResults = null;

    if (question.mode === 'coding_challenges' || question.type === 'code_writing') {
      const language = req.body?.language || question.skill;
      const evalResult = await evaluateCodingSolution(answer, question.testCases, language);
      isCorrect = evalResult.allPassed;
      testResults = evalResult.results;
      feedbackMessage = isCorrect
        ? 'Well done! Keep going.'
        : (evalResult.failureReason || 'Your solution did not pass all test cases. Check the failed test cases below.');
    } else {
      isCorrect = String(answer).trim() === String(question.correctAnswer).trim();
      feedbackMessage = isCorrect
        ? 'Well done! Keep going.'
        : 'Incorrect. Review the correct option and explanation below.';
    }

    const attempt = new PracticeAttempt({
      firebaseUid: req.user.uid,
      applicationId,
      questionId,
      testSessionId: question.testSessionId || null,
      type: question.type,
      topic: question.skill,
      difficulty: question.difficulty,
      userAnswer: answer,
      isCorrect,
      timeTakenSeconds: timeTakenSeconds || 30
    });
    await attempt.save();

    // Check adaptive difficulty for this topic
    const recentAttempts = await PracticeAttempt.find({
      firebaseUid: req.user.uid,
      topic: question.skill
    }).sort({ createdAt: -1 }).limit(10);

    const adaptiveEval = evaluateAdaptiveDifficulty({
      currentDifficulty: question.difficulty,
      recentAttempts: recentAttempts.reverse(),
      expectedTimeSeconds: question.expectedTimeSeconds || 60
    });

    return res.status(200).json({
      success: true,
      data: {
        isCorrect,
        feedbackMessage,
        correctAnswer: question.correctAnswer || '',
        explanation: question.explanation,
        testResults,
        adaptiveEvaluation: adaptiveEval
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SUBMISSION_ERROR', message: error.message }
    });
  }
}

export async function getTopicPerformance(req, res) {
  try {
    const { applicationId } = req.params;
    const attempts = await PracticeAttempt.find({ applicationId, firebaseUid: req.user.uid });

    const topicStats = {};
    for (const a of attempts) {
      if (!topicStats[a.topic]) {
        topicStats[a.topic] = { total: 0, correct: 0, difficulty: a.difficulty };
      }
      topicStats[a.topic].total++;
      if (a.isCorrect) topicStats[a.topic].correct++;
    }

    const result = Object.entries(topicStats).map(([topic, data]) => ({
      topic,
      totalAttempts: data.total,
      accuracy: Math.round((data.correct / data.total) * 100),
      difficulty: data.difficulty
    }));

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'PERFORMANCE_FETCH_ERROR', message: error.message }
    });
  }
}

export async function revealQuestionSolution(req, res) {
  try {
    const { applicationId, questionId } = req.params;

    // Challenge Rule: Candidate must have attempted the challenge before reference solution disclosure is permitted
    const hasAttempted = await PracticeAttempt.exists({
      applicationId,
      firebaseUid: req.user.uid,
      questionId
    });

    if (!hasAttempted) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'SOLUTION_LOCKED',
          message: 'You must submit at least one attempt before revealing the reference solution.'
        }
      });
    }

    const question = await PracticeQuestion.findOne({
      _id: questionId,
      applicationId,
      firebaseUid: req.user.uid
    }).select('+correctAnswer +referenceSolution');

    if (!question) {
      return res.status(404).json({
        success: false,
        error: { code: 'QUESTION_NOT_FOUND', message: 'Question not found or unauthorized' }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        solution: question.referenceSolution || question.correctAnswer || '',
        explanation: question.explanation || ''
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'REVEAL_ERROR', message: error.message }
    });
  }
}
