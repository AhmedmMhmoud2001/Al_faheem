/**
 * @param {'ar' | 'en'} lang
 */
export function resolveQuestionTexts(q, lang = 'ar') {
  const useEn = lang === 'en';
  const stem = useEn && q.stemEn?.trim() ? q.stemEn.trim() : q.stem;
  const pick = (en, ar) => (useEn && en?.trim() ? en.trim() : ar);
  const pickImage = (en, ar) => (useEn ? (en ?? ar ?? null) : (ar ?? null));
  const options = [
    {
      text: pick(q.optionAEn, q.optionA),
      imageUrl: pickImage(q.optionAImageUrlEn, q.optionAImageUrl),
    },
    {
      text: pick(q.optionBEn, q.optionB),
      imageUrl: pickImage(q.optionBImageUrlEn, q.optionBImageUrl),
    },
    {
      text: pick(q.optionCEn, q.optionC),
      imageUrl: pickImage(q.optionCImageUrlEn, q.optionCImageUrl),
    },
    {
      text: pick(q.optionDEn, q.optionD),
      imageUrl: pickImage(q.optionDImageUrlEn, q.optionDImageUrl),
    },
  ];
  return {
    stem,
    options,
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
