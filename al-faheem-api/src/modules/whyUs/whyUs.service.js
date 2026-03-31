import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

const ID = 1;

function assertDelegates() {
  if (!prisma.siteWhyUs) {
    throw new HttpError(
      503,
      'Prisma Client لا يتضمن SiteWhyUs. أوقف API ثم: npx prisma generate && npx prisma db push',
    );
  }
}

const DEFAULT_ROW = {
  id: ID,
  titleAr: 'ما الذي يميزنا؟',
  titleEn: 'What makes us different?',
  item1Ar: 'اختبارات تجريبية غير محدودة',
  item1En: 'Unlimited practice tests',
  item2Ar: 'تجربة مجانية لمدة 7 أيام',
  item2En: '7-day free trial',
  item3Ar: 'تقارير تفصيلية للأداء',
  item3En: 'Detailed performance reports',
  item4Ar: 'الوصول الكامل لجميع الأسئلة',
  item4En: 'Full access to all questions',
};

export async function ensureSiteWhyUs() {
  assertDelegates();
  const existing = await prisma.siteWhyUs.findUnique({ where: { id: ID } });
  if (existing) return existing;
  try {
    return await prisma.siteWhyUs.create({ data: DEFAULT_ROW });
  } catch (e) {
    if (e.code === 'P2002') {
      return prisma.siteWhyUs.findUniqueOrThrow({ where: { id: ID } });
    }
    throw e;
  }
}

export async function getPublicWhyUs() {
  return ensureSiteWhyUs();
}

const str = (v) => (v === '' ? null : v);

export async function updateSiteWhyUs(body) {
  await ensureSiteWhyUs();
  const next = {};
  if (body.titleAr !== undefined) next.titleAr = body.titleAr;
  if (body.titleEn !== undefined) next.titleEn = str(body.titleEn);
  if (body.item1Ar !== undefined) next.item1Ar = body.item1Ar;
  if (body.item1En !== undefined) next.item1En = str(body.item1En);
  if (body.item2Ar !== undefined) next.item2Ar = body.item2Ar;
  if (body.item2En !== undefined) next.item2En = str(body.item2En);
  if (body.item3Ar !== undefined) next.item3Ar = body.item3Ar;
  if (body.item3En !== undefined) next.item3En = str(body.item3En);
  if (body.item4Ar !== undefined) next.item4Ar = body.item4Ar;
  if (body.item4En !== undefined) next.item4En = str(body.item4En);
  if (Object.keys(next).length === 0) {
    return prisma.siteWhyUs.findUnique({ where: { id: ID } });
  }
  return prisma.siteWhyUs.update({ where: { id: ID }, data: next });
}
