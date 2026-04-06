import * as svc from './subjects.service.js';

export async function list(req, res, next) {
  try {
    const data = await svc.listActive();
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

export async function listSubcategories(req, res, next) {
  try {
    const data = await svc.listActiveSubcategories(req.params.slug);
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

export async function getSubcategory(req, res, next) {
  try {
    const row = await svc.getActiveSubcategory(req.params.slug, req.params.subSlug);
    res.json(row);
  } catch (e) {
    next(e);
  }
}