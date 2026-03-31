import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

let accessToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
let refreshToken = typeof localStorage !== 'undefined' ? localStorage.getItem('refreshToken') : null;

export function setTokens(access, refresh) {
  accessToken = access;
  if (access) sessionStorage.setItem('accessToken', access);
  else sessionStorage.removeItem('accessToken');
  refreshToken = refresh;
  if (refresh) localStorage.setItem('refreshToken', refresh);
  else localStorage.removeItem('refreshToken');
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  sessionStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function getAccessToken() {
  const fromSession =
    typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('accessToken') : null;
  if (fromSession) {
    accessToken = fromSession;
    return fromSession;
  }
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken || localStorage.getItem('refreshToken');
}

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = null;

function redirectToLogin() {
  if (typeof window === 'undefined' || window.location.pathname === '/login') return;
  window.location.href = '/login';
}

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (!original) return Promise.reject(error);

    const status = error.response?.status;
    if (status !== 401) return Promise.reject(error);

    /** Refresh already ran for this request — session is no longer valid. */
    if (original._retry) {
      clearTokens();
      redirectToLogin();
      return Promise.reject(error);
    }

    const rt = getRefreshToken();
    /** Expired access token but no refresh (e.g. cleared storage) — clear stale access and re-login. */
    if (!rt) {
      clearTokens();
      redirectToLogin();
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshing) {
        refreshing = axios
          .post(`${baseURL}/auth/refresh`, { refreshToken: rt })
          .then((res) => {
            accessToken = res.data.accessToken;
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem('accessToken', accessToken);
            }
            if (res.data.refreshToken) {
              refreshToken = res.data.refreshToken;
              localStorage.setItem('refreshToken', refreshToken);
            }
            refreshing = null;
            return res.data.accessToken;
          })
          .catch((e) => {
            refreshing = null;
            throw e;
          });
      }
      await refreshing;
      const authHeader = `Bearer ${accessToken}`;
      if (original.headers && typeof original.headers.set === 'function') {
        original.headers.set('Authorization', authHeader);
      } else if (original.headers) {
        original.headers.Authorization = authHeader;
      }
      return api(original);
    } catch {
      clearTokens();
      redirectToLogin();
      return Promise.reject(error);
    }
  },
);

/**
 * Admin upload (multipart). Uses `api` so 401 runs the same refresh flow as other requests.
 * Drops default JSON Content-Type so the browser sets multipart boundary on FormData.
 */
export async function uploadAdminFile(file) {
  const fd = new FormData();
  fd.append('file', file);
  const { data } = await api.post('/admin/uploads', fd, {
    transformRequest: [
      (body, headers) => {
        if (headers && typeof headers.delete === 'function') {
          headers.delete('Content-Type');
        } else if (headers && typeof headers === 'object') {
          delete headers['Content-Type'];
        }
        return body;
      },
    ],
  });
  return data.url;
}

export const publicBase = baseURL.replace(/\/api\/v1\/?$/, '');
