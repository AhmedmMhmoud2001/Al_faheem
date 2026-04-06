import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

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

export async function listActiveSubcategories(subjectSlug) {
  const subject = await prisma.subject.findFirst({
    where: { slug: subjectSlug, isActive: true },
    select: { id: true },
  });
  if (!subject) throw new HttpError(404, 'Subject not found');

  return prisma.subCategory.findMany({
    where: { subjectId: subject.id, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      slug: true,
      nameAr: true,
      nameEn: true,
      description: true,
      descriptionEn: true,
      imageUrl: true,
      sortOrder: true,
      _count: { select: { questions: true } },
    },
  });
}

export async function getActiveSubcategory(subjectSlug, subSlug) {
  const subject = await prisma.subject.findFirst({
    where: { slug: subjectSlug, isActive: true },
    select: { id: true },
  });
  if (!subject) throw new HttpError(404, 'Subject not found');

  const sub = await prisma.subCategory.findFirst({
    where: { subjectId: subject.id, slug: subSlug, isActive: true },
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
  if (!sub) throw new HttpError(404, 'Subcategory not found');
  return sub;
}
