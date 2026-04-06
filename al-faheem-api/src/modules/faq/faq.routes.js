import { Router } from 'express';
import * as ctrl from './faq.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const r = Router();
r.get('/faq', optionalAuth, ctrl.getPublicFaq);

export default r;
