import { Router } from 'express';
import * as ctrl from './plans.controller.js';

const r = Router();
r.get('/', ctrl.list);
export default r;
