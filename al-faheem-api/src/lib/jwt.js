import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const ACCESS_EXPIRES = '15m';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

export function accessExpiresInSeconds() {
  return 15 * 60;
}
