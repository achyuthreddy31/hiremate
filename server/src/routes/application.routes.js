import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { applicationSchema } from '../validators/auth.validator.js';
import {
  getApplications,
  createApplication,
  getApplicationById,
  updateApplication,
  deleteApplication
} from '../controllers/application.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', getApplications);
router.post('/', validateRequest({ body: applicationSchema }), createApplication);
router.get('/:id', getApplicationById);
router.put('/:id', validateRequest({ body: applicationSchema.partial() }), updateApplication);
router.delete('/:id', deleteApplication);

export default router;
