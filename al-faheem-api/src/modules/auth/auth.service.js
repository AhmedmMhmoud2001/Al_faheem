import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { signAccessToken, accessExpiresInSeconds } from '../../lib/jwt.js';
import { randomRefreshToken, hashToken, randomOtp } from '../../lib/crypto.js';
import { HttpError } from '../../middleware/errorHandler.js';

const SALT = 10;
const TRIAL_DAYS = 7;
const REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    avatarUrl: u.avatarUrl,
    role: u.role,
    trialEndsAt: u.trialEndsAt,
  };
}

export async function register(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new HttpError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(data.password, SALT);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone || null,
      trialEndsAt,
      role: 'USER',
    },
  });

  return issueTokens(user);
}

export async function login(data) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !user.isActive) {
    throw new HttpError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
  }
  const ok = await bcrypt.compare(data.password, user.passwordHash);
  if (!ok) throw new HttpError(401, 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');

  return issueTokens(user);
}

async function issueTokens(user) {
  const accessToken = signAccessToken({ sub: user.id, role: String(user.role) });
  const refreshRaw = randomRefreshToken();
  const tokenHash = hashToken(refreshRaw);
  const expiresAt = new Date(Date.now() + REFRESH_MS);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: refreshRaw,
    expiresIn: accessExpiresInSeconds(),
    user: publicUser(user),
  };
}

export async function refresh(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const row = await prisma.refreshToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!row || row.revoked || row.expiresAt < new Date() || !row.user.isActive) {
    throw new HttpError(401, 'Invalid refresh token');
  }

  await prisma.refreshToken.update({
    where: { id: row.id },
    data: { revoked: true },
  });

  const accessToken = signAccessToken({ sub: row.user.id, role: String(row.user.role) });
  const newRefreshRaw = randomRefreshToken();
  const newHash = hashToken(newRefreshRaw);
  const expiresAt = new Date(Date.now() + REFRESH_MS);

  await prisma.refreshToken.create({
    data: {
      userId: row.user.id,
      tokenHash: newHash,
      expiresAt,
    },
  });

  return {
    accessToken,
    refreshToken: newRefreshRaw,
    expiresIn: accessExpiresInSeconds(),
    user: publicUser(row.user),
  };
}

export async function logout(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
  return { ok: true };
}

export async function forgotPassword(email) {
  await prisma.passwordResetToken.deleteMany({ where: { email } });
  const code = randomOtp();
  const codeHash = await bcrypt.hash(code, SALT);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await prisma.passwordResetToken.create({
    data: { email, codeHash, expiresAt },
  });
  if (process.env.NODE_ENV === 'development') {
    console.info(`[dev] Password reset OTP for ${email}: ${code}`);
  }
  return { message: 'If the email exists, a code was sent.' };
}

export async function resetPasswordWithCode(email, code, newPassword) {
  const row = await prisma.passwordResetToken.findFirst({
    where: { email },
    orderBy: { createdAt: 'desc' },
  });
  if (!row || row.expiresAt < new Date()) {
    throw new HttpError(400, 'Invalid or expired code');
  }
  const match = await bcrypt.compare(code, row.codeHash);
  if (!match) {
    await prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { attempts: { increment: 1 } },
    });
    throw new HttpError(400, 'Invalid or expired code');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError(404, 'User not found');

  const passwordHash = await bcrypt.hash(newPassword, SALT);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetToken.deleteMany({ where: { email } }),
    prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revoked: true } }),
  ]);

  return { message: 'Password updated' };
}
