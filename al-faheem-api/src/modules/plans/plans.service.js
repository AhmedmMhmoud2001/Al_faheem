import { prisma } from '../../lib/prisma.js';

export async function listPlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      slug: true,
      name: true,
      priceCents: true,
      currency: true,
      interval: true,
    },
  });
}
