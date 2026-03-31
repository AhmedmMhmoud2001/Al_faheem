/**
 * @param {'ar' | 'en'} lang
 */
export function resolveQuestionTexts(q, lang = 'ar') {
  const useEn = lang === 'en';
  const stem = useEn && q.stemEn?.trim() ? q.stemEn.trim() : q.stem;
  const pick = (en, ar) => (useEn && en?.trim() ? en.trim() : ar);
  return {
    stem,
    options: [
      pick(q.optionAEn, q.optionA),
      pick(q.optionBEn, q.optionB),
      pick(q.optionCEn, q.optionC),
      pick(q.optionDEn, q.optionD),
    ],
    explanation: useEn && q.explanationEn?.trim() ? q.explanationEn.trim() : q.explanation ?? null,
  };
}

export function questionToLearner(q, { includeCorrect = false, lang = 'ar' } = {}) {
  const t = resolveQuestionTexts(q, lang);
  const base = {
    id: q.id,
    subjectId: q.subjectId,
    difficulty: q.difficulty,
    stem: t.stem,
    options: t.options,
    imageUrl: q.imageUrl,
    explanation: t.explanation,
    videoUrl: q.videoUrl,
    pdfUrl: q.pdfUrl,
  };
  if (includeCorrect) base.correctIndex = q.correctIndex;
  return base;
}
