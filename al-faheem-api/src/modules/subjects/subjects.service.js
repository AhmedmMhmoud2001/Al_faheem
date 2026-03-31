import { prisma } from '../../lib/prisma.js';

export async function listActive() {
  return prisma.subject.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      nameAr: true,
      nameEn: true,
      description: true,
      descriptionEn: true,
      imageUrl: true,
      sortOrder: true,
    },
  });
}
