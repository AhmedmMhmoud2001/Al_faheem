import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

const SETTINGS_ID = 1;

/** After schema changes, run `npx prisma generate` (stop the API first on Windows if EPERM on query_engine). */
function assertTestimonialsDelegates() {
  if (!prisma.testimonialsSettings || !prisma.testimonial) {
    throw new HttpError(
      503,
      'Prisma Client لا يتضمن جداول آراء العملاء. أوقف خادم API ثم من مجلد al-faheem-api نفّذ: npx prisma generate ثم npx prisma db push ثم أعد التشغيل.',
    );
  }
}

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  titleAr: 'يقول طلابنا..',
  titleEn: 'What our students say',
  subtitleAr:
    'استمتع بمباشرة عن طلابنا الذين نجحوا مع التزامهم ومشاركتهم القوية من خلال منصة الدورات التدريبية عبر الإنترنت.',
  subtitleEn:
    'Hear from students who succeeded with commitment and strong engagement through our online training platform.',
};

export async function ensureTestimonialsSettings() {
  assertTestimonialsDelegates();
  const existing = await prisma.testimonialsSettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  try {
    return await prisma.testimonialsSettings.create({ data: DEFAULT_SETTINGS });
  } catch (e) {
    if (e.code === 'P2002') {
      return prisma.testimonialsSettings.findUniqueOrThrow({ where: { id: SETTINGS_ID } });
    }
    throw e;
  }
}

export async function getPublicTestimonials() {
  const settings = await ensureTestimonialsSettings();
  const items = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      nameAr: true,
      nameEn: true,
      roleAr: true,
      roleEn: true,
      textAr: true,
      textEn: true,
      imageUrl: true,
      sortOrder: true,
    },
  });
  return { settings, items };
}

export async function getAdminTestimonials() {
  const settings = await ensureTestimonialsSettings();
  const items = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });
  return { settings, items };
}

export async function updateTestimonialsSettings(data) {
  await ensureTestimonialsSettings();
  const next = {};
  if (data.titleAr !== undefined) next.titleAr = data.titleAr;
  if (data.titleEn !== undefined) next.titleEn = data.titleEn === '' ? null : data.titleEn;
  if (data.subtitleAr !== undefined) next.subtitleAr = data.subtitleAr;
  if (data.subtitleEn !== undefined) next.subtitleEn = data.subtitleEn === '' ? null : data.subtitleEn;
  if (Object.keys(next).length === 0) {
    return prisma.testimonialsSettings.findUnique({ where: { id: SETTINGS_ID } });
  }
  return prisma.testimonialsSettings.update({ where: { id: SETTINGS_ID }, data: next });
}

export async function createTestimonialItem(data) {
  assertTestimonialsDelegates();
  return prisma.testimonial.create({
    data: {
      nameAr: data.nameAr,
      nameEn: data.nameEn === '' || data.nameEn == null ? null : data.nameEn,
      roleAr: data.roleAr,
      roleEn: data.roleEn === '' || data.roleEn == null ? null : data.roleEn,
      textAr: data.textAr,
      textEn: data.textEn === '' || data.textEn == null ? null : data.textEn,
      imageUrl: data.imageUrl === '' || data.imageUrl == null ? null : data.imageUrl,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
  });
}

export async function updateTestimonialItem(id, data) {
  assertTestimonialsDelegates();
  const next = {};
  if (data.nameAr !== undefined) next.nameAr = data.nameAr;
  if (data.nameEn !== undefined) next.nameEn = data.nameEn === '' ? null : data.nameEn;
  if (data.roleAr !== undefined) next.roleAr = data.roleAr;
  if (data.roleEn !== undefined) next.roleEn = data.roleEn === '' ? null : data.roleEn;
  if (data.textAr !== undefined) next.textAr = data.textAr;
  if (data.textEn !== undefined) next.textEn = data.textEn === '' ? null : data.textEn;
  if (data.imageUrl !== undefined) next.imageUrl = data.imageUrl === '' ? null : data.imageUrl;
  if (data.sortOrder !== undefined) next.sortOrder = data.sortOrder;
  if (data.isActive !== undefined) next.isActive = data.isActive;
  if (Object.keys(next).length === 0) {
    const row = await prisma.testimonial.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, 'Testimonial not found');
    return row;
  }
  try {
    return await prisma.testimonial.update({ where: { id }, data: next });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'Testimonial not found');
    throw e;
  }
}

export async function deleteTestimonialItem(id) {
  assertTestimonialsDelegates();
  try {
    await prisma.testimonial.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'Testimonial not found');
    throw e;
  }
  return { ok: true };
}
