import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

export async function createCheckoutSession(req, res, next) {
  try {
    const { planSlug } = req.validated.body;
    const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
    if (!plan || !plan.isActive) throw new HttpError(404, 'Plan not found');

    // Integrate Stripe/Moyasar here; return client secret or redirect URL.
    res.status(501).json({
      message: 'Payment provider not configured',
      mock: true,
      planSlug: plan.slug,
      amountCents: plan.priceCents,
      currency: plan.currency,
      hint: 'Connect Stripe Checkout or Moyasar and persist Payment + Subscription on webhook.',
    });
  } catch (e) {
    next(e);
  }
}

export async function paymentWebhook(req, res, next) {
  try {
    // Verify provider signature, then update Payment + Subscription.
    res.status(501).json({ message: 'Webhook handler not configured' });
  } catch (e) {
    next(e);
  }
}

export async function mockConfirmPaid(req, res, next) {
  try {
    const userId = req.user.id;
    const { planSlug } = req.validated.body;
    const plan = await prisma.subscriptionPlan.findUnique({ where: { slug: planSlug } });
    if (!plan || !plan.isActive) throw new HttpError(404, 'Plan not found');

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { trialEndsAt: true } });
    const now = new Date();
    // If user still has trial in future, start subscription right after trial ends; otherwise start now.
    const start = user?.trialEndsAt && user.trialEndsAt > now ? new Date(user.trialEndsAt) : now;
    const end = new Date(start);
    switch (plan.interval) {
      case 'day': end.setDate(end.getDate() + 1); break;
      case 'week': end.setDate(end.getDate() + 7); break;
      case 'month': end.setMonth(end.getMonth() + 1); break;
      case 'year': end.setFullYear(end.getFullYear() + 1); break;
      default: end.setMonth(end.getMonth() + 1); break;
    }

    const sub = await prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: start,
        currentPeriodEnd: end,
        cancelAtPeriodEnd: false,
      },
    });

    await prisma.payment.create({
      data: {
        userId,
        subscriptionId: sub.id,
        planId: plan.id,
        amountCents: plan.priceCents,
        currency: plan.currency,
        status: 'SUCCEEDED',
        provider: 'MOCK',
        rawMetadata: { note: 'Mock payment success' },
      },
    });

    res.status(201).json({ ok: true, subscriptionId: sub.id, currentPeriodEnd: sub.currentPeriodEnd });
  } catch (e) {
    next(e);
  }
}