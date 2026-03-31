import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import * as ctrl from './admin.controller.js';
import {
  paginationQuerySchema,
  patchUserSchema,
  createUserSchema,
  setRoleSchema,
  setTrialSchema,
  subjectCreateSchema,
  subjectUpdateSchema,
  questionCreateSchema,
  questionUpdateSchema,
  examTemplateCreateSchema,
  examTemplateUpdateSchema,
  contactStatusSchema,
  siteContactInfoPatchSchema,
  testimonialsSettingsUpdateSchema,
  testimonialItemCreateSchema,
  testimonialItemUpdateSchema,
  faqSettingsUpdateSchema,
  faqItemCreateSchema,
  faqItemUpdateSchema,
  siteAboutUpdateSchema,
  siteHomeVideoUpdateSchema,
  siteHeroUpdateSchema,
  siteHomeStatsUpdateSchema,
  siteWhyUsUpdateSchema,
  subscriptionPlanCreateSchema,
  subscriptionPlanUpdateSchema,
} from './admin.validation.js';
import { uploadSingle, uploadPathForType } from '../../middleware/upload.js';

const r = Router();
r.use(requireAuth, requireRole('ADMIN'));

r.get('/dashboard-analytics', ctrl.dashboardAnalytics);

r.get('/users', validateQuery(paginationQuerySchema), ctrl.users);
r.post('/users', validateBody(createUserSchema), ctrl.createUser);
r.get('/users/:id', ctrl.userById);
r.patch('/users/:id', validateBody(patchUserSchema), ctrl.patchUser);
r.delete('/users/:id', ctrl.removeUser);
r.patch('/users/:id/role', validateBody(setRoleSchema), ctrl.setRole);
r.patch('/users/:id/trial', validateBody(setTrialSchema), ctrl.setTrial);

r.get('/subjects', ctrl.subjects);
r.post('/subjects', validateBody(subjectCreateSchema), ctrl.createSubject);
r.patch('/subjects/:id', validateBody(subjectUpdateSchema), ctrl.updateSubject);
r.delete('/subjects/:id', ctrl.removeSubject);

r.get('/questions', validateQuery(paginationQuerySchema), ctrl.questions);
r.post('/questions', validateBody(questionCreateSchema), ctrl.createQuestion);
r.patch('/questions/:id', validateBody(questionUpdateSchema), ctrl.updateQuestion);
r.delete('/questions/:id', ctrl.removeQuestion);

r.get('/exam-templates', ctrl.examTemplates);
r.post('/exam-templates', validateBody(examTemplateCreateSchema), ctrl.createTemplate);
r.patch('/exam-templates/:id', validateBody(examTemplateUpdateSchema), ctrl.updateTemplate);

r.get('/attempts', validateQuery(paginationQuerySchema), ctrl.attempts);

r.get('/contact-settings', ctrl.siteContactInfoAdminGet);
r.patch('/contact-settings', validateBody(siteContactInfoPatchSchema), ctrl.siteContactInfoAdminPatch);

r.get('/contact', validateQuery(paginationQuerySchema), ctrl.contactList);
r.patch('/contact/:id', validateBody(contactStatusSchema), ctrl.contactPatch);

r.get('/feedback', validateQuery(paginationQuerySchema), ctrl.feedbackList);
r.get('/payments', validateQuery(paginationQuerySchema), ctrl.payments);

r.get('/subscription-plans', ctrl.subscriptionPlansList);
r.post('/subscription-plans', validateBody(subscriptionPlanCreateSchema), ctrl.subscriptionPlanCreate);
r.patch('/subscription-plans/:id', validateBody(subscriptionPlanUpdateSchema), ctrl.subscriptionPlanUpdate);

r.get('/testimonials', ctrl.testimonialsAdminGet);
r.put('/testimonials/settings', validateBody(testimonialsSettingsUpdateSchema), ctrl.testimonialsSettingsPut);
r.post('/testimonials/items', validateBody(testimonialItemCreateSchema), ctrl.testimonialItemPost);
r.patch('/testimonials/items/:id', validateBody(testimonialItemUpdateSchema), ctrl.testimonialItemPatch);
r.delete('/testimonials/items/:id', ctrl.testimonialItemDelete);

r.get('/faq', ctrl.faqAdminGet);
r.put('/faq/settings', validateBody(faqSettingsUpdateSchema), ctrl.faqSettingsPut);
r.post('/faq/items', validateBody(faqItemCreateSchema), ctrl.faqItemPost);
r.patch('/faq/items/:id', validateBody(faqItemUpdateSchema), ctrl.faqItemPatch);
r.delete('/faq/items/:id', ctrl.faqItemDelete);

r.get('/about', ctrl.aboutAdminGet);
r.put('/about', validateBody(siteAboutUpdateSchema), ctrl.aboutPut);

r.get('/home-video', ctrl.homeVideoAdminGet);
r.put('/home-video', validateBody(siteHomeVideoUpdateSchema), ctrl.homeVideoPut);

r.get('/hero', ctrl.heroAdminGet);
r.put('/hero', validateBody(siteHeroUpdateSchema), ctrl.heroPut);
r.get('/home-stats', ctrl.homeStatsAdminGet);
r.put('/home-stats', validateBody(siteHomeStatsUpdateSchema), ctrl.homeStatsPut);
r.get('/why-us', ctrl.whyUsAdminGet);
r.put('/why-us', validateBody(siteWhyUsUpdateSchema), ctrl.whyUsPut);

r.post('/uploads', uploadSingle, (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const url = uploadPathForType(req.file);
  res.status(201).json({ url });
});

export default r;
