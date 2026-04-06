import { verifyAccessToken } from '../lib/jwt.js';
import { prisma } from '../lib/prisma.js';

async function isSessionValid(userId, sessionId) {
  if (!sessionId) return false;
  const session = await prisma.refreshToken.findFirst({
    where: {
      id: sessionId,
      userId,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
  });
  return !!session;
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const payload = verifyAccessToken(token);
    const valid = await isSessionValid(payload.sub, payload.sid);
    if (!valid) {
      return res.status(401).json({ message: 'Session expired or revoked' });
    }
    req.user = { id: payload.sub, role: payload.role, sid: payload.sid, permissions: payload.permissions || [] };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = verifyAccessToken(token);
    const valid = await isSessionValid(payload.sub, payload.sid);
    if (valid) {
      req.user = { id: payload.sub, role: payload.role, sid: payload.sid, permissions: payload.permissions || [] };
    } else {
      req.user = null;
    }
  } catch {
    req.user = null;
  }
  next();
}
