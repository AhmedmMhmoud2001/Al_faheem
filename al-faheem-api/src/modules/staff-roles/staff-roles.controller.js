import * as svc from './staff-roles.service.js';
import { ALL_PERMISSIONS } from './staff-roles.service.js';

export async function listRoles(req, res, next) {
  try {
    const data = await svc.listStaffRoles();
    res.json({ data });
  } catch (e) { next(e); }
}

export async function getRole(req, res, next) {
  try {
    const row = await svc.getStaffRole(Number(req.params.id));
    res.json(row);
  } catch (e) { next(e); }
}

export async function createRole(req, res, next) {
  try {
    const row = await svc.createStaffRole(req.validated.body);
    res.status(201).json(row);
  } catch (e) { next(e); }
}

export async function updateRole(req, res, next) {
  try {
    const row = await svc.updateStaffRole(Number(req.params.id), req.validated.body);
    res.json(row);
  } catch (e) { next(e); }
}

export async function deleteRole(req, res, next) {
  try {
    const out = await svc.deleteStaffRole(Number(req.params.id));
    res.json(out);
  } catch (e) { next(e); }
}

export async function getPermissionsList(_req, res) {
  res.json({ data: ALL_PERMISSIONS });
}
