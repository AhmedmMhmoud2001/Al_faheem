import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const out = await authService.register(req.validated.body);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const deviceInfo = req.headers['user-agent'] || null;
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || null;
    const out = await authService.login(req.validated.body, deviceInfo, ipAddress);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function refresh(req, res, next) {
  try {
    const out = await authService.refresh(req.validated.body.refreshToken);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function logout(req, res, next) {
  try {
    const out = await authService.logout(req.validated.body.refreshToken);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const out = await authService.forgotPassword(req.validated.body.email);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword } = req.validated.body;
    const out = await authService.resetPasswordWithCode(email, code, newPassword);
    res.json(out);
  } catch (e) {
    next(e);
  }
}
