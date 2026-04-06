import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole, requirePermission } from '../../middleware/roles.js';
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
  subCategoryCreateSchema,
  subCategoryUpdateSchema,
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
  siteSettingsUpdateSchema,
  subscriptionActionSchema,
} from './admin.validation.js';
import { uploadSingle, uploadPathForType } from '../../middleware/upload.js';

const r = Router();

// All admin routes require authentication + ADMIN or STAFF role
r.use(requireAuth, requireRole('ADMIN', 'STAFF'));

// ─── Admin-only: dashboard, users, payments, billing, contact, settings ───
r.get('/dashboard-analytics', requireRole('ADMIN'), ctrl.dashboardAnalytics);

r.get('/settings', requireRole('ADMIN'), ctrl.siteSettingsGet);
r.patch('/settings', requireRole('ADMIN'), validateBody(siteSettingsUpdateSchema), ctrl.siteSettingsPatch);

r.get('/users', requireRole('ADMIN'), validateQuery(paginationQuerySchema), ctrl.users);
r.post('/users', requireRole('ADMIN'), validateBody(createUserSchema), ctrl.createUser);
r.get('/users/:id', requireRole('ADMIN'), ctrl.userById);
r.patch('/users/:id', requireRole('ADMIN'), validateBody(patchUserSchema), ctrl.patchUser);
r.delete('/users/:id', requireRole('ADMIN'), ctrl.removeUser);
r.patch('/users/:id/role', requireRole('ADMIN'), validateBody(setRoleSchema), ctrl.setRole);
r.patch('/users/:id/trial', requireRole('ADMIN'), validateBody(setTrialSchema), ctrl.setTrial);

// ─── Subjects — ADMIN full access, STAFF needs subjects:read / subjects:write ───
r.get('/subjects', requirePermission('subjects:read'), ctrl.subjects);
r.post('/subjects', requirePermission('subjects:write'), validateBody(subjectCreateSchema), ctrl.createSubject);
r.patch('/subjects/:id', requirePermission('subjects:write'), validateBody(subjectUpdateSchema), ctrl.updateSubject);
r.delete('/subjects/:id', requirePermission('subjects:delete'), ctrl.removeSubject);
r.get('/subjects/:id/subcategories', requirePermission('subcategories:read', 'subjects:read'), ctrl.subjectSubcategories);

// ─── Subcategories ───
r.get('/subcategories', requirePermission('subcategories:read'), ctrl.subjectSubcategories);
r.post('/subcategories', requirePermission('subcategories:write'), validateBody(subCategoryCreateSchema), ctrl.createSubCategory);
r.patch('/subcategories/:id', requirePermission('subcategories:write'), validateBody(subCategoryUpdateSchema), ctrl.updateSubCategory);
r.delete('/subcategories/:id', requirePermission('subcategories:delete'), ctrl.removeSubCategory);

// ─── Questions ───
r.get('/questions', requirePermission('questions:read'), validateQuery(paginationQuerySchema), ctrl.questions);
r.get('/questions/:id', requirePermission('questions:read'), ctrl.questionById);
r.post('/questions', requirePermission('questions:write'), validateBody(questionCreateSchema), ctrl.createQuestion);
r.patch('/questions/:id', requirePermission('questions:write'), validateBody(questionUpdateSchema), ctrl.updateQuestion);
r.delete('/questions/:id', requirePermission('questions:delete'), ctrl.removeQuestion);

// ─── Exam templates (admin only) ───
r.get('/exam-templates', requireRole('ADMIN'), ctrl.examTemplates);
r.post('/exam-templates', requireRole('ADMIN'), validateBody(examTemplateCreateSchema), ctrl.createTemplate);
r.patch('/exam-templates/:id', requireRole('ADMIN'), validateBody(examTemplateUpdateSchema), ctrl.updateTemplate);

r.get('/attempts', requireRole('ADMIN'), validateQuery(paginationQuerySchema), ctrl.attempts);

r.get('/contact-settings', requireRole('ADMIN'), ctrl.siteContactInfoAdminGet);
r.patch('/contact-settings', requireRole('ADMIN'), validateBody(siteContactInfoPatchSchema), ctrl.siteContactInfoAdminPatch);

r.get('/contact', requireRole('ADMIN'), validateQuery(paginationQuerySchema), ctrl.contactList);
r.patch('/contact/:id', requireRole('ADMIN'), validateBody(contactStatusSchema), ctrl.contactPatch);

r.get('/feedback', requireRole('ADMIN'), validateQuery(paginationQuerySchema), ctrl.feedbackList);
r.get('/payments', requireRole('ADMIN'), validateQuery(paginationQuerySchema), ctrl.payments);
r.post('/subscriptions/:id/action', requireRole('ADMIN'), validateBody(subscriptionActionSchema), ctrl.subscriptionAction);

r.get('/subscription-plans', requireRole('ADMIN'), ctrl.subscriptionPlansList);
r.post('/subscription-plans', requireRole('ADMIN'), validateBody(subscriptionPlanCreateSchema), ctrl.subscriptionPlanCreate);
r.patch('/subscription-plans/:id', requireRole('ADMIN'), validateBody(subscriptionPlanUpdateSchema), ctrl.subscriptionPlanUpdate);

r.get('/testimonials', requireRole('ADMIN'), ctrl.testimonialsAdminGet);
r.put('/testimonials/settings', requireRole('ADMIN'), validateBody(testimonialsSettingsUpdateSchema), ctrl.testimonialsSettingsPut);
r.post('/testimonials/items', requireRole('ADMIN'), validateBody(testimonialItemCreateSchema), ctrl.testimonialItemPost);
r.patch('/testimonials/items/:id', requireRole('ADMIN'), validateBody(testimonialItemUpdateSchema), ctrl.testimonialItemPatch);
r.delete('/testimonials/items/:id', requireRole('ADMIN'), ctrl.testimonialItemDelete);

r.get('/faq', requireRole('ADMIN'), ctrl.faqAdminGet);
r.put('/faq/settings', requireRole('ADMIN'), validateBody(faqSettingsUpdateSchema), ctrl.faqSettingsPut);
r.post('/faq/items', requireRole('ADMIN'), validateBody(faqItemCreateSchema), ctrl.faqItemPost);
r.patch('/faq/items/:id', requireRole('ADMIN'), validateBody(faqItemUpdateSchema), ctrl.faqItemPatch);
r.delete('/faq/items/:id', requireRole('ADMIN'), ctrl.faqItemDelete);

r.get('/about', requireRole('ADMIN'), ctrl.aboutAdminGet);
r.put('/about', requireRole('ADMIN'), validateBody(siteAboutUpdateSchema), ctrl.aboutPut);

r.get('/home-video', requireRole('ADMIN'), ctrl.homeVideoAdminGet);
r.put('/home-video', requireRole('ADMIN'), validateBody(siteHomeVideoUpdateSchema), ctrl.homeVideoPut);

r.get('/hero', requireRole('ADMIN'), ctrl.heroAdminGet);
r.put('/hero', requireRole('ADMIN'), validateBody(siteHeroUpdateSchema), ctrl.heroPut);
r.get('/home-stats', requireRole('ADMIN'), ctrl.homeStatsAdminGet);
r.put('/home-stats', requireRole('ADMIN'), validateBody(siteHomeStatsUpdateSchema), ctrl.homeStatsPut);
r.get('/why-us', requireRole('ADMIN'), ctrl.whyUsAdminGet);
r.put('/why-us', requireRole('ADMIN'), validateBody(siteWhyUsUpdateSchema), ctrl.whyUsPut);

// ─── File uploads (ADMIN + STAFF with any permission) ───
r.post('/uploads', uploadSingle, (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file' });
  const url = uploadPathForType(req.file);
  res.status(201).json({ url });
});

export default r;
