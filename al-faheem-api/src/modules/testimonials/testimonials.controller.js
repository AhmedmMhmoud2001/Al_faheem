import * as svc from './testimonials.service.js';

export async function getPublicTestimonials(req, res, next) {
  try {
    const out = await svc.getPublicTestimonials();
    res.json(out);
  } catch (e) {
    next(e);
  }
}
