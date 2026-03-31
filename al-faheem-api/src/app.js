import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import subjectsRoutes from './modules/subjects/subjects.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
import practiceRoutes from './modules/practice/practice.routes.js';
import examsRoutes from './modules/exams/exams.routes.js';
import plansRoutes from './modules/plans/plans.routes.js';
import billingRoutes from './modules/billing/billing.routes.js';
import engagementRoutes from './modules/engagement/engagement.routes.js';
import faqRoutes from './modules/faq/faq.routes.js';
import testimonialsRoutes from './modules/testimonials/testimonials.routes.js';
import aboutRoutes from './modules/about/about.routes.js';
import homeVideoRoutes from './modules/homeVideo/homeVideo.routes.js';
import heroRoutes from './modules/hero/hero.routes.js';
import homeStatsRoutes from './modules/homeStats/homeStats.routes.js';
import whyUsRoutes from './modules/whyUs/whyUs.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';

const app = express();

// Allow admin/learner apps (other origins/ports) to display <img src="http://api.../uploads/...">
// Default helmet CORP is same-origin and triggers net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin: [env.LEARNER_ORIGIN, env.ADMIN_ORIGIN],
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 60 });
app.use('/api/v1/auth', authLimiter);

const publicLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use('/api/v1', publicLimiter);

app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

const v1 = express.Router();
v1.use('/auth', authRoutes);
v1.use('/users', usersRoutes);
v1.use('/subjects', subjectsRoutes);
v1.use('/', catalogRoutes);
v1.use('/practice', practiceRoutes);
v1.use('/exams', examsRoutes);
v1.use('/plans', plansRoutes);
v1.use('/', billingRoutes);
v1.use('/', engagementRoutes);
v1.use('/', faqRoutes);
v1.use('/', testimonialsRoutes);
v1.use('/', aboutRoutes);
v1.use('/', homeVideoRoutes);
v1.use('/', heroRoutes);
v1.use('/', homeStatsRoutes);
v1.use('/', whyUsRoutes);
v1.use('/admin', adminRoutes);

app.use('/api/v1', v1);

app.get('/health', (req, res) => res.json({ ok: true }));

app.use(errorHandler);

export default app;
