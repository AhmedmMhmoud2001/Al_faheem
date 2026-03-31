import * as svc from './about.service.js';

export async function getPublicAbout(req, res, next) {
  try {
    const row = await svc.getPublicAbout();
    res.json(row);
  } catch (e) {
    next(e);
  }
}
