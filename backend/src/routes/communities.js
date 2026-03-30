import express from 'express';
import { createCommunity, listCommunities, getCommunity, joinCommunity, leaveCommunity } from '../controllers/communityController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validation.js';
import { createCommunitySchema, listCommunitiesSchema } from '../validators/communityValidator.js';

const router = express.Router();

router.post('/', requireAuth, validate(createCommunitySchema), createCommunity);
router.get('/', validateQuery(listCommunitiesSchema), listCommunities);
router.get('/:idOrSlug', getCommunity);
router.post('/:id/join', requireAuth, joinCommunity);
router.post('/:id/leave', requireAuth, leaveCommunity);

export default router;
