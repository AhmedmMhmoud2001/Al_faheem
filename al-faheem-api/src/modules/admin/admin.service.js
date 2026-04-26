import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.js';
import { ensureSiteContactInfoRow, SITE_CONTACT_INFO_ID } from '../../lib/siteContactInfo.js';
import { HttpError } from '../../middleware/errorHandler.js';
import pkg from '@prisma/client';
const { Role, AttemptType } = pkg;

const BCRYPT_SALT = 10;
const SITE_SETTINGS_ID = 1;

// ─── SiteSettings helpers ──────────────────────────────────────────────────

async function ensureSiteSettingsRow() {
  let row = await prisma.siteSettings.findUnique({ where: { id: SITE_SETTINGS_ID } });
  if (!row) {
    row = await prisma.siteSettings.create({ data: { id: SITE_SETTINGS_ID, trialDays: 7 } });
  }
  return row;
}

/** Returns the configured trial period in days (default 7). */
export async function getTrialDays() {
  const row = await ensureSiteSettingsRow();
  return row.trialDays;
}

export async function getSiteSettings() {
  return ensureSiteSettingsRow();
}

export async function updateSiteSettings(data) {
  await ensureSiteSettingsRow();
  return prisma.siteSettings.update({
    where: { id: SITE_SETTINGS_ID },
    data: { trialDays: data.trialDays },
  });
}

const userAdminSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  avatarUrl: true,
  role: true,
  staffRoleId: true,
  staffRole: { select: { id: true, name: true } },
  trialEndsAt: true,
  isActive: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

export async function getUserById(id) {
  const row = await prisma.user.findUnique({
    where: { id },
    select: userAdminSelect,
  });
  if (!row) throw new HttpError(404, 'User not found');
  return row;
}

export async function listUsers({ page, limit, search, role }) {
  const skip = (page - 1) * limit;
  const roleWhere = role === 'ADMIN' || role === 'USER' || role === 'STAFF' ? { role } : {};
  const searchWhere = search
    ? {
        OR: [
          { email: { contains: search } },
          { fullName: { contains: search } },
        ],
      }
    : {};
  const where = { ...roleWhere, ...searchWhere };
  const [total, data] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        staffRoleId: true,
        staffRole: { select: { id: true, name: true } },
        trialEndsAt: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
      },
    }),
  ]);
  return { data, meta: { page, limit, total } };
}

export async function createUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new HttpError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT);
  const trialDays = await getTrialDays();
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

  // Validate staffRoleId when role is STAFF
  let staffRoleId = null;
  if (data.role === 'STAFF') {
    if (data.staffRoleId) {
      const staffRole = await prisma.staffRole.findUnique({ where: { id: data.staffRoleId } });
      if (!staffRole) throw new HttpError(404, 'Staff role not found');
      staffRoleId = data.staffRoleId;
    }
  }

  let roleEnum = Role.USER;
  if (data.role === 'ADMIN') roleEnum = Role.ADMIN;
  if (data.role === 'STAFF') roleEnum = Role.STAFF;

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phone: data.phone ?? null,
      avatarUrl: data.avatarUrl ?? null,
      role: roleEnum,
      staffRoleId,
      isActive: data.isActive ?? true,
      emailVerified: data.emailVerified ?? false,
      trialEndsAt,
    },
    select: userAdminSelect,
  });
}

export async function patchUser(id, data) {
  if (data.email) {
    const taken = await prisma.user.findFirst({
      where: { email: data.email, NOT: { id } },
    });
    if (taken) throw new HttpError(409, 'Email already in use');
  }

  const updateData = {};
  if (data.isActive != null) updateData.isActive = data.isActive;
  if (data.fullName != null) updateData.fullName = data.fullName;
  if (data.email != null) updateData.email = data.email;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, BCRYPT_SALT);
    await prisma.refreshToken.updateMany({ where: { userId: id }, data: { revoked: true } });
  }

  if (Object.keys(updateData).length === 0) {
    return getUserById(id);
  }

  try {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      select: userAdminSelect,
    });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'User not found');
    throw e;
  }
}

export async function deleteUser(id, actorUserId) {
  if (id === actorUserId) throw new HttpError(400, 'Cannot delete your own account');
  try {
    await prisma.user.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'User not found');
    throw e;
  }
  return { ok: true };
}

export async function setUserRole(id, role, staffRoleId) {
  if (!['USER', 'ADMIN', 'STAFF'].includes(role)) throw new HttpError(400, 'Invalid role');

  let roleEnum = Role.USER;
  if (role === 'ADMIN') roleEnum = Role.ADMIN;
  if (role === 'STAFF') roleEnum = Role.STAFF;

  const updateData = { role: roleEnum };

  if (role === 'STAFF') {
    if (staffRoleId) {
      const staffRole = await prisma.staffRole.findUnique({ where: { id: staffRoleId } });
      if (!staffRole) throw new HttpError(404, 'Staff role not found');
      updateData.staffRoleId = staffRoleId;
    } else {
      updateData.staffRoleId = null;
    }
  } else {
    // Clear staffRoleId when changing away from STAFF
    updateData.staffRoleId = null;
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: { id: true, email: true, role: true, staffRoleId: true },
  });
}

export async function setUserTrial(id, trialEndsAt) {
  return prisma.user.update({
    where: { id },
    data: { trialEndsAt: new Date(trialEndsAt) },
    select: { id: true, trialEndsAt: true },
  });
}

export async function listSubjectsAdmin() {
  return prisma.subject.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function createSubject(data) {
  const imageUrl = data.imageUrl && data.imageUrl !== '' ? data.imageUrl : null;
  return prisma.subject.create({ data: { ...data, imageUrl } });
}

export async function updateSubject(id, data) {
  const next = {};
  if (data.slug !== undefined) next.slug = data.slug;
  if (data.nameAr !== undefined) next.nameAr = data.nameAr;
  if (data.nameEn !== undefined) next.nameEn = data.nameEn === '' ? null : data.nameEn;
  if (data.description !== undefined) next.description = data.description === '' ? null : data.description;
  if (data.descriptionEn !== undefined) next.descriptionEn = data.descriptionEn === '' ? null : data.descriptionEn;
  if (data.sortOrder !== undefined) next.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) next.isActive = data.isActive;
  if (data.imageUrl !== undefined) {
    next.imageUrl = data.imageUrl && data.imageUrl !== '' ? data.imageUrl : null;
  }
  if (Object.keys(next).length === 0) {
    const row = await prisma.subject.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, 'Subject not found');
    return row;
  }
  try {
    return await prisma.subject.update({ where: { id }, data: next });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'Subject not found');
    if (e.code === 'P2002') throw new HttpError(409, 'Slug already in use');
    throw e;
  }
}

export async function deleteSubject(id) {
  const qCount = await prisma.question.count({ where: { subjectId: id } });
  if (qCount > 0) {
    throw new HttpError(409, 'Subject has questions; remove or reassign them first.');
  }
  try {
    await prisma.subject.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2003') {
      throw new HttpError(409, 'Cannot delete subject: linked records exist.');
    }
    throw e;
  }
  return { ok: true };
}

// ─── SubCategory ─────────────────────────────────────────────────────────────

export async function listSubcategoriesAdmin(subjectId) {
  const where = subjectId ? { subjectId: Number(subjectId) } : {};
  return prisma.subCategory.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: {
      _count: { select: { questions: true } },
    },
  });
}

export async function createSubCategory(data) {
  const imageUrl = data.imageUrl && data.imageUrl !== '' ? data.imageUrl : null;
  try {
    return await prisma.subCategory.create({
      data: {
        subjectId: Number(data.subjectId),
        slug: data.slug.trim(),
        nameAr: data.nameAr.trim(),
        nameEn: data.nameEn || null,
        description: data.description || null,
        descriptionEn: data.descriptionEn || null,
        imageUrl,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: data.isActive !== false,
      },
    });
  } catch (e) {
    if (e.code === 'P2002') throw new HttpError(409, 'الـ slug مستخدم مسبقاً في هذه المادة');
    if (e.code === 'P2003') throw new HttpError(404, 'المادة غير موجودة');
    throw e;
  }
}

export async function updateSubCategory(id, data) {
  const next = {};
  if (data.slug !== undefined) next.slug = data.slug.trim();
  if (data.nameAr !== undefined) next.nameAr = data.nameAr.trim();
  if (data.nameEn !== undefined) next.nameEn = data.nameEn || null;
  if (data.description !== undefined) next.description = data.description || null;
  if (data.descriptionEn !== undefined) next.descriptionEn = data.descriptionEn || null;
  if (data.sortOrder !== undefined) next.sortOrder = Number(data.sortOrder);
  if (data.isActive !== undefined) next.isActive = data.isActive;
  if (data.imageUrl !== undefined) {
    next.imageUrl = data.imageUrl && data.imageUrl !== '' ? data.imageUrl : null;
  }
  if (Object.keys(next).length === 0) {
    const row = await prisma.subCategory.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, 'التصنيف الفرعي غير موجود');
    return row;
  }
  try {
    return await prisma.subCategory.update({ where: { id }, data: next });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'التصنيف الفرعي غير موجود');
    if (e.code === 'P2002') throw new HttpError(409, 'الـ slug مستخدم مسبقاً في هذه المادة');
    throw e;
  }
}

export async function deleteSubCategory(id) {
  const qCount = await prisma.question.count({ where: { subCategoryId: id } });
  if (qCount > 0) throw new HttpError(409, 'التصنيف مرتبط بأسئلة؛ انقل أو احذف الأسئلة أولاً');
  try {
    await prisma.subCategory.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'التصنيف الفرعي غير موجود');
    throw e;
  }
  return { ok: true };
}

// ─── Questions ───────────────────────────────────────────────────────────────

export async function listQuestionsAdmin({ subjectId, subCategoryId, difficulty, isPublished, includeInExam, page, limit }) {
  const skip = (page - 1) * limit;
  const where = {
    ...(subjectId ? { subjectId } : {}),
    ...(subCategoryId ? { subCategoryId } : {}),
    ...(difficulty != null ? { difficulty } : {}),
    ...(isPublished != null ? { isPublished } : {}),
    ...(includeInExam != null ? { includeInExam } : {}),
  };
  const [total, data] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
      include: { subject: true },
    }),
  ]);
  return { data, meta: { page, limit, total } };
}

export async function getQuestionById(id) {
  const row = await prisma.question.findUnique({
    where: { id },
    include: { subject: true },
  });
  if (!row) throw new HttpError(404, 'Question not found');
  return row;
}

export async function createQuestion(data) {
  return prisma.question.create({
    data: {
      subjectId: data.subjectId,
      subCategoryId: data.subCategoryId ?? null,
      difficulty: data.difficulty,
      sortOrder: data.sortOrder ?? 0,
      stem: data.stem,
      stemEn: data.stemEn,
      optionA: data.optionA,
      optionAEn: data.optionAEn,
      optionAImageUrl: data.optionAImageUrl ?? null,
      optionAImageUrlEn: data.optionAImageUrlEn ?? null,
      optionB: data.optionB,
      optionBEn: data.optionBEn,
      optionBImageUrl: data.optionBImageUrl ?? null,
      optionBImageUrlEn: data.optionBImageUrlEn ?? null,
      optionC: data.optionC,
      optionCEn: data.optionCEn,
      optionCImageUrl: data.optionCImageUrl ?? null,
      optionCImageUrlEn: data.optionCImageUrlEn ?? null,
      optionD: data.optionD,
      optionDEn: data.optionDEn,
      optionDImageUrl: data.optionDImageUrl ?? null,
      optionDImageUrlEn: data.optionDImageUrlEn ?? null,
      correctIndex: data.correctIndex,
      imageUrl: data.imageUrl,
      explanation: data.explanation,
      explanationEn: data.explanationEn,
      videoUrl: data.videoUrl,
      pdfUrl: data.pdfUrl,
      isPublished: data.isPublished ?? false,
      includeInExam: data.includeInExam ?? false,
    },
  });
}

export async function updateQuestion(id, data) {
  const imageKeys = [
    'optionAImageUrl',
    'optionAImageUrlEn',
    'optionBImageUrl',
    'optionBImageUrlEn',
    'optionCImageUrl',
    'optionCImageUrlEn',
    'optionDImageUrl',
    'optionDImageUrlEn',
    'imageUrl',
  ];
  const next = { ...data };
  for (const k of imageKeys) {
    if (next[k] === '') next[k] = null;
  }
  return prisma.question.update({ where: { id }, data: next });
}

export async function deleteQuestion(id) {
  await prisma.question.delete({ where: { id } });
  return { ok: true };
}

export async function listExamTemplates() {
  return prisma.examTemplate.findMany({ orderBy: { id: 'asc' } });
}

export async function createExamTemplate(data) {
  return prisma.examTemplate.create({
    data: {
      code: data.code,
      name: data.name,
      attemptType: data.attemptType ?? AttemptType.EXAM_TRIAL,
      questionCount: data.questionCount,
      totalDurationSec: data.totalDurationSec ?? null,
      perQuestionSec: data.perQuestionSec ?? null,
      allowResume: data.allowResume ?? true,
      subjectId: data.subjectId ?? null,
      difficulty: data.difficulty ?? null,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateExamTemplate(id, data) {
  return prisma.examTemplate.update({ where: { id }, data });
}

export async function listAttemptsAdmin({ userId, page, limit }) {
  const skip = (page - 1) * limit;
  const where = userId ? { userId } : {};
  const [total, data] = await Promise.all([
    prisma.attempt.count({ where }),
    prisma.attempt.findMany({
      where,
      skip,
      take: limit,
      orderBy: { startedAt: 'desc' },
      include: { user: { select: { email: true, fullName: true } }, template: true },
    }),
  ]);
  return { data, meta: { page, limit, total } };
}

export async function listContact({ page, limit }) {
  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    prisma.contactMessage.count(),
    prisma.contactMessage.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return { data, meta: { page, limit, total } };
}

export async function patchContact(id, status) {
  return prisma.contactMessage.update({ where: { id }, data: { status } });
}

function normalizeSiteContactPayload(body) {
  const keys = [
    'introAr',
    'introEn',
    'phone',
    'email',
    'facebookUrl',
    'instagramUrl',
    'whatsappUrl',
    'youtubeUrl',
  ];
  const out = {};
  for (const k of keys) {
    if (!(k in body)) continue;
    const v = body[k];
    out[k] = v == null || String(v).trim() === '' ? null : String(v).trim();
  }
  return out;
}

export async function getSiteContactInfoAdmin() {
  return ensureSiteContactInfoRow();
}

export async function upsertSiteContactInfo(body) {
  await ensureSiteContactInfoRow();
  const patch = normalizeSiteContactPayload(body);
  if (Object.keys(patch).length === 0) {
    return prisma.siteContactInfo.findUnique({ where: { id: SITE_CONTACT_INFO_ID } });
  }
  return prisma.siteContactInfo.update({
    where: { id: SITE_CONTACT_INFO_ID },
    data: patch,
  });
}

export async function listFeedbackAdmin({ page, limit }) {
  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    prisma.feedback.count(),
    prisma.feedback.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
  ]);
  return { data, meta: { page, limit, total } };
}

export async function listPaymentsAdmin({ page, limit }) {
  const skip = (page - 1) * limit;
  const [total, data] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, fullName: true } }, subscription: true },
    }),
  ]);
  return { data, meta: { page, limit, total } };
}

export async function updateSubscriptionByAction(id, action) {
  const subId = Number(id);
  if (!Number.isFinite(subId)) throw new HttpError(400, 'Invalid id');
  const sub = await prisma.subscription.findUnique({ where: { id: subId }, include: { plan: true } });
  if (!sub) throw new HttpError(404, 'Subscription not found');

  const now = new Date();
  if (action === 'cancel_now') {
    return prisma.subscription.update({
      where: { id: subId },
      data: { status: 'CANCELED', currentPeriodEnd: now, cancelAtPeriodEnd: false },
    });
  }
  if (action === 'cancel_at_period_end') {
    return prisma.subscription.update({
      where: { id: subId },
      data: { cancelAtPeriodEnd: true },
    });
  }
  if (action === 'reactivate') {
    // Reactivate immediately and extend period minimally if already ended
    let end = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : new Date(now);
    if (!sub.currentPeriodEnd || end <= now) {
      switch (sub.plan.interval) {
        case 'day': end.setDate(now.getDate() + 1); break;
        case 'week': end.setDate(now.getDate() + 7); break;
        case 'month': end.setMonth(now.getMonth() + 1); break;
        case 'year': end.setFullYear(now.getFullYear() + 1); break;
        default: end.setMonth(now.getMonth() + 1); break;
      }
    }
    return prisma.subscription.update({
      where: { id: subId },
      data: { status: 'ACTIVE', currentPeriodStart: now, currentPeriodEnd: end, cancelAtPeriodEnd: false },
    });
  }
  throw new HttpError(400, 'Invalid action');
}
export async function listSubscriptionPlansAdmin() {
  const rows = await prisma.subscriptionPlan.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    include: { _count: { select: { subscriptions: true } } },
  });
  return rows.map(({ _count, ...r }) => ({
    ...r,
    subscriptionCount: _count.subscriptions,
  }));
}

export async function createSubscriptionPlan(data) {
  const existing = await prisma.subscriptionPlan.findUnique({ where: { slug: data.slug } });
  if (existing) throw new HttpError(409, 'هذا المعرّف (slug) مستخدم مسبقاً');
  return prisma.subscriptionPlan.create({
    data: {
      slug: data.slug,
      name: data.name,
      priceCents: data.priceCents,
      currency: data.currency || 'USD',
      interval: data.interval,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive !== false,
    },
  });
}

export async function updateSubscriptionPlan(id, body) {
  const planId = Number(id);
  if (!Number.isFinite(planId)) throw new HttpError(400, 'Invalid id');
  const row = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
  if (!row) throw new HttpError(404, 'الباقة غير موجودة');
  const next = {};
  if (body.name !== undefined) next.name = body.name;
  if (body.priceCents !== undefined) next.priceCents = body.priceCents;
  if (body.currency !== undefined) next.currency = body.currency;
  if (body.interval !== undefined) next.interval = body.interval;
  if (body.sortOrder !== undefined) next.sortOrder = body.sortOrder;
  if (body.isActive !== undefined) next.isActive = body.isActive;
  if (body.slug !== undefined && body.slug !== row.slug) {
    const clash = await prisma.subscriptionPlan.findUnique({ where: { slug: body.slug } });
    if (clash) throw new HttpError(409, 'هذا المعرّف (slug) مستخدم مسبقاً');
    next.slug = body.slug;
  }
  if (Object.keys(next).length === 0) return row;
  return prisma.subscriptionPlan.update({ where: { id: planId }, data: next });
}

function ymdLocal(d) {
  const x = d instanceof Date ? d : new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Last N calendar days (local), oldest first: ['YYYY-MM-DD', ...] */
function rollingDayKeys(n) {
  const keys = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(ymdLocal(d));
  }
  return keys;
}

/**
 * Admin dashboard: aggregate totals + per-day attempts & new users (MySQL).
 */
export async function getDashboardAnalytics() {
  const dayCount = 14;
  const dayKeys = rollingDayKeys(dayCount);
  const [y0, m0, d0] = dayKeys[0].split('-').map(Number);
  const startBoundary = new Date(y0, m0 - 1, d0, 0, 0, 0, 0);

  const [
    users,
    questions,
    attempts,
    contact,
    subjects,
    feedback,
    attemptAgg,
    userAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.question.count(),
    prisma.attempt.count(),
    prisma.contactMessage.count(),
    prisma.subject.count(),
    prisma.feedback.count(),
    prisma.$queryRaw`
      SELECT DATE(startedAt) AS d, COUNT(*) AS c
      FROM \`Attempt\`
      WHERE startedAt >= ${startBoundary}
      GROUP BY DATE(startedAt)
      ORDER BY d ASC
    `,
    prisma.$queryRaw`
      SELECT DATE(createdAt) AS d, COUNT(*) AS c
      FROM \`User\`
      WHERE createdAt >= ${startBoundary}
      GROUP BY DATE(createdAt)
      ORDER BY d ASC
    `,
  ]);

  const rowKey = (row) => ymdLocal(row.d);

  const asCount = (v) => (typeof v === 'bigint' ? Number(v) : Number(v));
  const attemptMap = new Map(attemptAgg.map((r) => [rowKey(r), asCount(r.c)]));
  const userMap = new Map(userAgg.map((r) => [rowKey(r), asCount(r.c)]));

  const attemptsByDay = dayKeys.map((date) => ({ date, count: attemptMap.get(date) ?? 0 }));
  const usersByDay = dayKeys.map((date) => ({ date, count: userMap.get(date) ?? 0 }));

  return {
    totals: {
      users,
      questions,
      attempts,
      contact,
      subjects,
      feedback,
    },
    attemptsByDay,
    usersByDay,
  };
}
