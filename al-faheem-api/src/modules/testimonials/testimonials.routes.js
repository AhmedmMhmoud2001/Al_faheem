import { Router } from 'express';
import * as ctrl from './testimonials.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const r = Router();
r.get('/testimonials', optionalAuth, ctrl.getPublicTestimonials);

export default r;
