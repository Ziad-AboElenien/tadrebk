import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { LS_ACCESS_TOKEN, LS_REFRESH_TOKEN, LS_TOKEN_TIMESTAMP, LS_PENDING_ONBOARDING } from './constants';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor — attach access token ─────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read from localStorage (works after page refresh too)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(LS_ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response interceptor — auto-refresh on 401 / role-promotion 403 ────────
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _retry403?: boolean;
}

/** Exchange the stored refresh token for fresh tokens (role may have been promoted). */
export async function refreshAuthTokens(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const refreshToken = localStorage.getItem(LS_REFRESH_TOKEN);
  if (!refreshToken) return false;
  try {
    const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken,
    });
    const tokens = data?.data?.tokens;
    if (tokens) {
      localStorage.setItem(LS_ACCESS_TOKEN, tokens.accessToken);
      localStorage.setItem(LS_REFRESH_TOKEN, tokens.refreshToken);
      localStorage.setItem(LS_TOKEN_TIMESTAMP, String(Date.now()));
      return true;
    }
  } catch {
    // fall through
  }
  return false;
}

// Backend now gates internship + billing routes behind `role: "company_owner"`;
// a freshly-created company owner still holds a stale "student" JWT → 403.
const COMPANY_GATED_PATTERNS = [/\/internships/, /\/billing/];

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      const refreshed = await refreshAuthTokens();
      if (refreshed) {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem(LS_ACCESS_TOKEN)
            : null;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }

      clearAuthStorage();
      if (typeof window !== 'undefined') {
        window.location.href = '/login/student';
      }
    }

    if (
      error.response?.status === 403 &&
      !originalRequest?._retry403 &&
      COMPANY_GATED_PATTERNS.some((re) => re.test(originalRequest?.url || ''))
    ) {
      originalRequest._retry403 = true;

      const refreshed = await refreshAuthTokens();
      if (refreshed) {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem(LS_ACCESS_TOKEN)
            : null;
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }

      clearAuthStorage();
      if (typeof window !== 'undefined') {
        window.location.href = '/login/company';
      }
    }

    return Promise.reject(error);
  },
);

function clearAuthStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LS_ACCESS_TOKEN);
    localStorage.removeItem(LS_REFRESH_TOKEN);
    localStorage.removeItem(LS_TOKEN_TIMESTAMP);
    localStorage.removeItem(LS_PENDING_ONBOARDING);
    document.cookie = 'tadrebk_access_token=; Max-Age=0; path=/';
    document.cookie = 'tadrebk_user_role=; Max-Age=0; path=/';
  }
}

// ─── Error message helper ───────────────────────────────────────────────────
export function getErrorStatus(error: unknown): number | null {
  if (axios.isAxiosError(error)) return error.response?.status ?? null;
  return null;
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    const msg = data?.message || data?.errMsg || data?.msg;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong. Please try again.';
}

export function getErrorUrl(error: unknown): string | null {
  if (axios.isAxiosError(error) && error.config?.url) {
    return `${error.config.baseURL || ''}${error.config.url}`;
  }
  return null;
}

export default api;
