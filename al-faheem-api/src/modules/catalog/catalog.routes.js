import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateQuery } from '../../middleware/validate.js';
import * as ctrl from './catalog.controller.js';
import { questionsQuerySchema, questionByIdQuerySchema } from './catalog.validation.js';

const r = Router();
r.use(requireAuth);
r.get('/subjects/:slug/questions', validateQuery(questionsQuerySchema), ctrl.questionsBySlug);
r.get('/questions/:id', validateQuery(questionByIdQuerySchema), ctrl.questionById);

export default r;
