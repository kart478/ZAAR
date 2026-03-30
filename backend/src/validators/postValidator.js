import { z } from 'zod';

export const createPostSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
  imageUrl: z.string().url('Invalid image URL').optional().nullable(),
  communityId: z.string().uuid('Invalid community ID').optional().nullable(),
  tags: z.array(z.string().max(50, 'Tag must be less than 50 characters')).max(10, 'Maximum 10 tags allowed').optional()
});

export const listPostsSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a positive integer').transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer').transform(Number).default('10')
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment is required').max(1000, 'Comment must be less than 1000 characters')
});
