import { z } from 'zod';
import { AttemptType } from '@prisma/client';

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  userId: z.string().optional(),
  subjectId: z.coerce.number().int().optional(),
  difficulty: z.coerce.number().int().min(1).max(4).optional(),
  isPublished: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
});

export const patchUserSchema = z.object({
  isActive: z.boolean().optional(),
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional().nullable(),
  password: z.string().min(8).optional(),
  avatarUrl: z.string().optional().nullable(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().optional().nullable(),
  role: z.enum(['USER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  emailVerified: z.boolean().optional(),
  avatarUrl: z.string().optional().nullable(),
});

export const setRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN']),
});

export const setTrialSchema = z.object({
  trialEndsAt: z.string().datetime(),
});

const subjectImageUrl = z
  .string()
  .optional()
  .nullable()
  .refine(
    (s) => s == null || s === '' || s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://'),
    { message: 'Invalid image URL' },
  );

export const subjectCreateSchema = z.object({
  slug: z.string().min(1),
  nameAr: z.string().min(1),
  nameEn: z.string().nullish(),
  description: z.string().nullish(),
  descriptionEn: z.string().nullish(),
  imageUrl: subjectImageUrl,
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

/** Explicit partial — avoid `.partial()` on fields with `.default()` (can confuse Zod / send bad values). */
export const subjectUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().nullish(),
  description: z.string().nullish(),
  descriptionEn: z.string().nullish(),
  imageUrl: subjectImageUrl,
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const questionCreateSchema = z.object({
  subjectId: z.coerce.number().int(),
  difficulty: z.coerce.number().int().min(1).max(4),
  sortOrder: z.coerce.number().int().min(0).optional(),
  stem: z.string().min(1),
  stemEn: z.string().optional().nullable(),
  optionA: z.string().min(1),
  optionAEn: z.string().optional().nullable(),
  optionB: z.string().min(1),
  optionBEn: z.string().optional().nullable(),
  optionC: z.string().min(1),
  optionCEn: z.string().optional().nullable(),
  optionD: z.string().min(1),
  optionDEn: z.string().optional().nullable(),
  correctIndex: z.coerce.number().int().min(0).max(3),
  imageUrl: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  explanationEn: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  pdfUrl: z.string().optional().nullable(),
  isPublished: z.boolean().optional(),
  includeInExam: z.boolean().optional(),
});

export const questionUpdateSchema = questionCreateSchema.partial();

export const examTemplateCreateSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  attemptType: z.nativeEnum(AttemptType),
  questionCount: z.coerce.number().int().min(1),
  totalDurationSec: z.coerce.number().int().optional().nullable(),
  perQuestionSec: z.coerce.number().int().optional().nullable(),
  allowResume: z.boolean().optional(),
  subjectId: z.coerce.number().int().optional().nullable(),
  difficulty: z.coerce.number().int().min(1).max(4).optional().nullable(),
  isActive: z.boolean().optional(),
});

export const examTemplateUpdateSchema = examTemplateCreateSchema.partial();

export const contactStatusSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED']),
});

export const faqSettingsUpdateSchema = z.object({
  introAr: z.string().optional(),
  introEn: z.string().nullish(),
  titleHighlightAr: z.string().optional(),
  titleRestAr: z.string().optional(),
  titleHighlightEn: z.string().nullish(),
  titleRestEn: z.string().nullish(),
});

export const faqItemCreateSchema = z.object({
  scope: z.enum(['GENERAL', 'PAYMENT']).default('GENERAL'),
  questionAr: z.string().min(1),
  questionEn: z.string().nullish(),
  answerAr: z.string().min(1),
  answerEn: z.string().nullish(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const faqItemUpdateSchema = faqItemCreateSchema.partial();

export const siteContactInfoPatchSchema = z
  .object({
    introAr: z.string().max(20000).optional(),
    introEn: z.string().max(20000).optional(),
    phone: z.string().max(64).optional(),
    email: z.string().max(200).optional(),
    facebookUrl: z.string().max(2048).optional(),
    instagramUrl: z.string().max(2048).optional(),
    whatsappUrl: z.string().max(2048).optional(),
    youtubeUrl: z.string().max(2048).optional(),
  })
  .strict();

export const testimonialsSettingsUpdateSchema = z.object({
  titleAr: z.string().optional(),
  titleEn: z.string().nullish(),
  subtitleAr: z.string().optional(),
  subtitleEn: z.string().nullish(),
});

export const testimonialItemCreateSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().nullish(),
  roleAr: z.string().min(1),
  roleEn: z.string().nullish(),
  textAr: z.string().min(1),
  textEn: z.string().nullish(),
  imageUrl: z.string().max(2048).nullish(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const testimonialItemUpdateSchema = testimonialItemCreateSchema.partial();

const aboutImageUrl = z
  .string()
  .max(2048)
  .nullish()
  .refine(
    (s) => s == null || s === '' || s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://'),
    { message: 'Invalid image URL' },
  );

export const siteAboutUpdateSchema = z.object({
  badgeAr: z.string().max(500).optional(),
  badgeEn: z.string().max(500).nullish(),
  titleAr: z.string().max(20000).optional(),
  titleEn: z.string().max(20000).nullish(),
  bodyAr: z.string().max(20000).optional(),
  bodyEn: z.string().max(20000).nullish(),
  imageUrl: aboutImageUrl,
});

const optionalMediaUrl = z
  .string()
  .max(2048)
  .nullish()
  .refine(
    (s) => s == null || s === '' || s.startsWith('/') || s.startsWith('http://') || s.startsWith('https://'),
    { message: 'Invalid URL' },
  );

export const siteHomeVideoUpdateSchema = z.object({
  titleAr: z.string().max(20000).optional(),
  titleEn: z.string().max(20000).nullish(),
  bodyAr: z.string().max(20000).optional(),
  bodyEn: z.string().max(20000).nullish(),
  thumbUrl: optionalMediaUrl,
  videoUrl: optionalMediaUrl,
});

export const siteHeroUpdateSchema = z.object({
  titleAr: z.string().max(20000).optional(),
  titleEn: z.string().max(20000).nullish(),
  subtitleAr: z.string().max(20000).optional(),
  subtitleEn: z.string().max(20000).nullish(),
  howItWorksAr: z.string().max(255).optional(),
  howItWorksEn: z.string().max(255).nullish(),
  startNowAr: z.string().max(255).optional(),
  startNowEn: z.string().max(255).nullish(),
  laptopAltAr: z.string().max(512).nullish(),
  laptopAltEn: z.string().max(512).nullish(),
});

const statVal = z.string().max(64).optional();
const statLabel = z.string().max(255).optional();
const statLabelEn = z.string().max(255).nullish();

export const siteHomeStatsUpdateSchema = z.object({
  stat1Value: statVal,
  stat1LabelAr: statLabel,
  stat1LabelEn: statLabelEn,
  stat2Value: statVal,
  stat2LabelAr: statLabel,
  stat2LabelEn: statLabelEn,
  stat3Value: statVal,
  stat3LabelAr: statLabel,
  stat3LabelEn: statLabelEn,
  titleAr: z.string().max(20000).optional(),
  titleEn: z.string().max(20000).nullish(),
  bodyAr: z.string().max(20000).optional(),
  bodyEn: z.string().max(20000).nullish(),
  ctaAr: z.string().max(255).optional(),
  ctaEn: z.string().max(255).nullish(),
  imageUrl: optionalMediaUrl,
  imageAltAr: z.string().max(512).nullish(),
  imageAltEn: z.string().max(512).nullish(),
});

export const siteWhyUsUpdateSchema = z.object({
  titleAr: z.string().max(20000).optional(),
  titleEn: z.string().max(20000).nullish(),
  item1Ar: z.string().max(20000).optional(),
  item1En: z.string().max(20000).nullish(),
  item2Ar: z.string().max(20000).optional(),
  item2En: z.string().max(20000).nullish(),
  item3Ar: z.string().max(20000).optional(),
  item3En: z.string().max(20000).nullish(),
  item4Ar: z.string().max(20000).optional(),
  item4En: z.string().max(20000).nullish(),
});

const subscriptionPlanSlug = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug: lowercase letters, numbers, hyphens only' });

export const subscriptionPlanCreateSchema = z.object({
  slug: subscriptionPlanSlug,
  name: z.string().min(1).max(255),
  priceCents: z.coerce.number().int().min(0),
  currency: z.string().min(1).max(8).default('USD'),
  interval: z.enum(['month', 'year', 'week', 'day']),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const subscriptionPlanUpdateSchema = z.object({
  slug: subscriptionPlanSlug.optional(),
  name: z.string().min(1).max(255).optional(),
  priceCents: z.coerce.number().int().min(0).optional(),
  currency: z.string().min(1).max(8).optional(),
  interval: z.enum(['month', 'year', 'week', 'day']).optional(),
  sortOrder: z.coerce.number().int().optional(),
  isActive: z.boolean().optional(),
});
