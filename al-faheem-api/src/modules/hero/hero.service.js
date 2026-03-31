import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

const ID = 1;

function assertDelegates() {
  if (!prisma.siteHero) {
    throw new HttpError(
      503,
      'Prisma Client لا يتضمن SiteHero. أوقف API ثم: npx prisma generate && npx prisma db push',
    );
  }
}

const DEFAULT_ROW = {
  id: ID,
  titleAr: 'تعلم في أي وقت و من أي مكان !',
  titleEn: 'Learn anytime, anywhere!',
  subtitleAr:
    'استمتع بالوصول إلى مئات الدورات التدريبية عالية الجودة التي يقدمها مدربون محترفون، صممت لمساعدتك على إتقان مهارات جديدة وتحقيق معرفتك، وتفتح المزيد من الفرص لتطوير وتحقيق أهدافك الشخصية.',
  subtitleEn:
    'Access hundreds of high-quality training courses led by professional instructors, designed to help you master new skills, grow your knowledge, and open more opportunities to reach your personal goals.',
  howItWorksAr: 'كيف تعمل ؟',
  howItWorksEn: 'How it works?',
  startNowAr: 'ابدأ الآن',
  startNowEn: 'Get started',
  laptopAltAr: 'الفهيم منصة التعلم',
  laptopAltEn: 'Al Faheem learning platform',
};

export async function ensureSiteHero() {
  assertDelegates();
  const existing = await prisma.siteHero.findUnique({ where: { id: ID } });
  if (existing) return existing;
  try {
    return await prisma.siteHero.create({ data: DEFAULT_ROW });
  } catch (e) {
    if (e.code === 'P2002') {
      return prisma.siteHero.findUniqueOrThrow({ where: { id: ID } });
    }
    throw e;
  }
}

export async function getPublicHero() {
  return ensureSiteHero();
}

export async function updateSiteHero(body) {
  await ensureSiteHero();
  const next = {};
  const str = (v) => (v === '' ? null : v);
  if (body.titleAr !== undefined) next.titleAr = body.titleAr;
  if (body.titleEn !== undefined) next.titleEn = str(body.titleEn);
  if (body.subtitleAr !== undefined) next.subtitleAr = body.subtitleAr;
  if (body.subtitleEn !== undefined) next.subtitleEn = str(body.subtitleEn);
  if (body.howItWorksAr !== undefined) next.howItWorksAr = body.howItWorksAr;
  if (body.howItWorksEn !== undefined) next.howItWorksEn = str(body.howItWorksEn);
  if (body.startNowAr !== undefined) next.startNowAr = body.startNowAr;
  if (body.startNowEn !== undefined) next.startNowEn = str(body.startNowEn);
  if (body.laptopAltAr !== undefined) next.laptopAltAr = str(body.laptopAltAr);
  if (body.laptopAltEn !== undefined) next.laptopAltEn = str(body.laptopAltEn);
  if (Object.keys(next).length === 0) {
    return prisma.siteHero.findUnique({ where: { id: ID } });
  }
  return prisma.siteHero.update({ where: { id: ID }, data: next });
}
