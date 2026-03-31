import { prisma } from '../../lib/prisma.js';

const ID = 1;

const DEFAULT_ROW = {
  id: ID,
  badgeAr: '+20 سنة من الخبرة',
  badgeEn: '+20 years of experience',
  titleAr: 'الفهيم',
  titleEn: 'Al Faheem',
  bodyAr:
    'لوريم ايبسوم دولار سيت اميت هوزيلام جيكتوم سيت ايكويب ايروتي دو دو كونسيفيكتات دولار بوت كويرات توب اليكويب ايتم باسمود فيليتيات. كويرات تيكنيديونت ليتسيوت انتويديكتوم نويساراد دونك كويرات ايت اميت، واليميكو ايتروديكتوم جيوامي ميو ايبسوم الكروبيتيشين كومودو بورت نيسي كونسيكوات.',
  bodyEn:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  imageUrl: 'https://images.unsplash.com/photo-1571260899304-425eee4c7efc?q=80&w=2070&auto=format&fit=crop',
};

export async function ensureSiteAbout() {
  const existing = await prisma.siteAbout.findUnique({ where: { id: ID } });
  if (existing) return existing;
  try {
    return await prisma.siteAbout.create({ data: DEFAULT_ROW });
  } catch (e) {
    if (e.code === 'P2002') {
      return prisma.siteAbout.findUniqueOrThrow({ where: { id: ID } });
    }
    throw e;
  }
}

export async function getPublicAbout() {
  return ensureSiteAbout();
}

export async function updateSiteAbout(body) {
  await ensureSiteAbout();
  const next = {};
  if (body.badgeAr !== undefined) next.badgeAr = body.badgeAr;
  if (body.badgeEn !== undefined) next.badgeEn = body.badgeEn === '' ? null : body.badgeEn;
  if (body.titleAr !== undefined) next.titleAr = body.titleAr;
  if (body.titleEn !== undefined) next.titleEn = body.titleEn === '' ? null : body.titleEn;
  if (body.bodyAr !== undefined) next.bodyAr = body.bodyAr;
  if (body.bodyEn !== undefined) next.bodyEn = body.bodyEn === '' ? null : body.bodyEn;
  if (body.imageUrl !== undefined) next.imageUrl = body.imageUrl === '' ? null : body.imageUrl;
  if (Object.keys(next).length === 0) {
    return prisma.siteAbout.findUnique({ where: { id: ID } });
  }
  return prisma.siteAbout.update({ where: { id: ID }, data: next });
}
