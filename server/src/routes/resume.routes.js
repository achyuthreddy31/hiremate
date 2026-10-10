import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { uploadResume } from '../middleware/upload.middleware.js';
import {
  uploadAndParseResume,
  getResumeData,
  updateResumeData
} from '../controllers/resume.controller.js';

const router = express.Router();

router.use(requireAuth);

router.post('/upload', uploadResume.single('resume'), uploadAndParseResume);
router.get('/:applicationId', getResumeData);
router.put('/:applicationId', updateResumeData);

export default router;
