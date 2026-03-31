import { Router } from 'express';
import * as ctrl from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation.js';

const r = Router();

r.post('/register', validateBody(registerSchema), ctrl.register);
r.post('/login', validateBody(loginSchema), ctrl.login);
r.post('/refresh', validateBody(refreshSchema), ctrl.refresh);
r.post('/logout', validateBody(logoutSchema), ctrl.logout);
r.post('/forgot-password', validateBody(forgotPasswordSchema), ctrl.forgotPassword);
r.post('/reset-password', validateBody(resetPasswordSchema), ctrl.resetPassword);

export default r;
