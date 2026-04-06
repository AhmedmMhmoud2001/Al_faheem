import { prisma } from '../../lib/prisma.js';
import { HttpError } from '../../middleware/errorHandler.js';

export const ALL_PERMISSIONS = [
  'questions:read',
  'questions:write',
  'questions:delete',
  'subjects:read',
  'subjects:write',
  'subjects:delete',
  'subcategories:read',
  'subcategories:write',
  'subcategories:delete',
];

function normalizePerms(permissions) {
  if (!Array.isArray(permissions)) return [];
  return permissions.filter((p) => ALL_PERMISSIONS.includes(p));
}

export async function listStaffRoles() {
  const rows = await prisma.staffRole.findMany({
    orderBy: { id: 'asc' },
    include: {
      permissions: { select: { permission: true } },
      _count: { select: { users: true } },
    },
  });
  return rows.map(({ _count, permissions, ...r }) => ({
    ...r,
    permissions: permissions.map((p) => p.permission),
    userCount: _count.users,
  }));
}

export async function getStaffRole(id) {
  const row = await prisma.staffRole.findUnique({
    where: { id },
    include: { permissions: { select: { permission: true } } },
  });
  if (!row) throw new HttpError(404, 'Staff role not found');
  return { ...row, permissions: row.permissions.map((p) => p.permission) };
}

export async function createStaffRole({ name, description, permissions = [] }) {
  const existing = await prisma.staffRole.findUnique({ where: { name: name.trim() } });
  if (existing) throw new HttpError(409, 'اسم الدور مستخدم مسبقاً');

  const perms = normalizePerms(permissions);
  const row = await prisma.staffRole.create({
    data: {
      name: name.trim(),
      description: description || null,
      permissions: { create: perms.map((p) => ({ permission: p })) },
    },
    include: { permissions: { select: { permission: true } } },
  });
  return { ...row, permissions: row.permissions.map((p) => p.permission) };
}

export async function updateStaffRole(id, { name, description, isActive, permissions }) {
  const row = await prisma.staffRole.findUnique({ where: { id } });
  if (!row) throw new HttpError(404, 'Staff role not found');

  if (name !== undefined && name.trim() !== row.name) {
    const clash = await prisma.staffRole.findUnique({ where: { name: name.trim() } });
    if (clash) throw new HttpError(409, 'اسم الدور مستخدم مسبقاً');
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (permissions !== undefined) {
      const perms = normalizePerms(permissions);
      await tx.staffRolePermission.deleteMany({ where: { staffRoleId: id } });
      if (perms.length > 0) {
        await tx.staffRolePermission.createMany({
          data: perms.map((p) => ({ staffRoleId: id, permission: p })),
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    return tx.staffRole.update({
      where: { id },
      data: updateData,
      include: { permissions: { select: { permission: true } } },
    });
  });

  return { ...updated, permissions: updated.permissions.map((p) => p.permission) };
}

export async function deleteStaffRole(id) {
  const usersCount = await prisma.user.count({ where: { staffRoleId: id } });
  if (usersCount > 0) {
    throw new HttpError(409, 'لا يمكن حذف الدور لأنه مرتبط بموظفين. أعد تعيينهم أولاً');
  }
  try {
    await prisma.staffRole.delete({ where: { id } });
  } catch (e) {
    if (e.code === 'P2025') throw new HttpError(404, 'Staff role not found');
    throw e;
  }
  return { ok: true };
}

export async function getPermissionsForRole(staffRoleId) {
  if (!staffRoleId) return [];
  const rows = await prisma.staffRolePermission.findMany({
    where: { staffRoleId },
    select: { permission: true },
  });
  return rows.map((r) => r.permission);
}
