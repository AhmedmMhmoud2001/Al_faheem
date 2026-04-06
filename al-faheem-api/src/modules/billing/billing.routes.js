import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validate.js';
import { checkoutSchema } from './billing.validation.js';
import * as ctrl from './billing.controller.js';

const r = Router();

r.post('/checkout/session', requireAuth, validateBody(checkoutSchema), ctrl.createCheckoutSession);
r.post('/webhooks/payments', ctrl.paymentWebhook);
// Mock confirm to mark payment as succeeded and activate subscription immediately (dev/demo)
r.post('/mock/confirm', requireAuth, validateBody(checkoutSchema), ctrl.mockConfirmPaid);

export default r;
