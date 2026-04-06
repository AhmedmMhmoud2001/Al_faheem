import { Router } from 'express';
import * as ctrl from './about.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const r = Router();
r.get('/about', optionalAuth, ctrl.getPublicAbout);

export default r;
