import { PracticeQuestion } from '../models/practiceQuestion.model.js';
import { PracticeAttempt } from '../models/practiceAttempt.model.js';
import { JobAnalysis } from '../models/jobAnalysis.model.js';
import { generateCuratedQuestions } from '../services/practice.service.js';
import { evaluateAdaptiveDifficulty } from '../services/scoring/adaptiveDifficulty.js';

export async function generatePracticeQuestions(req, res) {
  try {
    const { applicationId } = req.params;
    const jobAnalysis = await JobAnalysis.findOne({ applicationId, firebaseUid: req.user.uid });

    const requirements = jobAnalysis?.requirements || [];
    const questions = generateCuratedQuestions({
      applicationId,
      firebaseUid: req.user.uid,
      requirements
    });

    await PracticeQuestion.deleteMany({ applicationId, firebaseUid: req.user.uid });
    const inserted = await PracticeQuestion.insertMany(questions);

    // Return without correctAnswer
    const clientSafe = inserted.map(q => {
      const obj = q.toObject();
      delete obj.correctAnswer;
      return obj;
    });

    return res.status(200).json({
      success: true,
      data: clientSafe
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
    const questions = await PracticeQuestion.find({ applicationId, firebaseUid: req.user.uid });
    return res.status(200).json({
      success: true,
      data: questions
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
