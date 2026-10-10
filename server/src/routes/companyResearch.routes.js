import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  generateCompanyResearch,
  getCompanyResearch,
  toggleSectionReviewed,
  submitQuizAnswers
} from '../controllers/companyResearch.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/generate/:applicationId', generateCompanyResearch);
router.get('/:applicationId', getCompanyResearch);
router.post('/review/:applicationId', toggleSectionReviewed);
router.post('/quiz/:applicationId', submitQuizAnswers);

export default router;
