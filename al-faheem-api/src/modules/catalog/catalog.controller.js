import * as svc from './catalog.service.js';

export async function questionsBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const { page, limit, difficulty, lang } = req.validated.query;
    const out = await svc.listQuestionsBySlug(req.user.id, slug, { page, limit, difficulty, lang });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function questionById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { lang } = req.validated.query;
    const out = await svc.getQuestionExplanation(req.user.id, id, { lang });
    res.json(out);
  } catch (e) {
    next(e);
  }
}
