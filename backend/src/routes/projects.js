import express from 'express';
import { createProject, getProjects, requestCollaboration } from '../controllers/projectController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validation.js';
import { createProjectSchema, listProjectsSchema, collaborationRequestSchema } from '../validators/projectValidator.js';

const router = express.Router();

router.post('/', requireAuth, validate(createProjectSchema), createProject);
router.get('/', validateQuery(listProjectsSchema), getProjects);
router.post('/:id/request', requireAuth, validate(collaborationRequestSchema), requestCollaboration);

export default router;
