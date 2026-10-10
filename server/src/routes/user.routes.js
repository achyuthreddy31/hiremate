import express from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { userProfileSchema } from '../validators/auth.validator.js';
import { getProfile, upsertProfile, deleteAccount } from '../controllers/user.controller.js';

const router = express.Router();

router.use(requireAuth);

router.get('/profile', getProfile);
router.put('/profile', validateRequest({ body: userProfileSchema }), upsertProfile);
router.delete('/account', deleteAccount);

export default router;
