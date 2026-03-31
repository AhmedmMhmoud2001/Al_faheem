import { z } from 'zod';

export const checkoutSchema = z.object({
  planSlug: z.string().min(1),
});
