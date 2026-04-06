export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}

/**
 * Middleware that passes when:
 *  - The user is ADMIN (full access), OR
 *  - The user has at least one of the listed permissions in their JWT
 *
 * @param {...string} permissions  e.g. 'questions:write', 'subjects:read'
 */
export function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (req.user.role === 'ADMIN') return next(); // admin bypasses all permission checks
    const userPerms = Array.isArray(req.user.permissions) ? req.user.permissions : [];
    const hasAny = permissions.some((p) => userPerms.includes(p));
    if (!hasAny) return res.status(403).json({ message: 'Forbidden' });
    next();
  };
}