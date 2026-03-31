import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import * as ctrl from './exams.controller.js';
import { startExamSchema, answerSchema, attemptQuerySchema } from './exams.validation.js';

const r = Router();
r.use(requireAuth);

r.post('/start', validateBody(startExamSchema), ctrl.start);
r.get('/attempts/:attemptId', validateQuery(attemptQuerySchema), ctrl.getAttempt);
r.post('/attempts/:attemptId/answer', validateBody(answerSchema), ctrl.answer);
r.post('/attempts/:attemptId/submit', ctrl.submit);

export default r;
