import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyPasswordResetSchema } from '../src/validators/authValidator.js';

test('accepts a valid password reset request', () => {
  const result = verifyPasswordResetSchema.safeParse({
    email: 'user@example.com',
    code: '123456',
    newPassword: 'SecurePass1'
  });

  assert.equal(result.success, true);
});

test('rejects a password reset request with a weak password', () => {
  const result = verifyPasswordResetSchema.safeParse({
    email: 'user@example.com',
    code: '123456',
    newPassword: 'password'
  });

  assert.equal(result.success, false);
});
