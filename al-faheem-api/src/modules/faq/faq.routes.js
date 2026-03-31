import { Router } from 'express';
import * as ctrl from './faq.controller.js';

const r = Router();
r.get('/faq', ctrl.getPublicFaq);

export default r;
