import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/userValidator.js';

const router = express.Router();

router.get('/me', requireAuth, getProfile);
router.patch('/me', requireAuth, validate(updateProfileSchema), updateProfile);
router.patch('/me/password', requireAuth, validate(changePasswordSchema), changePassword);

export default router;
