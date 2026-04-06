import { Router } from 'express';
import * as ctrl from './subjects.controller.js';
import { optionalAuth } from '../../middleware/auth.js';

const r = Router();
r.get('/', optionalAuth, ctrl.list);
// If subcategory routes are present, also expose them as public (ignore tokens if present)
if (typeof ctrl.listSubcategories === 'function') {
  r.get('/:slug/subcategories', optionalAuth, ctrl.listSubcategories);
}
if (typeof ctrl.getSubcategory === 'function') {
  r.get('/:slug/subcategories/:subSlug', optionalAuth, ctrl.getSubcategory);
}
export default r;
