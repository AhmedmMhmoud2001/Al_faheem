import * as svc from './engagement.service.js';

export async function feedback(req, res, next) {
  try {
    const userId = req.user?.id;
    const row = await svc.createFeedback(req.validated.body, userId);
    res.status(201).json({ id: row.id, message: 'Thank you' });
  } catch (e) {
    next(e);
  }
}

export async function contact(req, res, next) {
  try {
    const row = await svc.createContact(req.validated.body);
    res.status(201).json({ id: row.id, message: 'Message received' });
  } catch (e) {
    next(e);
  }
}

export async function siteContactInfo(req, res, next) {
  try {
    const row = await svc.getSiteContactInfo();
    res.json({
      introAr: row?.introAr ?? null,
      introEn: row?.introEn ?? null,
      phone: row?.phone ?? null,
      email: row?.email ?? null,
      facebookUrl: row?.facebookUrl ?? null,
      instagramUrl: row?.instagramUrl ?? null,
      whatsappUrl: row?.whatsappUrl ?? null,
      youtubeUrl: row?.youtubeUrl ?? null,
    });
  } catch (e) {
    next(e);
  }
}
