import { z } from 'zod';

export const questionsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  difficulty: z.coerce.number().int().min(1).max(4).optional(),
  subCategorySlug: z.string().optional(),
  lang: z.enum(['ar', 'en']).optional().default('ar'),
});

export const questionByIdQuerySchema = z.object({
  lang: z.enum(['ar', 'en']).optional().default('ar'),
});
