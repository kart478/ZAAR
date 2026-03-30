import { createOTPCode, verifyOTPCode, canResendOTP, store } from '../data/store.js';
import emailService from '../utils/emailService.js';
import { generateTokens } from '../utils/jwt.js';
import { createSuccessResponse, createErrorResponse, sendResponse } from '../utils/response.js';

// Request OTP code
export const requestCode = async (req, res) => {
  try {
    console.log('OTP Request received:', req.body);
    const { email, purpose } = req.body;

    if (!email || !purpose) {
      console.log('Missing email or purpose');
      return sendResponse(res, 400, createErrorResponse('Email and purpose are required'));
    }

    console.log('Looking for user with email:', email);
    // Check if user exists for login purpose
    if (purpose === 'login') {
      const user = Array.from(store.users.values()).find(u => u.email === email);
      console.log('Found user:', user ? user.name : 'Not found');
      if (!user) {
        return sendResponse(res, 404, createErrorResponse('User not found'));
      }
    }

    // Check cooldown
    const cooldownCheck = canResendOTP(email, purpose);
    if (!cooldownCheck.canResend) {
      return sendResponse(res, 429, createErrorResponse(
        `Please wait ${cooldownCheck.cooldownSeconds} seconds before requesting another code`
      ));
    }

    // Generate and store OTP code
    const code = createOTPCode(email, purpose);

    // Send OTP via email
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_EMAIL === 'true') {
      try {
        const emailResult = await emailService.sendOTP(email, code, purpose);
        if (!emailResult.success) {
          console.error('Failed to send email:', emailResult.error);
          // In production you might want to return an error, but for now we'll log it
          // and potentially return an error response if critical
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
      }
    } else {
      console.log(`[DEV] OTP Code for ${email}: ${code}`); // For development/testing without email
    }

    sendResponse(res, 200, createSuccessResponse({
      delivery: 'email',
      cooldownSeconds: 60
    }, 'Code sent successfully'));

  } catch (error) {
    console.error('Request code error:', error);
    sendResponse(res, 500, createErrorResponse('Failed to send code'));
  }
};

// Verify OTP code
export const verifyCode = async (req, res) => {
  try {
    const { email, code, purpose } = req.body;

    // Verify the code
    const verification = verifyOTPCode(email, code, purpose);

    if (!verification.valid) {
      return sendResponse(res, 400, createErrorResponse(verification.error));
    }

    // For login purpose, find the user and generate tokens
    if (purpose === 'login') {
      const user = Array.from(store.users.values()).find(u => u.email === email);
      if (!user) {
        return sendResponse(res, 404, createErrorResponse('User not found'));
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user.id);

      // Store refresh token
      store.refreshTokens.add(refreshToken);

      // Set refresh token in httpOnly cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Return user data and access token
      const { password, ...userWithoutPassword } = user;
      sendResponse(res, 200, createSuccessResponse({
        user: userWithoutPassword,
        accessToken
      }, 'Code verified successfully'));
    } else {
      // For signup purpose, just confirm verification
      sendResponse(res, 200, createSuccessResponse(null, 'Email verified successfully'));
    }

  } catch (error) {
    console.error('Verify code error:', error);
    sendResponse(res, 500, createErrorResponse('Failed to verify code'));
  }
};

// Resend OTP code
export const resendCode = async (req, res) => {
  try {
    const { email, purpose } = req.body;

    // Check cooldown
    const cooldownCheck = canResendOTP(email, purpose);
    if (!cooldownCheck.canResend) {
      return sendResponse(res, 429, createErrorResponse(
        `Please wait ${cooldownCheck.cooldownSeconds} seconds before requesting another code`
      ));
    }

    // Generate new OTP code
    const code = createOTPCode(email, purpose);

    // Send OTP via email
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_EMAIL === 'true') {
      emailService.sendOTP(email, code, purpose).catch(err => console.error('Resend email error:', err));
    } else {
      console.log(`[DEV] OTP Code for ${email}: ${code}`); // For development
    }

    sendResponse(res, 200, createSuccessResponse({
      cooldownSeconds: 60
    }, 'Code resent successfully'));

  } catch (error) {
    console.error('Resend code error:', error);
    sendResponse(res, 500, createErrorResponse('Failed to resend code'));
  }
};
