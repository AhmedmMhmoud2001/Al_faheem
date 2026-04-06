import { getAccessToken } from './client.js';

/**
 * Decode the current JWT payload without verification.
 * Returns null if no token or parsing fails.
 */
export function getTokenPayload() {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    return JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

/** Returns 'ADMIN' | 'STAFF' | 'USER' | null */
export function getCurrentRole() {
  return getTokenPayload()?.role ?? null;
}

/** Returns array of permission strings for STAFF users */
export function getCurrentPermissions() {
  return getTokenPayload()?.permissions ?? [];
}

/** True if the current user has at least one of the given permissions (or is ADMIN) */
export function hasPermission(...perms) {
  const role = getCurrentRole();
  if (role === 'ADMIN') return true;
  const userPerms = getCurrentPermissions();
  return perms.some((p) => userPerms.includes(p));
}
