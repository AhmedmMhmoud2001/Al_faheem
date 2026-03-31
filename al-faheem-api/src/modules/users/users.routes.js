import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { uploadSingle, uploadPathForType } from '../../middleware/upload.js';
import * as ctrl from './users.controller.js';
import { patchMeSchema, changePasswordSchema, paginationQuerySchema } from './users.validation.js';

const r = Router();
r.use(requireAuth);

r.get('/me', ctrl.me);
r.post('/me/photo', uploadSingle, (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  res.status(201).json({ url: uploadPathForType(req.file) });
});
r.patch('/me', validateBody(patchMeSchema), ctrl.patchMe);
r.post('/me/password', validateBody(changePasswordSchema), ctrl.password);
r.get('/me/progress', ctrl.progress);
r.get('/me/mistakes', validateQuery(paginationQuerySchema), ctrl.mistakes);

export default r;
