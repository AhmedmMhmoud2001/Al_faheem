import * as svc from './admin.service.js';
import * as faqSvc from '../faq/faq.service.js';
import * as testimonialSvc from '../testimonials/testimonials.service.js';
import * as aboutSvc from '../about/about.service.js';
import * as homeVideoSvc from '../homeVideo/homeVideo.service.js';
import * as heroSvc from '../hero/hero.service.js';
import * as homeStatsSvc from '../homeStats/homeStats.service.js';
import * as whyUsSvc from '../whyUs/whyUs.service.js';

export async function users(req, res, next) {
  try {
    const { page, limit, search, role } = req.validated.query;
    const out = await svc.listUsers({ page, limit, search, role });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function createUser(req, res, next) {
  try {
    const row = await svc.createUser(req.validated.body);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

export async function userById(req, res, next) {
  try {
    const row = await svc.getUserById(req.params.id);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function patchUser(req, res, next) {
  try {
    const out = await svc.patchUser(req.params.id, req.validated.body);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function setRole(req, res, next) {
  try {
    const { role, staffRoleId } = req.validated.body;
    const out = await svc.setUserRole(req.params.id, role, staffRoleId ?? null);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function setTrial(req, res, next) {
  try {
    const out = await svc.setUserTrial(req.params.id, req.validated.body.trialEndsAt);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function removeUser(req, res, next) {
  try {
    const out = await svc.deleteUser(req.params.id, req.user.id);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function subjects(req, res, next) {
  try {
    const data = await svc.listSubjectsAdmin();
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

export async function createSubject(req, res, next) {
  try {
    const row = await svc.createSubject(req.validated.body);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

export async function updateSubject(req, res, next) {
  try {
    const row = await svc.updateSubject(Number(req.params.id), req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function removeSubject(req, res, next) {
  try {
    const out = await svc.deleteSubject(Number(req.params.id));
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function subjectSubcategories(req, res, next) {
  try {
    // Support both /subjects/:id/subcategories (params.id) and /subcategories?subjectId= (query)
    const subjectId = req.params.id ?? req.query.subjectId;
    const data = await svc.listSubcategoriesAdmin(subjectId);
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

export async function createSubCategory(req, res, next) {
  try {
    const row = await svc.createSubCategory(req.validated.body);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

export async function updateSubCategory(req, res, next) {
  try {
    const row = await svc.updateSubCategory(Number(req.params.id), req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function removeSubCategory(req, res, next) {
  try {
    const out = await svc.deleteSubCategory(Number(req.params.id));
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function questions(req, res, next) {
  try {
    const { page, limit, subjectId, subCategoryId, difficulty, isPublished, includeInExam } = req.validated.query;
    const out = await svc.listQuestionsAdmin({
      subjectId,
      subCategoryId,
      difficulty,
      isPublished,
      includeInExam,
      page,
      limit,
    });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function createQuestion(req, res, next) {
  try {
    const row = await svc.createQuestion(req.validated.body);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

export async function questionById(req, res, next) {
  try {
    const row = await svc.getQuestionById(Number(req.params.id));
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const row = await svc.updateQuestion(Number(req.params.id), req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function removeQuestion(req, res, next) {
  try {
    const out = await svc.deleteQuestion(Number(req.params.id));
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function examTemplates(req, res, next) {
  try {
    const data = await svc.listExamTemplates();
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

export async function createTemplate(req, res, next) {
  try {
    const row = await svc.createExamTemplate(req.validated.body);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

export async function updateTemplate(req, res, next) {
  try {
    const row = await svc.updateExamTemplate(Number(req.params.id), req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function attempts(req, res, next) {
  try {
    const { page, limit, userId } = req.validated.query;
    const out = await svc.listAttemptsAdmin({ userId, page, limit });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function contactList(req, res, next) {
  try {
    const { page, limit } = req.validated.query;
    const out = await svc.listContact({ page, limit });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function contactPatch(req, res, next) {
  try {
    const row = await svc.patchContact(Number(req.params.id), req.validated.body.status);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function siteContactInfoAdminGet(req, res, next) {
  try {
    const row = await svc.getSiteContactInfoAdmin();
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function siteContactInfoAdminPatch(req, res, next) {
  try {
    const row = await svc.upsertSiteContactInfo(req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function feedbackList(req, res, next) {
  try {
    const { page, limit } = req.validated.query;
    const out = await svc.listFeedbackAdmin({ page, limit });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function payments(req, res, next) {
  try {
    const { page, limit } = req.validated.query;
    const out = await svc.listPaymentsAdmin({ page, limit });
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function subscriptionAction(req, res, next) {
  try {
    const row = await svc.updateSubscriptionByAction(Number(req.params.id), req.validated.body.action);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function testimonialsAdminGet(req, res, next) {
  try {
    const out = await testimonialSvc.getAdminTestimonials();
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function testimonialsSettingsPut(req, res, next) {
  try {
    const row = await testimonialSvc.updateTestimonialsSettings(req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function testimonialItemPost(req, res, next) {
  try {
    const row = await testimonialSvc.createTestimonialItem(req.validated.body);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

export async function testimonialItemPatch(req, res, next) {
  try {
    const row = await testimonialSvc.updateTestimonialItem(Number(req.params.id), req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function testimonialItemDelete(req, res, next) {
  try {
    const out = await testimonialSvc.deleteTestimonialItem(Number(req.params.id));
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function faqAdminGet(req, res, next) {
  try {
    const out = await faqSvc.getAdminFaq();
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function faqSettingsPut(req, res, next) {
  try {
    const row = await faqSvc.updateFaqSettings(req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function faqItemPost(req, res, next) {
  try {
    const row = await faqSvc.createFaqItem(req.validated.body);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

export async function faqItemPatch(req, res, next) {
  try {
    const row = await faqSvc.updateFaqItem(Number(req.params.id), req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function faqItemDelete(req, res, next) {
  try {
    const out = await faqSvc.deleteFaqItem(Number(req.params.id));
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function aboutAdminGet(req, res, next) {
  try {
    const row = await aboutSvc.getPublicAbout();
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function aboutPut(req, res, next) {
  try {
    const row = await aboutSvc.updateSiteAbout(req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function homeVideoAdminGet(req, res, next) {
  try {
    const row = await homeVideoSvc.getPublicHomeVideo();
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function homeVideoPut(req, res, next) {
  try {
    const row = await homeVideoSvc.updateSiteHomeVideo(req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function heroAdminGet(req, res, next) {
  try {
    const row = await heroSvc.getPublicHero();
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function heroPut(req, res, next) {
  try {
    const row = await heroSvc.updateSiteHero(req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function homeStatsAdminGet(req, res, next) {
  try {
    const row = await homeStatsSvc.getPublicHomeStats();
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function homeStatsPut(req, res, next) {
  try {
    const row = await homeStatsSvc.updateSiteHomeStats(req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function whyUsAdminGet(req, res, next) {
  try {
    const row = await whyUsSvc.getPublicWhyUs();
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function whyUsPut(req, res, next) {
  try {
    const row = await whyUsSvc.updateSiteWhyUs(req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function subscriptionPlansList(req, res, next) {
  try {
    const data = await svc.listSubscriptionPlansAdmin();
    res.json({ data });
  } catch (e) {
    next(e);
  }
}

export async function subscriptionPlanCreate(req, res, next) {
  try {
    const row = await svc.createSubscriptionPlan(req.validated.body);
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
}

export async function subscriptionPlanUpdate(req, res, next) {
  try {
    const row = await svc.updateSubscriptionPlan(req.params.id, req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function dashboardAnalytics(req, res, next) {
  try {
    const out = await svc.getDashboardAnalytics();
    res.json(out);
  } catch (e) {
    next(e);
  }
}

export async function siteSettingsGet(req, res, next) {
  try {
    const row = await svc.getSiteSettings();
    res.json(row);
  } catch (e) {
    next(e);
  }
}

export async function siteSettingsPatch(req, res, next) {
  try {
    const row = await svc.updateSiteSettings(req.validated.body);
    res.json(row);
  } catch (e) {
    next(e);
  }
}
