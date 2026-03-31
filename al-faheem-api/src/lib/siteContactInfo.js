import { prisma } from './prisma.js';

export const SITE_CONTACT_INFO_ID = 1;

/**
 * Ensures singleton row id=1 exists (avoids null-handling drift between GET and PATCH).
 */
export async function ensureSiteContactInfoRow() {
  const existing = await prisma.siteContactInfo.findUnique({ where: { id: SITE_CONTACT_INFO_ID } });
  if (existing) return existing;
  try {
    return await prisma.siteContactInfo.create({
      data: { id: SITE_CONTACT_INFO_ID },
    });
  } catch (e) {
    if (e.code === 'P2002') {
      return prisma.siteContactInfo.findUnique({ where: { id: SITE_CONTACT_INFO_ID } });
    }
    throw e;
  }
}
