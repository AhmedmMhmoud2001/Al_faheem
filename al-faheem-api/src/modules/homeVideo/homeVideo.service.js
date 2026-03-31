import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

const ID = 1;

/** After schema changes, run `npx prisma generate` (stop the API first on Windows if EPERM on query_engine). */
function assertSiteHomeVideoDelegates() {
  if (!prisma.siteHomeVideo) {
    throw new HttpError(
      503,
      'Prisma Client لا يتضمن جدول قسم الفيديو (SiteHomeVideo). أوقف خادم API ثم من مجلد al-faheem-api نفّذ: npx prisma generate ثم npx prisma db push ثم أعد التشغيل.',
    );
  }
}

const DEFAULT_ROW = {
  id: ID,
  titleAr: 'كيف تعمل منصتنا للطلاب؟',
  titleEn: 'How does our platform work for students?',
  bodyAr:
    'لوريم ايبسوم دولار سيت اميت هوزيلام جيكتوم سيت ايكويب ايروتي دو دو كونسيفيكتات دولار بوت كويرات توب اليكويب ايتم باسمود فيليتيات. كويرات تيكنيديونت ليتسيوت انتويديكتوم نويساراد دونك كويرات ايت اميت.',
  bodyEn:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  thumbUrl:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
  videoUrl: null,
};

export async function ensureSiteHomeVideo() {
  assertSiteHomeVideoDelegates();
  const existing = await prisma.siteHomeVideo.findUnique({ where: { id: ID } });
  if (existing) return existing;
  try {
    return await prisma.siteHomeVideo.create({ data: DEFAULT_ROW });
  } catch (e) {
    if (e.code === 'P2002') {
      return prisma.siteHomeVideo.findUniqueOrThrow({ where: { id: ID } });
    }
    throw e;
  }
}

export async function getPublicHomeVideo() {
  return ensureSiteHomeVideo();
}

export async function updateSiteHomeVideo(body) {
  await ensureSiteHomeVideo();
  const next = {};
  if (body.titleAr !== undefined) next.titleAr = body.titleAr;
  if (body.titleEn !== undefined) next.titleEn = body.titleEn === '' ? null : body.titleEn;
  if (body.bodyAr !== undefined) next.bodyAr = body.bodyAr;
  if (body.bodyEn !== undefined) next.bodyEn = body.bodyEn === '' ? null : body.bodyEn;
  if (body.thumbUrl !== undefined) next.thumbUrl = body.thumbUrl === '' ? null : body.thumbUrl;
  if (body.videoUrl !== undefined) next.videoUrl = body.videoUrl === '' ? null : body.videoUrl;
  if (Object.keys(next).length === 0) {
    return prisma.siteHomeVideo.findUnique({ where: { id: ID } });
  }
  return prisma.siteHomeVideo.update({ where: { id: ID }, data: next });
}
