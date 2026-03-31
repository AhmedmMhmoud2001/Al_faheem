import crypto from 'crypto';

export function randomRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function randomOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
