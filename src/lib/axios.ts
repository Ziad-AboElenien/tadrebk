import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { LS_ACCESS_TOKEN, LS_REFRESH_TOKEN } from './constants';

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

// ─── Response interceptor — auto-refresh on 401 ────────────────────────────
interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryConfig;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          typeof window !== 'undefined'
            ? localStorage.getItem(LS_REFRESH_TOKEN)
            : null;

        if (!refreshToken) {
          // No refresh token → clear state and reject
          clearAuthStorage();
          return Promise.reject(error);
        }

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const tokens = data?.data?.tokens;
        if (tokens) {
          localStorage.setItem(LS_ACCESS_TOKEN, tokens.accessToken);
          localStorage.setItem(LS_REFRESH_TOKEN, tokens.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        clearAuthStorage();
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login/student';
        }
      }
    }

    return Promise.reject(error);
  },
);

function clearAuthStorage() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LS_ACCESS_TOKEN);
    localStorage.removeItem(LS_REFRESH_TOKEN);
  }
}

// ─── Error message helper ───────────────────────────────────────────────────
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
