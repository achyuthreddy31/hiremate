import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  generateRoadmap,
  getRoadmap,
  updateTaskStatus,
  getRecommendations
} from '../controllers/roadmap.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/generate/:applicationId', generateRoadmap);
router.get('/:applicationId', getRoadmap);
router.patch('/:applicationId/tasks/:taskId', updateTaskStatus);
router.get('/recommendations/:applicationId', getRecommendations);

export default router;
