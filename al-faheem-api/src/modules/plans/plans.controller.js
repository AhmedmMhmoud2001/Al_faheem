import * as svc from './plans.service.js';

export async function list(req, res, next) {
  try {
    const data = await svc.listPlans();
    res.json({ data });
  } catch (e) {
    next(e);
  }
}
