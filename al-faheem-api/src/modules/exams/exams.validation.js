import { z } from 'zod';

export const startExamSchema = z.union([
  z.object({ templateCode: z.literal('TRIAL_24') }),
  z.object({
    subjectSlug: z.string().min(1),
    difficulty: z.coerce.number().int().min(1).max(4),
  }),
]);

export const answerSchema = z.object({
  questionId: z.coerce.number().int().positive(),
  selectedIndex: z.coerce.number().int().min(0).max(3),
  lang: z.enum(['ar', 'en']).optional().default('ar'),
});

export const attemptQuerySchema = z.object({
  lang: z.enum(['ar', 'en']).optional().default('ar'),
});
