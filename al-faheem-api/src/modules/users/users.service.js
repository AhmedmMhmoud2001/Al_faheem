import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { getUserEntitlementSnapshot } from '../../services/entitlement.service.js';
import { HttpError } from '../../middleware/errorHandler.js';

const SALT = 10;

export async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      trialEndsAt: true,
      emailVerified: true,
      createdAt: true,
    },
  });
  if (!user) throw new HttpError(404, 'User not found');
  const ent = await getUserEntitlementSnapshot(userId);
  return { ...user, entitlement: ent };
}

export async function updateMe(userId, data) {
  const allowed = {};
  if (data.fullName != null) allowed.fullName = data.fullName;
  if (data.phone !== undefined) allowed.phone = data.phone;
  if (data.avatarUrl !== undefined) {
    allowed.avatarUrl = data.avatarUrl && data.avatarUrl !== '' ? data.avatarUrl : null;
  }
  return prisma.user.update({
    where: { id: userId },
    data: allowed,
    select: {
      id: true,
      email: true,
      fullName: true,
      phone: true,
      avatarUrl: true,
      role: true,
      trialEndsAt: true,
    },
  });
}

export async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new HttpError(404, 'User not found');
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) throw new HttpError(400, 'Current password is incorrect');
  const passwordHash = await bcrypt.hash(newPassword, SALT);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
  return { message: 'Password changed' };
}

export async function getProgress(userId) {
  const rows = await prisma.userSubjectProgress.findMany({
    where: { userId },
    include: { subject: true },
    orderBy: { subject: { sortOrder: 'asc' } },
  });
  return rows.map((r) => ({
    subjectId: r.subjectId,
    slug: r.subject.slug,
    nameAr: r.subject.nameAr,
    answeredTotal: r.answeredTotal,
    answeredCorrect: r.answeredCorrect,
    percentSnapshot: r.percentSnapshot,
    lastActivityAt: r.lastActivityAt,
  }));
}

export async function getMistakes(userId, page, limit) {
  const skip = (page - 1) * limit;
  const [total, rows] = await Promise.all([
    prisma.userMistake.count({ where: { userId } }),
    prisma.userMistake.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { lastWrongAt: 'desc' },
      include: {
        question: { include: { subject: true } },
      },
    }),
  ]);
  return {
    data: rows.map((m) => ({
      id: m.id,
      wrongCount: m.wrongCount,
      lastWrongAt: m.lastWrongAt,
      question: {
        id: m.question.id,
        stem: m.question.stem,
        subjectSlug: m.question.subject.slug,
        difficulty: m.question.difficulty,
      },
    })),
    meta: { page, limit, total },
  };
}
