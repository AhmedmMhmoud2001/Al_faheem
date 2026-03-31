import * as svc from './users.service.js';

export async function me(req, res, next) {
  try {
    const u = await svc.getMe(req.user.id);
    res.json(u);
  } catch (e) {
    next(e);
  }
}

export async function patchMe(req, res, next) {
  try {
    const u = await svc.updateMe(req.user.id, req.validated.body);
    res.json(u);
  } catch (e) {
    next(e);
  }
}

export async function password(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.validated.body;
    const out = await svc.changePassword(req.user.id, currentPassword, newPassword);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function progress(req, res, next) {
  try {
    const p = await svc.getProgress(req.user.id);
    res.json({ data: p });
  } catch (e) {
    next(e);
  }
}

export async function mistakes(req, res, next) {
  try {
    const { page, limit } = req.validated.query;
    const out = await svc.getMistakes(req.user.id, page, limit);
    res.json(out);
  } catch (e) {
    next(e);
  }
}
