import * as svc from './exams.service.js';

export async function start(req, res, next) {
  try {
    const out = await svc.startExam(req.user.id, req.validated.body);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

export async function trialTemplate(req, res, next) {
  try {
    const out = await svc.getTrialTemplatePublic();
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function getAttempt(req, res, next) {
  try {
    const { lang } = req.validated.query;
    const out = await svc.getAttempt(req.user.id, req.params.attemptId, { lang });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function answer(req, res, next) {
  try {
    const out = await svc.submitAnswer(req.user.id, req.params.attemptId, req.validated.body);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function submit(req, res, next) {
  try {
    const out = await svc.submitAttempt(req.user.id, req.params.attemptId);
    res.json(out);
  } catch (e) {
    next(e);
  }
}
