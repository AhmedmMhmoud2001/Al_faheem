import { Router } from 'express';
import * as ctrl from './whyUs.controller.js';

const r = Router();
r.get('/why-us', ctrl.getPublicWhyUs);
export default r;
