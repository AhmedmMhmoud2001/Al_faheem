import * as svc from './homeStats.service.js';

export async function getPublicHomeStats(_req, res, next) {
  try {
    const row = await svc.getPublicHomeStats();
    res.json(row);
  } catch (e) {
    next(e);
  }
}
