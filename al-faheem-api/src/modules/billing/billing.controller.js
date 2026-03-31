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
