import { Router } from 'express';
import * as ctrl from './testimonials.controller.js';

const r = Router();
r.get('/testimonials', ctrl.getPublicTestimonials);

export default r;
