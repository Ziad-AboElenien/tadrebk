import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import {
  LS_ACCESS_TOKEN,
  LS_REFRESH_TOKEN,
  LS_USER_ROLE,
  LS_USER_ID,
  LS_COMPANY_ID,
  LS_TOKEN_TIMESTAMP,
  LS_PENDING_ONBOARDING,
  LS_PENDING_EMAIL,
  LS_INTENDED_ROLE,
} from './constants';

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
// Public auth endpoints — never attach the (possibly stale) token, otherwise
// the backend auth middleware can reject the request with "Invalid token".
const PUBLIC_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/signup',
  '/auth/refresh',
  '/auth/google',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/resend-otp',
  '/auth/confirm-email',
];

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Read from localStorage (works after page refresh too)
    if (typeof window !== 'undefined') {
      const url = config.url || '';
      const isPublicAuth = PUBLIC_AUTH_ENDPOINTS.some(
        (ep) => url === ep || url.startsWith(`${ep}?`) || url.startsWith(`${ep}/`),
      );
      if (!isPublicAuth) {
        const token = localStorage.getItem(LS_ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
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

/** Shared in-flight refresh — concurrent 401s must not each rotate the token. */
let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const refreshToken = localStorage.getItem(LS_REFRESH_TOKEN);
  if (!refreshToken) return false;
  try {
    const { data } = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken },
      { timeout: 15000 },
    );
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

/** Exchange the stored refresh token for fresh tokens (role may have been promoted). */
export function refreshAuthTokens(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (!refreshInFlight) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// Backend gates internship + billing ROUTES behind `role: "company_owner"`;
// a freshly-created company owner still holds a stale "student" JWT → 403.
// Match ONLY company-management endpoints — never the public read endpoints,
// otherwise students browsing the public listing get force-logged-out.
const COMPANY_GATED_PATTERNS = [
  /\/company\/[^/]+\/internships(\/|$|\?)/,
  /\/company\/[^/]+\/billing(\/|$|\?)/,
];

// Endpoints that can legitimately return 401 for bad user input (e.g. wrong
// current password / invalid OTP) rather than session expiry. Never clear the
// session for these — surface the error to the form instead.
const NON_SESSION_401_PATTERNS = [
  /\/auth\/change-password(\/|$|\?)/,
  /\/auth\/confirm-change-email(\/|$|\?)/,
];

// Auth pages — never hard-redirect here or we'd reload into the same page (loop).
const AUTH_PAGE_PATTERN = /^\/(login|get-started|signup|forgot-password|confirm-email|reset-password)(\/|$)/;

function isOnAuthPage(): boolean {
  if (typeof window === 'undefined') return false;
  return AUTH_PAGE_PATTERN.test(window.location.pathname);
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      // Only treat it as a session-expiry if the request actually carried a token;
      // otherwise the request was anonymous (e.g. a public poll) — don't touch auth.
      const hadAuth =
        typeof originalRequest?.headers?.Authorization === 'string' &&
        String(originalRequest.headers.Authorization).startsWith('Bearer');

      // Auth flows that 401 on bad input must NOT wipe the session.
      const isNonSession401 = NON_SESSION_401_PATTERNS.some((re) =>
        re.test(originalRequest?.url || ''),
      );
      const isSessionExpiry = hadAuth && !isNonSession401;

      if (isSessionExpiry) {
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
        if (!isOnAuthPage()) {
          window.location.href = '/login/student';
        }
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
      if (!isOnAuthPage()) {
        window.location.href = '/login/company';
      }
    }

    return Promise.reject(error);
  },
);

function clearAuthStorage() {
  if (typeof window !== 'undefined') {
    // Wipe ALL account-scoped keys — a stale LS_COMPANY_ID / LS_USER_ID here
    // leaks the previous user's company into the next login (cross-account bleed).
    localStorage.removeItem(LS_ACCESS_TOKEN);
    localStorage.removeItem(LS_REFRESH_TOKEN);
    localStorage.removeItem(LS_USER_ROLE);
    localStorage.removeItem(LS_USER_ID);
    localStorage.removeItem(LS_COMPANY_ID);
    localStorage.removeItem(LS_TOKEN_TIMESTAMP);
    localStorage.removeItem(LS_PENDING_ONBOARDING);
    localStorage.removeItem(LS_PENDING_EMAIL);
    localStorage.removeItem(LS_INTENDED_ROLE);
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
    const data = error.response?.data as
      | { message?: unknown; errMsg?: unknown; msg?: unknown }
      | undefined;
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
