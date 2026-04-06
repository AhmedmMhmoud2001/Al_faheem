import { prisma } from '../../lib/prisma.js';
import pkg from '@prisma/client';
const { AttemptStatus, AttemptType } = pkg;
import { userHasContentAccess } from '../../services/entitlement.service.js';
import { HttpError } from '../../middleware/errorHandler.js';
import { questionToLearner, resolveQuestionTexts } from '../../services/questions.util.js';
import { applyAttemptOutcome } from '../../services/progress.service.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * @param {Date} startedAt
 * @param {{ totalDurationSec: number | null, perQuestionSec: number | null, questionCount: number }} template
 * @param {number} [actualQuestionCount] — when fewer questions exist in the bank than template.questionCount
 */
function computeExpiresAt(startedAt, template, actualQuestionCount = template.questionCount) {
  const n = Math.max(1, actualQuestionCount);
  if (template.totalDurationSec != null) {
    if (template.questionCount > 0 && n < template.questionCount) {
      const scaled = Math.ceil((template.totalDurationSec * n) / template.questionCount);
      return new Date(startedAt.getTime() + scaled * 1000);
    }
    return new Date(startedAt.getTime() + template.totalDurationSec * 1000);
  }
  if (template.perQuestionSec != null) {
    return new Date(startedAt.getTime() + n * template.perQuestionSec * 1000);
  }
  return new Date(startedAt.getTime() + 45 * 60 * 1000);
}

export async function getTrialTemplatePublic() {
  const tpl = await prisma.examTemplate.findUnique({ where: { code: 'TRIAL_24' } });
  if (!tpl || !tpl.isActive) {
    return {
      isActive: false,
      questionCount: 0,
      totalDurationSec: null,
      perQuestionSec: null,
    };
  }
  return {
    isActive: true,
    questionCount: tpl.questionCount,
    totalDurationSec: tpl.totalDurationSec,
    perQuestionSec: tpl.perQuestionSec,
  };
}

export async function startExam(userId, body) {
  const ok = await userHasContentAccess(userId);
  if (!ok) throw new HttpError(403, 'Subscription or active trial required');

  let template;
  let subjectIdFilter = null;
  let difficultyFilter = null;
  let attemptType = AttemptType.EXAM_TRIAL;

  if ('templateCode' in body && body.templateCode === 'TRIAL_24') {
    template = await prisma.examTemplate.findUnique({ where: { code: 'TRIAL_24' } });
    attemptType = AttemptType.EXAM_TRIAL;
  } else {
    template = await prisma.examTemplate.findUnique({ where: { code: 'TOPIC_24' } });
    attemptType = AttemptType.EXAM_TOPIC;
    const subject = await prisma.subject.findFirst({
      where: { slug: body.subjectSlug, isActive: true },
    });
    if (!subject) throw new HttpError(404, 'Subject not found');
    subjectIdFilter = subject.id;
    difficultyFilter = body.difficulty;
  }

  if (!template || !template.isActive) throw new HttpError(404, 'Exam template not found');

  const where = {
    isPublished: true,
    ...(subjectIdFilter != null ? { subjectId: subjectIdFilter, difficulty: difficultyFilter } : {}),
  };

  const pool = await prisma.question.findMany({
    where,
    select: { id: true },
  });
  if (pool.length === 0) {
    throw new HttpError(
      400,
      'No published questions for this topic and difficulty. Add questions in admin or pick another level.',
    );
  }

  const takeCount = Math.min(pool.length, template.questionCount);
  const ids = shuffle(pool.map((p) => p.id)).slice(0, takeCount);
  const startedAt = new Date();
  const expiresAt = computeExpiresAt(startedAt, template, takeCount);

  const attempt = await prisma.attempt.create({
    data: {
      userId,
      templateId: template.id,
      type: attemptType,
      status: AttemptStatus.IN_PROGRESS,
      startedAt,
      expiresAt,
      questionIdsJson: JSON.stringify(ids),
      currentIndex: 0,
    },
  });

  return {
    attemptId: attempt.id,
    type: attemptType,
    questionIds: ids,
    expiresAt: attempt.expiresAt.toISOString(),
    serverNow: new Date().toISOString(),
    allowResume: template.allowResume,
    perQuestionSec: template.perQuestionSec,
    totalDurationSec: template.totalDurationSec,
  };
}

export async function getAttempt(userId, attemptId, { lang = 'ar' } = {}) {
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId },
    include: {
      template: true,
      answers: true,
    },
  });
  if (!attempt) throw new HttpError(404, 'Attempt not found');

  const now = new Date();
  if (attempt.status === AttemptStatus.IN_PROGRESS && now > attempt.expiresAt) {
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: { status: AttemptStatus.EXPIRED },
    });
    attempt.status = AttemptStatus.EXPIRED;
  }

  const questionIds = JSON.parse(attempt.questionIdsJson);
  const answerMap = new Map(attempt.answers.map((a) => [a.questionId, a]));

  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });
  const order = new Map(questionIds.map((id, i) => [id, i]));
  questions.sort((a, b) => order.get(a.id) - order.get(b.id));

  const payload = questions.map((q) => {
    const ans = answerMap.get(q.id);
    const base = questionToLearner(q, { includeCorrect: false, lang });
    if (ans?.selectedIndex != null) {
      base.userAnswerIndex = ans.selectedIndex;
      base.isCorrect = ans.isCorrect;
      if (ans.isCorrect === false) base.correctIndex = q.correctIndex;
    }
    return base;
  });

  return {
    attemptId: attempt.id,
    status: attempt.status,
    expiresAt: attempt.expiresAt.toISOString(),
    serverNow: now.toISOString(),
    questionIds,
    questions: payload,
    correctCount: attempt.correctCount,
    wrongCount: attempt.wrongCount,
    submittedAt: attempt.submittedAt,
  };
}

export async function submitAnswer(userId, attemptId, { questionId, selectedIndex, lang = 'ar' }) {
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId },
    include: { template: true },
  });
  if (!attempt) throw new HttpError(404, 'Attempt not found');
  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    throw new HttpError(409, 'Attempt is not active');
  }

  const now = new Date();
  if (now > attempt.expiresAt) {
    await prisma.attempt.update({
      where: { id: attempt.id },
      data: { status: AttemptStatus.EXPIRED },
    });
    throw new HttpError(410, 'Exam time has expired');
  }

  const questionIds = JSON.parse(attempt.questionIdsJson);
  if (!questionIds.includes(questionId)) {
    throw new HttpError(400, 'Question is not part of this attempt');
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) throw new HttpError(404, 'Question not found');

  const isCorrect = selectedIndex === question.correctIndex;
  const serverTimeSec = Math.floor((now.getTime() - attempt.startedAt.getTime()) / 1000);

  await prisma.attemptAnswer.upsert({
    where: {
      attemptId_questionId: { attemptId, questionId },
    },
    create: {
      attemptId,
      questionId,
      selectedIndex,
      isCorrect,
      answeredAt: now,
      serverTimeSec,
    },
    update: {
      selectedIndex,
      isCorrect,
      answeredAt: now,
      serverTimeSec,
    },
  });

  const idx = questionIds.indexOf(questionId);
  if (idx >= 0) {
    await prisma.attempt.update({
      where: { id: attemptId },
      data: { currentIndex: idx },
    });
  }

  const texts = resolveQuestionTexts(question, lang);
  return {
    questionId,
    isCorrect,
    correctIndex: isCorrect ? undefined : question.correctIndex,
    explanation: isCorrect ? undefined : texts.explanation,
  };
}

export async function submitAttempt(userId, attemptId) {
  const attempt = await prisma.attempt.findFirst({
    where: { id: attemptId, userId },
    include: { answers: true },
  });
  if (!attempt) throw new HttpError(404, 'Attempt not found');
  if (attempt.status === AttemptStatus.SUBMITTED) {
    throw new HttpError(409, 'Already submitted');
  }
  if (attempt.status === AttemptStatus.EXPIRED) {
    throw new HttpError(410, 'Attempt expired');
  }

  const questionIds = JSON.parse(attempt.questionIdsJson);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
  });
  const correctById = new Map(questions.map((q) => [q.id, q.correctIndex]));
  const answerByQ = new Map(attempt.answers.map((a) => [a.questionId, a]));

  let correct = 0;
  let wrong = 0;
  const perQuestion = [];

  for (const qid of questionIds) {
    const ans = answerByQ.get(qid);
    const expected = correctById.get(qid);
    if (ans?.selectedIndex == null) {
      wrong += 1;
      perQuestion.push('wrong');
      continue;
    }
    const ok = ans.selectedIndex === expected;
    if (ok) {
      correct += 1;
      perQuestion.push('correct');
    } else {
      wrong += 1;
      perQuestion.push('wrong');
    }
    if (ans.isCorrect !== ok) {
      await prisma.attemptAnswer.update({
        where: { attemptId_questionId: { attemptId, questionId: qid } },
        data: { isCorrect: ok },
      });
    }
  }

  const detailed = questionIds.map((qid) => {
    const ans = answerByQ.get(qid);
    const expected = correctById.get(qid);
    const isCorrect = ans?.selectedIndex != null && ans.selectedIndex === expected;
    return { questionId: qid, isCorrect };
  });

  await prisma.$transaction([
    prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.SUBMITTED,
        submittedAt: new Date(),
        correctCount: correct,
        wrongCount: wrong,
      },
    }),
  ]);

  await applyAttemptOutcome(userId, detailed);

  return {
    attemptId,
    score: { correct, wrong, total: questionIds.length },
    perQuestion,
  };
}
