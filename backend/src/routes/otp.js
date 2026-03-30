import express from 'express';
import { validateBody } from '../middleware/validation.js';
import { requestCodeSchema, verifyCodeSchema, resendCodeSchema } from '../validators/otpValidator.js';
import { requestCode, verifyCode, resendCode } from '../controllers/otpController.js';

const router = express.Router();

// Request OTP code
router.post('/request-code', validateBody(requestCodeSchema), requestCode);

// Verify OTP code
router.post('/verify-code', validateBody(verifyCodeSchema), verifyCode);

// Resend OTP code
router.post('/resend-code', validateBody(resendCodeSchema), resendCode);

export default router;
