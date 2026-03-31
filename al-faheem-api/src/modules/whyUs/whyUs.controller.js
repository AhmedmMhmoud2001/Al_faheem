import * as svc from './whyUs.service.js';

export async function getPublicWhyUs(_req, res, next) {
  try {
    const row = await svc.getPublicWhyUs();
    res.json(row);
  } catch (e) {
    next(e);
  }
}
