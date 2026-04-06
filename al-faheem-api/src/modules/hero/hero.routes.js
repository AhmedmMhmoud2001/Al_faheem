import { Router } from 'express';
import * as ctrl from './hero.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const r = Router();
r.get('/hero', optionalAuth, ctrl.getPublicHero);
export default r;
