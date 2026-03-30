import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters').optional(),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be less than 30 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  interests: z.array(z.string().max(50, 'Interest must be less than 50 characters')).max(10, 'Maximum 10 interests allowed').optional(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable()
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters').max(100, 'New password must be less than 100 characters')
});
