import express from 'express';
import { register, login, refreshToken, logout, requestPasswordReset, verifyPasswordReset } from '../controllers/authController.js';
import { requestCode, verifyCode, resendCode } from '../controllers/otpController.js';
import { validate } from '../middleware/validation.js';
import { registerSchema, loginSchema, requestPasswordResetSchema, verifyPasswordResetSchema } from '../validators/authValidator.js';
import { requestCodeSchema, verifyCodeSchema, resendCodeSchema } from '../validators/otpValidator.js';

const router = express.Router();

// Registration
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// OTP-based authentication
router.post('/request-code', validate(requestCodeSchema), requestCode);
router.post('/verify-code', validate(verifyCodeSchema), verifyCode);
router.post('/resend-code', validate(resendCodeSchema), resendCode);

// Token management
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Password reset with OTP
router.post('/password-reset/request', validate(requestPasswordResetSchema), requestPasswordReset);
router.post('/password-reset/verify', validate(verifyPasswordResetSchema), verifyPasswordReset);

export default router;
