import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(4000),
  JWT_ACCESS_SECRET: z.string().min(8),
  LEARNER_ORIGIN: z.string().default('http://localhost:5173'),
  ADMIN_ORIGIN: z.string().default('http://localhost:5174'),
  UPLOAD_DIR: z.string().default('./uploads'),
  /** Max upload size in bytes (images, PDFs, videos via /admin/uploads). Default 100MB. */
  UPLOAD_MAX_BYTES: z.coerce.number().int().positive().default(100 * 1024 * 1024),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
  throw new Error('Missing or invalid environment variables. Copy .env.example to .env and set secrets (32+ chars).');
}

export const env = parsed.data;
