import { z } from 'zod';

export const feedbackSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  name: z.string().optional(),
  email: z.string().email().optional(),
  comment: z.string().min(1),
});

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
});
