import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

const ID = 1;

function assertDelegates() {
  if (!prisma.siteHomeStats) {
    throw new HttpError(
      503,
      'Prisma Client لا يتضمن SiteHomeStats. أوقف API ثم: npx prisma generate && npx prisma db push',
    );
  }
}

const DEFAULT_ROW = {
  id: ID,
  stat1Value: '+1000',
  stat1LabelAr: 'سؤال',
  stat1LabelEn: 'Questions',
  stat2Value: '100%',
  stat2LabelAr: 'محاكي للإمتحان الكمية',
  stat2LabelEn: 'Quant exam simulator',
  stat3Value: '4',
  stat3LabelAr: 'مواضيع',
  stat3LabelEn: 'Topics',
  titleAr: 'اختبر نفسك و حدد مستواك',
  titleEn: 'Test yourself and find your level',
  bodyAr:
    'لوريم ايبسوم دولار سيت اميت هوزيلام جيكتوم سيت ايكويب ايروتي دو دو كونسيفيكتات دولار بوت كويرات توب اليكويب ايتم باسمود فيليتيات. كويرات تيكنيديونت ليتسيوت انتويديكتوم نويساراد دونك كويرات ايت اميت.',
  bodyEn:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  ctaAr: 'ابدأ الاختبار الآن',
  ctaEn: 'Start the test now',
  imageUrl: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop',
  imageAltAr: 'تحديد المستوى',
  imageAltEn: 'Level assessment',
};

export async function ensureSiteHomeStats() {
  assertDelegates();
  const existing = await prisma.siteHomeStats.findUnique({ where: { id: ID } });
  if (existing) return existing;
  try {
    return await prisma.siteHomeStats.create({ data: DEFAULT_ROW });
  } catch (e) {
    if (e.code === 'P2002') {
      return prisma.siteHomeStats.findUniqueOrThrow({ where: { id: ID } });
    }
    throw e;
  }
}

export async function getPublicHomeStats() {
  return ensureSiteHomeStats();
}

const nullIfEmpty = (v) => (v === '' ? null : v);

export async function updateSiteHomeStats(body) {
  await ensureSiteHomeStats();
  const next = {};
  if (body.stat1Value !== undefined) next.stat1Value = body.stat1Value;
  if (body.stat1LabelAr !== undefined) next.stat1LabelAr = body.stat1LabelAr;
  if (body.stat1LabelEn !== undefined) next.stat1LabelEn = nullIfEmpty(body.stat1LabelEn);
  if (body.stat2Value !== undefined) next.stat2Value = body.stat2Value;
  if (body.stat2LabelAr !== undefined) next.stat2LabelAr = body.stat2LabelAr;
  if (body.stat2LabelEn !== undefined) next.stat2LabelEn = nullIfEmpty(body.stat2LabelEn);
  if (body.stat3Value !== undefined) next.stat3Value = body.stat3Value;
  if (body.stat3LabelAr !== undefined) next.stat3LabelAr = body.stat3LabelAr;
  if (body.stat3LabelEn !== undefined) next.stat3LabelEn = nullIfEmpty(body.stat3LabelEn);
  if (body.titleAr !== undefined) next.titleAr = body.titleAr;
  if (body.titleEn !== undefined) next.titleEn = nullIfEmpty(body.titleEn);
  if (body.bodyAr !== undefined) next.bodyAr = body.bodyAr;
  if (body.bodyEn !== undefined) next.bodyEn = nullIfEmpty(body.bodyEn);
  if (body.ctaAr !== undefined) next.ctaAr = body.ctaAr;
  if (body.ctaEn !== undefined) next.ctaEn = nullIfEmpty(body.ctaEn);
  if (body.imageUrl !== undefined) next.imageUrl = nullIfEmpty(body.imageUrl);
  if (body.imageAltAr !== undefined) next.imageAltAr = nullIfEmpty(body.imageAltAr);
  if (body.imageAltEn !== undefined) next.imageAltEn = nullIfEmpty(body.imageAltEn);
  if (Object.keys(next).length === 0) {
    return prisma.siteHomeStats.findUnique({ where: { id: ID } });
  }
  return prisma.siteHomeStats.update({ where: { id: ID }, data: next });
}
