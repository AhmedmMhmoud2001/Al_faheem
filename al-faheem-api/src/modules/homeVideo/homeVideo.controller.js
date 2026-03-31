import * as svc from './homeVideo.service.js';

export async function getPublicHomeVideo(req, res, next) {
  try {
    const row = await svc.getPublicHomeVideo();
    res.json(row);
  } catch (e) {
    next(e);
  }
}
