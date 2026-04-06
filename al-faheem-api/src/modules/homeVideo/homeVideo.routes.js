import { Router } from 'express';
import * as ctrl from './homeVideo.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const r = Router();
r.get('/home-video', optionalAuth, ctrl.getPublicHomeVideo);

export default r;
