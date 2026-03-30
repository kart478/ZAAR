import express from 'express';
import { createPost, getGlobalFeed, getCommunityFeed, getPersonalizedFeed, likePost, unlikePost, sharePost } from '../controllers/postController.js';
import { createComment, getComments, deleteComment } from '../controllers/commentController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validation.js';
import { createPostSchema, listPostsSchema, createCommentSchema } from '../validators/postValidator.js';

const router = express.Router();

// Post routes
router.post('/', requireAuth, validate(createPostSchema), createPost);
router.get('/feed', requireAuth, validateQuery(listPostsSchema), getPersonalizedFeed);
router.get('/global', validateQuery(listPostsSchema), getGlobalFeed);
router.get('/community/:communityId', validateQuery(listPostsSchema), getCommunityFeed);
router.post('/:id/like', requireAuth, likePost);
router.post('/:id/unlike', requireAuth, unlikePost);
router.post('/:id/share', requireAuth, sharePost);

// Comment routes
router.post('/:id/comments', requireAuth, validate(createCommentSchema), createComment);
router.get('/:id/comments', validateQuery(listPostsSchema), getComments);

export default router;
