import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  startOrResumeWorkflow,
  getWorkflowStatus,
  cancelWorkflowHandler
} from '../controllers/workflow.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/start/:applicationId', startOrResumeWorkflow);
router.get('/status/:applicationId', getWorkflowStatus);
router.post('/cancel/:applicationId', cancelWorkflowHandler);

export default router;
