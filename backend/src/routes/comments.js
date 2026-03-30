import express from 'express';
import { deleteComment } from '../controllers/commentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.delete('/:commentId', requireAuth, deleteComment);

export default router;
