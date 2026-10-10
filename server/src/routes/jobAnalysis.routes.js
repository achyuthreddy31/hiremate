import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  analyzeJob,
  getJobAnalysis,
  runJobMatch,
  getMatchReport,
  getMatchHistory
} from '../controllers/jobAnalysis.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/analyze/:applicationId', analyzeJob);
router.get('/analysis/:applicationId', getJobAnalysis);
router.post('/match/:applicationId', runJobMatch);
router.get('/match/:applicationId', getMatchReport);
router.get('/history/:applicationId', getMatchHistory);

export default router;
