import * as svc from './catalog.service.js';

export async function questionsBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const { page, limit, difficulty, subCategorySlug, lang } = req.validated.query;
    const out = await svc.listQuestionsBySlug(req.user?.id ?? null, slug, { page, limit, difficulty, subCategorySlug, lang });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function questionById(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { lang } = req.validated.query;
    const out = await svc.getQuestionExplanation(req.user?.id ?? null, id, { lang });
    res.json(out);
  } catch (e) {
    next(e);
  }
}
