import { Router } from 'express';
import * as ctrl from './whyUs.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const r = Router();
r.get('/why-us', optionalAuth, ctrl.getPublicWhyUs);
export default r;
