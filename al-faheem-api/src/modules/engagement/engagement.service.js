import { prisma } from '../../lib/prisma.js';
import { ensureSiteContactInfoRow } from '../../lib/siteContactInfo.js';

export async function createFeedback(data, userId) {
  return prisma.feedback.create({
    data: {
      rating: data.rating,
      name: data.name,
      email: data.email,
      comment: data.comment,
      userId: userId || null,
    },
  });
}

export async function createContact(data) {
  return prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      message: data.message,
    },
  });
}

export async function getSiteContactInfo() {
  return ensureSiteContactInfoRow();
}
