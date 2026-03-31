import { Router } from 'express';
import * as ctrl from './homeStats.controller.js';

const r = Router();
r.get('/home-stats', ctrl.getPublicHomeStats);
export default r;
