import { Router } from 'express';
import * as ctrl from './homeVideo.controller.js';

const r = Router();
r.get('/home-video', ctrl.getPublicHomeVideo);

export default r;
