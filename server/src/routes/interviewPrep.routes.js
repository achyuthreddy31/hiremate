import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  generateInterviewPrep,
  getInterviewPrep,
  updateQuestionStatus,
  getResumeImprovements
} from '../controllers/interviewPrep.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/generate/:applicationId', generateInterviewPrep);
router.get('/:applicationId', getInterviewPrep);
router.patch('/:applicationId/questions/:questionType/:questionIndex', updateQuestionStatus);
router.get('/resume-improvements/:applicationId', getResumeImprovements);

export default router;
