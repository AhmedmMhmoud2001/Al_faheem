import { prisma } from '../lib/prisma.js';
import { SubscriptionStatus } from '@prisma/client';

/**
 * User can use full question bank / exams if trial active or paid subscription ACTIVE.
 */
export async function userHasContentAccess(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { trialEndsAt: true, isActive: true },
  });
  if (!user?.isActive) return false;
  const now = new Date();
  if (user.trialEndsAt && user.trialEndsAt > now) return true;

  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: SubscriptionStatus.ACTIVE,
      OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: now } }],
    },
  });
  return Boolean(sub);
}

export async function getUserEntitlementSnapshot(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      trialEndsAt: true,
      isActive: true,
    },
  });
  const now = new Date();
  const trialActive = Boolean(user?.trialEndsAt && user.trialEndsAt > now);
  const hasAccess = user?.isActive && (trialActive || (await userHasContentAccess(userId)));

  const activeSub = await prisma.subscription.findFirst({
    where: { userId, status: SubscriptionStatus.ACTIVE },
    include: { plan: true },
  });

  return {
    trialEndsAt: user?.trialEndsAt,
    trialActive,
    subscriptionStatus: activeSub ? 'ACTIVE' : trialActive ? 'TRIALING' : 'NONE',
    planSlug: activeSub?.plan?.slug ?? null,
    hasContentAccess: hasAccess,
  };
}
