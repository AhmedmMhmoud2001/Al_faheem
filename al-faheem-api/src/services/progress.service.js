import { prisma } from '../lib/prisma.js';

/**
 * After an attempt is finalized, update per-subject aggregates and mistake book.
 */
export async function applyAttemptOutcome(userId, answersDetailed) {
  // answersDetailed: { questionId, isCorrect }[]
  const questionIds = [...new Set(answersDetailed.map((a) => a.questionId))];
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, subjectId: true },
  });
  const qMap = new Map(questions.map((q) => [q.id, q.subjectId]));

  const bySubject = new Map();
  for (const row of answersDetailed) {
    const sid = qMap.get(row.questionId);
    if (sid == null) continue;
    if (!bySubject.has(sid)) bySubject.set(sid, { total: 0, correct: 0 });
    const b = bySubject.get(sid);
    b.total += 1;
    if (row.isCorrect) b.correct += 1;
  }

  for (const [subjectId, { total, correct }] of bySubject) {
    const percent = total ? Math.round((correct / total) * 100) : 0;
    await prisma.userSubjectProgress.upsert({
      where: { userId_subjectId: { userId, subjectId } },
      create: {
        userId,
        subjectId,
        answeredTotal: total,
        answeredCorrect: correct,
        percentSnapshot: percent,
        lastActivityAt: new Date(),
      },
      update: {
        answeredTotal: { increment: total },
        answeredCorrect: { increment: correct },
        lastActivityAt: new Date(),
      },
    });
    const row = await prisma.userSubjectProgress.findUnique({
      where: { userId_subjectId: { userId, subjectId } },
    });
    if (row && row.answeredTotal > 0) {
      const p = Math.round((row.answeredCorrect / row.answeredTotal) * 100);
      await prisma.userSubjectProgress.update({
        where: { userId_subjectId: { userId, subjectId } },
        data: { percentSnapshot: p },
      });
    }
  }

  for (const row of answersDetailed) {
    if (row.isCorrect) continue;
    await prisma.userMistake.upsert({
      where: { userId_questionId: { userId, questionId: row.questionId } },
      create: {
        userId,
        questionId: row.questionId,
        wrongCount: 1,
        lastWrongAt: new Date(),
      },
      update: {
        wrongCount: { increment: 1 },
        lastWrongAt: new Date(),
      },
    });
  }
}
