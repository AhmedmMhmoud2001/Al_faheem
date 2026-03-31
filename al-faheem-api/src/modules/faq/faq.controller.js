import * as svc from './faq.service.js';

export async function getPublicFaq(req, res, next) {
  try {
    const scope = req.query.scope === 'payment' ? 'payment' : 'general';
    const out = await svc.getPublicFaq(scope);
    res.json(out);
  } catch (e) {
    next(e);
  }
}
