import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  location: z.string().min(1, 'Location is required').max(200, 'Location must be less than 200 characters').optional(),
  onlineLink: z.string().url('Invalid online link URL').optional().nullable(),
  communityId: z.string().uuid('Invalid community ID'),
  bannerUrl: z.string().url('Invalid banner URL').optional().nullable()
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: "End time must be after start time",
  path: ["endTime"]
});

export const rsvpSchema = z.object({
  status: z.enum(['going', 'interested', 'notGoing'], 'Invalid RSVP status')
});

export const listEventsSchema = z.object({
  communityId: z.string().uuid('Invalid community ID').optional(),
  page: z.string().regex(/^\d+$/, 'Page must be a positive integer').transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a positive integer').transform(Number).default('10')
});
