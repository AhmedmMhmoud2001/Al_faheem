import { z } from 'zod';
import { ALL_PERMISSIONS } from './staff-roles.service.js';

export const createStaffRoleSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).default([]),
});

export const updateStaffRoleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).optional(),
});
