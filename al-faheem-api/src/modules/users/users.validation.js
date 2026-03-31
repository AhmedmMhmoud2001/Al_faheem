import { z } from 'zod';

export const patchMeSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  /** Relative path from API (e.g. /uploads/images/...) or https URL */
  avatarUrl: z
    .string()
    .optional()
    .nullable()
    .refine(
      (s) => s == null || s === '' || s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://'),
      { message: 'Invalid avatar URL' },
    ),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
