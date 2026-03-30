import { randomUUID } from 'crypto';

// In-memory data store
export const store = {
  users: new Map(),
  communities: new Map(),
  memberships: new Map(),
  posts: new Map(),
  comments: new Map(),
  events: new Map(),
  projects: new Map(),
  collaborationRequests: new Map(),
  refreshTokens: new Set(),
  otpCodes: new Map() // email -> { code, expiresAt, attempts, lastSent }
};

// Generate ID helper
export const generateId = () => randomUUID();

// OTP utility functions
export const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const createOTPCode = (email, purpose = 'login') => {
  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const lastSent = new Date();
  
  store.otpCodes.set(`${email}:${purpose}`, {
    code,
    expiresAt,
    attempts: 0,
    lastSent
  });
  
  return code;
};

export const verifyOTPCode = (email, code, purpose = 'login') => {
  const key = `${email}:${purpose}`;
  const otpData = store.otpCodes.get(key);
  
  if (!otpData) {
    return { valid: false, error: 'Code not found or expired' };
  }
  
  if (Date.now() > otpData.expiresAt) {
    store.otpCodes.delete(key);
    return { valid: false, error: 'Code expired' };
  }
  
  if (otpData.attempts >= 3) {
    store.otpCodes.delete(key);
    return { valid: false, error: 'Too many attempts' };
  }
  
  if (otpData.code !== code) {
    otpData.attempts++;
    return { valid: false, error: 'Invalid code' };
  }
  
  // Code is valid, remove it
  store.otpCodes.delete(key);
  return { valid: true };
};

export const canResendOTP = (email, purpose = 'login') => {
  const key = `${email}:${purpose}`;
  const otpData = store.otpCodes.get(key);
  
  if (!otpData) {
    return { canResend: true, cooldownSeconds: 0 };
  }
  
  const cooldownMs = 60 * 1000; // 60 seconds cooldown
  const timeSinceLastSent = Date.now() - otpData.lastSent;
  
  if (timeSinceLastSent < cooldownMs) {
    const cooldownSeconds = Math.ceil((cooldownMs - timeSinceLastSent) / 1000);
    return { canResend: false, cooldownSeconds };
  }
  
  return { canResend: true, cooldownSeconds: 0 };
};
