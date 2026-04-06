import { Router } from 'express';
import { optionalAuth } from '../../middleware/auth.js';
import { validateQuery } from '../../middleware/validate.js';
import * as ctrl from './catalog.controller.js';
import { questionsQuerySchema, questionByIdQuerySchema } from './catalog.validation.js';

const r = Router();
// Allow both public and logged-in users (token optional) for catalog browsing
r.get('/subjects/:slug/questions', optionalAuth, validateQuery(questionsQuerySchema), ctrl.questionsBySlug);
r.get('/questions/:id', optionalAuth, validateQuery(questionByIdQuerySchema), ctrl.questionById);

export default r;
