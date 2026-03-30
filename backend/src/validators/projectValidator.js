import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  techStack: z.array(z.string().max(50, 'Tech stack item must be less than 50 characters')).min(1, 'At least one technology is required').max(20, 'Maximum 20 technologies allowed'),
  repoUrl: z.string().url('Invalid repository URL').optional().nullable(),
  demoUrl: z.string().url('Invalid demo URL').optional().nullable(),
  communityId: z.string().uuid('Invalid community ID').optional().nullable(),
  rolesNeeded: z.array(z.string().max(100, 'Role must be less than 100 characters')).max(10, 'Maximum 10 roles allowed').optional()
});

export const listProjectsSchema = z.object({
  communityId: z.string().uuid('Invalid community ID').optional(),
  search: z.string().max(100, 'Search term must be less than 100 characters').optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a positive integer').transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer').transform(Number).default('10')
});

export const collaborationRequestSchema = z.object({
  message: z.string().min(10, 'Message must be at least 10 characters').max(500, 'Message must be less than 500 characters')
});
