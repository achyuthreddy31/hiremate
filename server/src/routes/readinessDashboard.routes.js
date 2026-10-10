import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  calculateAndSaveReadiness,
  getReadinessSnapshot,
  generateFinalChecklist,
  getChecklist,
  updateChecklistItem,
  getDashboardOverview
} from '../controllers/readinessDashboard.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/readiness/:applicationId', calculateAndSaveReadiness);
router.get('/readiness/:applicationId', getReadinessSnapshot);
router.post('/checklist/:applicationId', generateFinalChecklist);
router.get('/checklist/:applicationId', getChecklist);
router.patch('/checklist/:applicationId/:itemIndex', updateChecklistItem);
router.get('/overview/:applicationId', getDashboardOverview);

export default router;
