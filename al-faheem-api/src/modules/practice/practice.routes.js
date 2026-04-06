import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import * as ctrl from './practice.controller.js';
import { startPracticeSchema, practiceStatsQuerySchema } from './practice.validation.js';

const r = Router();

// Public template info for showing dynamic practice count/time
r.get('/template', ctrl.template);

// Authenticated practice routes
r.use(requireAuth);
r.post('/sessions', validateBody(startPracticeSchema), ctrl.start);
r.get('/stats', validateQuery(practiceStatsQuerySchema), ctrl.stats);

export default r;
