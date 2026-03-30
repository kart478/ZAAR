import express from 'express';
import { createEvent, getUpcomingEvents, rsvpEvent } from '../controllers/eventController.js';
import { requireAuth, requireCommunityRole } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validation.js';
import { createEventSchema, rsvpSchema, listEventsSchema } from '../validators/eventValidator.js';

const router = express.Router();

router.post('/', requireAuth, validate(createEventSchema), createEvent);
router.get('/upcoming', validateQuery(listEventsSchema), getUpcomingEvents);
router.post('/:id/rsvp', requireAuth, validate(rsvpSchema), rsvpEvent);

export default router;
