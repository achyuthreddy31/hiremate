import { PracticeQuestion } from '../models/practiceQuestion.model.js';
import { PracticeAttempt } from '../models/practiceAttempt.model.js';
import { JobAnalysis } from '../models/jobAnalysis.model.js';
import {
  generateCuratedQuestions,
  generateAiPracticeQuestions,
  selectDistinctQuestions,
  isDuplicateOrNearDuplicate
} from '../services/practice.service.js';
import { evaluateAdaptiveDifficulty } from '../services/scoring/adaptiveDifficulty.js';

export async function generatePracticeQuestions(req, res) {
  try {
    const { applicationId } = req.params;
    const isReset = req.query.reset === 'true';

    // Optional manual reset of practice progress
    if (isReset) {
      await PracticeAttempt.deleteMany({ applicationId, firebaseUid: req.user.uid });
      await PracticeQuestion.updateMany(
        { applicationId, firebaseUid: req.user.uid },
        { $set: { served: false, testSessionId: null } }
      );
    }

    // 1. Fetch past attempts to identify already served / completed question IDs
    const attempts = await PracticeAttempt.find({
      applicationId,
      firebaseUid: req.user.uid
    }).select('questionId isCorrect timeTakenSeconds topic difficulty');

    const attemptedIds = attempts.map(a => String(a.questionId));
    const attemptedIdSet = new Set(attemptedIds);

    // 2. Fetch existing questions for this application
    const existingDocs = await PracticeQuestion.find({
      applicationId,
      firebaseUid: req.user.uid
    });

    const attemptedQuestionsTexts = existingDocs
      .filter(q => attemptedIdSet.has(String(q._id)))
      .map(q => q.question);

    // 3. Determine target adaptive difficulty based on recent attempt history
    let targetDifficulty = 'medium';
    if (attempts.length >= 5) {
      const recent = attempts.slice(-5);
      const acc = recent.filter(a => a.isCorrect).length / 5;
      if (acc >= 0.80) targetDifficulty = 'hard';
      else if (acc < 0.40) targetDifficulty = 'easy';
    }

    // 4. Check available unattempted questions in existing database bank
    let unattempted = existingDocs.filter(q => !attemptedIdSet.has(String(q._id)));

    // 5. If fewer than 10 unattempted questions remain, generate fresh distinct questions
    if (unattempted.length < 10) {
      const jobAnalysis = await JobAnalysis.findOne({ applicationId, firebaseUid: req.user.uid });
      const requirements = jobAnalysis?.requirements || [];
      const skills = requirements.map(r => r.normalizedName || r.name);

      // Try AI question generation first if Gemini client is available
      const aiQuestions = await generateAiPracticeQuestions({
        applicationId,
        firebaseUid: req.user.uid,
        skills,
        difficulty: targetDifficulty,
        count: 5,
        existingQuestions: existingDocs
      });

      // Curate deterministic questions passing existing questions to avoid any duplicate
      const combinedExisting = [...existingDocs, ...aiQuestions];
      const curated = generateCuratedQuestions({
        applicationId,
        firebaseUid: req.user.uid,
        requirements,
        count: 15,
        targetDifficulty,
        existingQuestions: combinedExisting
      });

      const newCandidates = [...aiQuestions, ...curated];

      // Insert only genuinely new non-duplicate questions
      const toInsert = [];
      for (const cand of newCandidates) {
        if (!isDuplicateOrNearDuplicate(cand, existingDocs) && !isDuplicateOrNearDuplicate(cand, toInsert)) {
          toInsert.push(cand);
        }
      }

      if (toInsert.length > 0) {
        const inserted = await PracticeQuestion.insertMany(toInsert);
        unattempted = [...unattempted, ...inserted];
      }
    }

    // 6. Select distinct questions for this session, strictly excluding previously attempted questions
    const selected = selectDistinctQuestions({
      pool: unattempted,
      count: 10,
      excludeIds: attemptedIds,
      excludeQuestions: attemptedQuestionsTexts,
      targetDifficulty
    });

    // 7. Handle exhausted question bank gracefully
    if (selected.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        exhausted: true,
        message: 'All available practice questions for your target skills have been completed. You have achieved full coverage.'
      });
    }

    // 8. Assign new session ID and mark selected questions as served
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const selectedIds = selected.map(q => q._id);

    await PracticeQuestion.updateMany(
      { _id: { $in: selectedIds } },
      { $set: { testSessionId: sessionId, served: true, servedAt: new Date() } }
    );

    // Return client-safe questions without correctAnswer
    const clientSafe = selected.map(q => {
      const obj = typeof q.toObject === 'function' ? q.toObject() : { ...q };
      delete obj.correctAnswer;
      return obj;
    });

    return res.status(200).json({
      success: true,
      data: clientSafe,
      sessionId,
      exhausted: false
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

    // Fetch all attempted question IDs for this user & application
    const attempts = await PracticeAttempt.find({
      applicationId,
      firebaseUid: req.user.uid
    }).select('questionId testSessionId');

    const attemptedIdSet = new Set(attempts.map(a => String(a.questionId)));

    // Fetch unattempted questions
    let unattempted = await PracticeQuestion.find({
      applicationId,
      firebaseUid: req.user.uid,
      _id: { $nin: Array.from(attemptedIdSet) }
    }).select('-correctAnswer');

    // If an active session exists, focus on remaining questions in that session
    const latestServed = await PracticeQuestion.findOne({
      applicationId,
      firebaseUid: req.user.uid,
      testSessionId: { $ne: null }
    }).sort({ updatedAt: -1 });

    if (latestServed?.testSessionId) {
      const sessionRemaining = unattempted.filter(q => q.testSessionId === latestServed.testSessionId);
      if (sessionRemaining.length > 0) {
        unattempted = sessionRemaining;
      }
    }

    return res.status(200).json({
      success: true,
      data: unattempted.slice(0, 10),
      exhausted: unattempted.length === 0
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'FETCH_ERROR', message: error.message }
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
    }).select('+correctAnswer');

    if (!question) {
      return res.status(404).json({
        success: false,
        error: { code: 'QUESTION_NOT_FOUND', message: 'Question not found' }
      });
    }

    const isCorrect = String(answer).trim() === String(question.correctAnswer).trim();

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
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
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
