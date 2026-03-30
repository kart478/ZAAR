import { z } from 'zod';

export const createCommunitySchema = z.object({
  name: z.string().min(3, 'Community name must be at least 3 characters').max(100, 'Community name must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description must be less than 1000 characters'),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category must be less than 50 characters'),
  coverImageUrl: z.string().url('Invalid cover image URL').optional().nullable(),
  iconUrl: z.string().url('Invalid icon URL').optional().nullable(),
  rules: z.array(z.string().max(200, 'Rule must be less than 200 characters')).max(10, 'Maximum 10 rules allowed').optional(),
  isPrivate: z.boolean().default(false)
});

export const listCommunitiesSchema = z.object({
  search: z.string().max(100, 'Search term must be less than 100 characters').optional(),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  sort: z.enum(['trending', 'newest', 'members']).default('newest'),
  page: z.string().regex(/^\d+$/, 'Page must be a positive integer').transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer').transform(Number).default('10')
});
