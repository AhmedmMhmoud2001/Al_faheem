import { AttemptStatus, AttemptType } from '@prisma/client';
import { prisma } from '../../lib/prisma.js';
import { userHasContentAccess } from '../../services/entitlement.service.js';
import { HttpError } from '../../middleware/errorHandler.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function computeExpiresAt(startedAt, template) {
  if (template.totalDurationSec != null) {
    return new Date(startedAt.getTime() + template.totalDurationSec * 1000);
  }
  if (template.perQuestionSec != null) {
    return new Date(startedAt.getTime() + template.questionCount * template.perQuestionSec * 1000);
  }
  return new Date(startedAt.getTime() + 45 * 60 * 1000);
}

export async function practiceStageStats(userId, subjectSlug, difficulty) {
  const subject = await prisma.subject.findFirst({ where: { slug: subjectSlug, isActive: true } });
  if (!subject) throw new HttpError(404, 'Subject not found');

  const answeredInStage = await prisma.attemptAnswer.count({
    where: {
      attempt: { userId, type: AttemptType.PRACTICE },
      question: { subjectId: subject.id, difficulty },
    },
  });
  const correctInStage = await prisma.attemptAnswer.count({
    where: {
      attempt: { userId, type: AttemptType.PRACTICE },
      question: { subjectId: subject.id, difficulty },
      isCorrect: true,
    },
  });

  return { answeredInStage, correctInStage };
}

export async function startPractice(userId, { subjectSlug, difficulty, limit, lang: _lang = 'ar' }) {
  const ok = await userHasContentAccess(userId);
  if (!ok) throw new HttpError(403, 'Subscription or active trial required');

  const subject = await prisma.subject.findFirst({ where: { slug: subjectSlug, isActive: true } });
  if (!subject) throw new HttpError(404, 'Subject not found');

  const template = await prisma.examTemplate.findUnique({ where: { code: 'PRACTICE' } });
  if (!template?.isActive) throw new HttpError(404, 'Practice template not found');

  const pool = await prisma.question.findMany({
    where: { subjectId: subject.id, difficulty, isPublished: true },
    select: { id: true },
  });
  if (pool.length === 0) throw new HttpError(404, 'No questions for this filter');

  const cap = Math.min(limit, pool.length, template.questionCount);
  const ids = shuffle(pool.map((p) => p.id)).slice(0, cap);
  const startedAt = new Date();
  const expiresAt = computeExpiresAt(startedAt, template);

  const attempt = await prisma.attempt.create({
    data: {
      userId,
      templateId: template.id,
      type: AttemptType.PRACTICE,
      status: AttemptStatus.IN_PROGRESS,
      startedAt,
      expiresAt,
      questionIdsJson: JSON.stringify(ids),
      currentIndex: 0,
    },
  });

  const { answeredInStage, correctInStage } = await practiceStageStats(userId, subjectSlug, difficulty);

  return {
    attemptId: attempt.id,
    questionIds: ids,
    expiresAt: attempt.expiresAt.toISOString(),
    serverNow: new Date().toISOString(),
    stageStats: { answeredInStage, correctInStage },
  };
}
