import { Router } from 'express';
import * as ctrl from './hero.controller.js';

const r = Router();
r.get('/hero', ctrl.getPublicHero);
export default r;
