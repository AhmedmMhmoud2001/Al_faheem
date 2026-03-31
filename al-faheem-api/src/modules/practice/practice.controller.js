import * as svc from './practice.service.js';

export async function start(req, res, next) {
  try {
    const out = await svc.startPractice(req.user.id, req.validated.body);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

export async function stats(req, res, next) {
  try {
    const { subjectSlug, difficulty } = req.validated.query;
    const { answeredInStage, correctInStage } = await svc.practiceStageStats(
      req.user.id,
      subjectSlug,
      difficulty,
    );
    res.json({ answeredInStage, correctInStage });
  } catch (e) {
    next(e);
  }
}
