import express from 'express';
import authRoutes from './auth.js';
import userRoutes from './users.js';
import communityRoutes from './communities.js';
import postRoutes from './posts.js';
import commentRoutes from './comments.js';
import eventRoutes from './events.js';
import projectRoutes from './projects.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/communities', communityRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/events', eventRoutes);
router.use('/projects', projectRoutes);

export default router;
