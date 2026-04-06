import { prisma } from '../../lib/prisma.js';
import { userHasContentAccess } from '../../services/entitlement.service.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { questionToLearner, resolveQuestionTexts } from '../../services/questions.util.js';

export async function getQuestionExplanation(userId, questionId, { lang = 'ar' } = {}) {
  if (userId == null) throw new HttpError(403, 'Subscription or active trial required');
  const ok = await userHasContentAccess(userId);
  if (!ok) throw new HttpError(403, 'Subscription or active trial required');

  const q = await prisma.question.findFirst({
    where: { id: questionId, isPublished: true },
    include: { subject: true },
  });
  if (!q) throw new HttpError(404, 'Question not found');

  const t = resolveQuestionTexts(q, lang);
  return {
    id: q.id,
    stem: t.stem,
    options: t.options,
    correctIndex: q.correctIndex,
    explanation: t.explanation,
    videoUrl: q.videoUrl,
    pdfUrl: q.pdfUrl,
    imageUrl: q.imageUrl,
    subjectSlug: q.subject.slug,
  };
}

export async function listQuestionsBySlug(userId, slug, { difficulty, subCategorySlug, page, limit, lang = 'ar' }) {
  // Only enforce entitlement when user is authenticated; unauthenticated requests
  // are allowed for count / progress-bar purposes (no answers exposed).
  if (userId != null) {
    const ok = await userHasContentAccess(userId);
    if (!ok) throw new HttpError(403, 'Subscription or active trial required');
  }

  const subject = await prisma.subject.findFirst({ where: { slug, isActive: true } });
  if (!subject) throw new HttpError(404, 'Subject not found');

  // Resolve subcategory filter
  let subCategoryId;
  if (subCategorySlug) {
    const sc = await prisma.subCategory.findFirst({
      where: { slug: subCategorySlug, subjectId: subject.id, isActive: true },
    });
    subCategoryId = sc?.id;
  }

  const where = {
    subjectId: subject.id,
    isPublished: true,
    ...(difficulty != null ? { difficulty } : {}),
    ...(subCategoryId != null ? { subCategoryId } : {}),
  };

  const skip = (page - 1) * limit;
  const [total, rows] = await Promise.all([
    prisma.question.count({ where }),
    prisma.question.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    }),
  ]);

  return {
    data: rows.map((q) => questionToLearner(q, { includeCorrect: false, lang })),
    meta: { page, limit, total, subjectSlug: slug },
  };
}
