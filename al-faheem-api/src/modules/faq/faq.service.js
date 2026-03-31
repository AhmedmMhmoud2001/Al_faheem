import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

/** Prisma enum values (avoid named import from CJS @prisma/client in ESM). */
const FAQ_SCOPE = { GENERAL: 'GENERAL', PAYMENT: 'PAYMENT' };

const DEFAULT_SETTINGS = {
  id: 1,
  introAr: '',
  introEn: null,
  titleHighlightAr: 'الأسئلة',
  titleRestAr: ' الأكثر شيوعا',
  titleHighlightEn: 'Questions',
  titleRestEn: ' most asked',
};

export async function ensureFaqSettings() {
  const existing = await prisma.faqSettings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  try {
    return await prisma.faqSettings.create({ data: DEFAULT_SETTINGS });
  } catch (e) {
    if (e.code === 'P2002') {
      return prisma.faqSettings.findUniqueOrThrow({ where: { id: 1 } });
    }
    throw e;
  }
}

/**
 * @param {'general' | 'payment'} scopeFilter - homepage vs subscriptions/payment FAQs
 */
export async function getPublicFaq(scopeFilter = 'general') {
  const scope = scopeFilter === 'payment' ? FAQ_SCOPE.PAYMENT : FAQ_SCOPE.GENERAL;
  const settings = await ensureFaqSettings();
  const items = await prisma.faqItem.findMany({
    where: { isActive: true, scope },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      scope: true,
      questionAr: true,
      questionEn: true,
      answerAr: true,
      answerEn: true,
      sortOrder: true,
    },
  });
  return { settings, items };
}

export async function getAdminFaq() {
  const settings = await ensureFaqSettings();
  const items = await prisma.faqItem.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return { settings, items };
}

export async function updateFaqSettings(data) {
  await ensureFaqSettings();
  const next = {};
  if (data.introAr !== undefined) next.introAr = data.introAr;
  if (data.introEn !== undefined) next.introEn = data.introEn === '' ? null : data.introEn;
  if (data.titleHighlightAr !== undefined) next.titleHighlightAr = data.titleHighlightAr;
  if (data.titleRestAr !== undefined) next.titleRestAr = data.titleRestAr;
  if (data.titleHighlightEn !== undefined)
    next.titleHighlightEn = data.titleHighlightEn === '' ? null : data.titleHighlightEn;
  if (data.titleRestEn !== undefined) next.titleRestEn = data.titleRestEn === '' ? null : data.titleRestEn;
  if (Object.keys(next).length === 0) {
    return prisma.faqSettings.findUnique({ where: { id: 1 } });
  }
  return prisma.faqSettings.update({ where: { id: 1 }, data: next });
}

export async function createFaqItem(data) {
  const scope =
    data.scope === 'PAYMENT' || data.scope === FAQ_SCOPE.PAYMENT ? FAQ_SCOPE.PAYMENT : FAQ_SCOPE.GENERAL;
  return prisma.faqItem.create({
    data: {
      scope,
      questionAr: data.questionAr,
      questionEn: data.questionEn === '' || data.questionEn == null ? null : data.questionEn,
      answerAr: data.answerAr,
      answerEn: data.answerEn === '' || data.answerEn == null ? null : data.answerEn,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateFaqItem(id, data) {
  const next = {};
  if (data.scope !== undefined) {
    next.scope =
      data.scope === 'PAYMENT' || data.scope === FAQ_SCOPE.PAYMENT ? FAQ_SCOPE.PAYMENT : FAQ_SCOPE.GENERAL;
  }
  if (data.questionAr !== undefined) next.questionAr = data.questionAr;
  if (data.questionEn !== undefined) next.questionEn = data.questionEn === '' ? null : data.questionEn;
  if (data.answerAr !== undefined) next.answerAr = data.answerAr;
  if (data.answerEn !== undefined) next.answerEn = data.answerEn === '' ? null : data.answerEn;
  if (data.sortOrder !== undefined) next.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) next.isActive = data.isActive;
  if (Object.keys(next).length === 0) {
    const row = await prisma.faqItem.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, 'FAQ item not found');
    return row;
  }
  try {
    return await prisma.faqItem.update({ where: { id }, data: next });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'FAQ item not found');
    throw e;
  }
}

export async function deleteFaqItem(id) {
  try {
    await prisma.faqItem.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'FAQ item not found');
    throw e;
  }
  return { ok: true };
}
