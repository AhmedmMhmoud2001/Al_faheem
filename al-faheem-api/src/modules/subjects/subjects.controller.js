import * as svc from './subjects.service.js';

export async function list(req, res, next) {
  try {
    const data = await svc.listActive();
    res.json({ data });
  } catch (e) {
    next(e);
  }
}
