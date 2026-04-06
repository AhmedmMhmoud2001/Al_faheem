import { Router } from 'express';
import * as ctrl from './homeStats.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const r = Router();
r.get('/home-stats', optionalAuth, ctrl.getPublicHomeStats);
export default r;
