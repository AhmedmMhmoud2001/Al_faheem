import { z } from 'zod';

export const startPracticeSchema = z.object({
  subjectSlug: z.string().min(1),
  subCategorySlug: z.string().optional().nullable(),
  difficulty: z.coerce.number().int().min(1).max(4),
  limit: z.coerce.number().int().min(1).max(20).default(5),
  lang: z.enum(['ar', 'en']).optional().default('ar'),
});

export const practiceStatsQuerySchema = z.object({
  subjectSlug: z.string().min(1),
  subCategorySlug: z.string().optional(),
  difficulty: z.coerce.number().int().min(1).max(4),
});
