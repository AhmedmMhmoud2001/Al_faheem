import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/roles.js';
import { validateBody } from '../../middleware/validate.js';
import * as ctrl from './staff-roles.controller.js';
import { createStaffRoleSchema, updateStaffRoleSchema } from './staff-roles.validation.js';

const r = Router();
r.use(requireAuth, requireRole('ADMIN'));

r.get('/permissions', ctrl.getPermissionsList);
r.get('/', ctrl.listRoles);
r.get('/:id', ctrl.getRole);
r.post('/', validateBody(createStaffRoleSchema), ctrl.createRole);
r.patch('/:id', validateBody(updateStaffRoleSchema), ctrl.updateRole);
r.delete('/:id', ctrl.deleteRole);

export default r;
