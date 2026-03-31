import { Router } from 'express';
import * as ctrl from './subjects.controller.js';

const r = Router();
r.get('/', ctrl.list);
export default r;
