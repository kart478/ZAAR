import { store, generateId, createOTPCode, verifyOTPCode, canResendOTP } from '../data/store.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { createSuccessResponse, createErrorResponse, sendResponse } from '../utils/response.js';

const getRefreshToken = (req) => {
  if (req.body?.refreshToken) {
    return req.body.refreshToken;
  }

  const cookieHeader = req.headers.cookie || '';
  const refreshCookie = cookieHeader.split(';').find(cookie => cookie.trim().startsWith('refreshToken='));
  return refreshCookie ? decodeURIComponent(refreshCookie.trim().slice('refreshToken='.length)) : null;
};

const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const register = async (req, res) => {
  try {
    const { name, username, email, password, bio, interests } = req.body;

    // Check if user already exists
    const existingUser = Array.from(store.users.values()).find(
      user => user.email === email || user.username === username
    );

    if (existingUser) {
      return sendResponse(res, 409, createErrorResponse('User with this email or username already exists'));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = {
      id: generateId(),
      name,
      username,
      email,
      password: hashedPassword,
      bio: bio || '',
      interests: interests || [],
      avatarUrl: null,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    store.users.set(user.id, user);

    // Generate tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    store.refreshTokens.add(refreshToken);
    setRefreshTokenCookie(res, refreshToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    sendResponse(res, 201, createSuccessResponse({
      user: userWithoutPassword,
      accessToken,
      refreshToken
    }, 'User registered successfully'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Registration failed'));
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: '***' });

    // Find user
    const user = Array.from(store.users.values()).find(u => u.email === email);
    if (!user) {
      console.log('User not found:', email);
      return sendResponse(res, 401, createErrorResponse('Invalid credentials'));
    }

    console.log('User found:', user.name);
    console.log('Stored hash:', user.password);

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      return sendResponse(res, 401, createErrorResponse('Invalid credentials'));
    }

    // Generate tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    store.refreshTokens.add(refreshToken);
    setRefreshTokenCookie(res, refreshToken);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    sendResponse(res, 200, createSuccessResponse({
      user: userWithoutPassword,
      accessToken,
      refreshToken
    }, 'Login successful'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Login failed'));
  }
};

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = getRefreshToken(req);

    if (!refreshToken || !store.refreshTokens.has(refreshToken)) {
      return sendResponse(res, 401, createErrorResponse('Invalid refresh token'));
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = store.users.get(decoded.userId);

    if (!user) {
      return sendResponse(res, 401, createErrorResponse('User not found'));
    }

    // Generate new access token
    const payload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(payload);

    sendResponse(res, 200, createSuccessResponse({
      accessToken: newAccessToken
    }, 'Token refreshed successfully'));
  } catch (error) {
    sendResponse(res, 401, createErrorResponse('Invalid refresh token'));
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = getRefreshToken(req);

    if (refreshToken && store.refreshTokens.has(refreshToken)) {
      store.refreshTokens.delete(refreshToken);
    }

    res.clearCookie('refreshToken');

    sendResponse(res, 200, createSuccessResponse(null, 'Logout successful'));
  } catch (error) {
    sendResponse(res, 500, createErrorResponse('Logout failed'));
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const user = Array.from(store.users.values()).find(u => u.email === email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return sendResponse(res, 200, createSuccessResponse({
        delivery: 'email',
        cooldownSeconds: 60
      }, 'If an account with this email exists, a reset code will be sent'));
    }

    // Check cooldown
    const cooldownCheck = canResendOTP(email, 'password-reset');
    if (!cooldownCheck.canResend) {
      return sendResponse(res, 429, createErrorResponse(
        `Please wait ${cooldownCheck.cooldownSeconds} seconds before requesting another code`
      ));
    }

    // Generate and store OTP code
    const code = createOTPCode(email, 'password-reset');

    // Send OTP via email
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_EMAIL === 'true') {
      try {
        const emailService = (await import('../utils/emailService.js')).default;
        const emailResult = await emailService.sendOTP(email, code, 'password-reset');
        if (!emailResult.success) {
          console.error('Failed to send password reset email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
      }
    } else {
      console.log(`[DEV] Password Reset OTP Code for ${email}: ${code}`);
    }

    sendResponse(res, 200, createSuccessResponse({
      delivery: 'email',
      cooldownSeconds: 60
    }, 'Password reset code sent successfully'));

  } catch (error) {
    console.error('Request password reset error:', error);
    sendResponse(res, 500, createErrorResponse('Failed to send reset code'));
  }
};

export const verifyPasswordReset = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    // Verify the code
    const verification = verifyOTPCode(email, code, 'password-reset');

    if (!verification.valid) {
      return sendResponse(res, 400, createErrorResponse(verification.error));
    }

    // Find the user
    const user = Array.from(store.users.values()).find(u => u.email === email);
    if (!user) {
      return sendResponse(res, 404, createErrorResponse('User not found'));
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    user.password = hashedPassword;
    store.users.set(user.id, user);

    sendResponse(res, 200, createSuccessResponse(null, 'Password reset successfully'));

  } catch (error) {
    console.error('Verify password reset error:', error);
    sendResponse(res, 500, createErrorResponse('Failed to reset password'));
  }
};
