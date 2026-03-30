import { z } from 'zod';

export const requestCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  purpose: z.enum(['login', 'signup'], {
    errorMap: () => ({ message: 'Purpose must be either login or signup' })
  })
});

export const verifyCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().regex(/^\d{6}$/, 'Code must be exactly 6 digits'),
  purpose: z.enum(['login', 'signup'], {
    errorMap: () => ({ message: 'Purpose must be either login or signup' })
  })
});

export const resendCodeSchema = z.object({
  email: z.string().email('Invalid email address'),
  purpose: z.enum(['login', 'signup'], {
    errorMap: () => ({ message: 'Purpose must be either login or signup' })
  })
});
