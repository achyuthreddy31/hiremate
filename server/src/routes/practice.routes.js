import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  generatePracticeQuestions,
  getPracticeQuestions,
  submitQuestionAttempt,
  getTopicPerformance
} from '../controllers/practice.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/generate/:applicationId', generatePracticeQuestions);
router.get('/:applicationId', getPracticeQuestions);
router.post('/submit/:applicationId/:questionId', submitQuestionAttempt);
router.get('/performance/:applicationId', getTopicPerformance);

export default router;
