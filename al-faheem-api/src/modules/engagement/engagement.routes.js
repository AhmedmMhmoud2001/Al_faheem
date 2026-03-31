import { Router } from 'express';
import { optionalAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { feedbackSchema, contactSchema } from './engagement.validation.js';
import * as ctrl from './engagement.controller.js';

const r = Router();

r.get('/contact/info', ctrl.siteContactInfo);
r.post('/feedback', optionalAuth, validateBody(feedbackSchema), ctrl.feedback);
r.post('/contact', validateBody(contactSchema), ctrl.contact);

export default r;
