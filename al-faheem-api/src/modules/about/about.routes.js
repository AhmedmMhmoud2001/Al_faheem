import { Router } from 'express';
import * as ctrl from './about.controller.js';

const r = Router();
r.get('/about', ctrl.getPublicAbout);

export default r;
