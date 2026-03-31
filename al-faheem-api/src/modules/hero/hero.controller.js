import * as svc from './hero.service.js';

export async function getPublicHero(_req, res, next) {
  try {
    const row = await svc.getPublicHero();
    res.json(row);
  } catch (e) {
    next(e);
  }
}
