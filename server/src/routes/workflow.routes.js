import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  startOrResumeWorkflow,
  getWorkflowStatus
} from '../controllers/workflow.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/start/:applicationId', startOrResumeWorkflow);
router.get('/status/:applicationId', getWorkflowStatus);

export default router;
