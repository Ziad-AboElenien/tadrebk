import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthTokens, UserRole } from '@/features/auth/types';
import {
  LS_ACCESS_TOKEN,
  LS_REFRESH_TOKEN,
  LS_USER_ROLE,
  LS_USER_ID,
  LS_COMPANY_ID,
  LS_TOKEN_TIMESTAMP,
  TOKEN_TTL_MS,
} from '@/lib/constants';

// ─── Role logic ────────────────────────────────────────────────────────────
// The API has NO role field. Role is determined on the frontend:
//   - 'company' = user has a companyId stored (created a company)
//   - 'student'  = user has no companyId
// We persist this so the UI knows which dashboard to show.
// ──────────────────────────────────────────────────────────────────────────

function deriveRole(): UserRole {
  if (typeof window === 'undefined') return 'student';
  const stored = localStorage.getItem(LS_USER_ROLE) as UserRole | null;
  if (stored) return stored;
  return localStorage.getItem(LS_COMPANY_ID) ? 'company' : 'student';
}

function clearAuthStorage() {
  localStorage.removeItem(LS_ACCESS_TOKEN);
  localStorage.removeItem(LS_REFRESH_TOKEN);
  localStorage.removeItem(LS_USER_ROLE);
  localStorage.removeItem(LS_USER_ID);
  localStorage.removeItem(LS_COMPANY_ID);
  localStorage.removeItem(LS_TOKEN_TIMESTAMP);
  document.cookie = 'tadrebk_access_token=; Max-Age=0; path=/';
  document.cookie = 'tadrebk_user_role=; Max-Age=0; path=/';
}

function isTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem(LS_TOKEN_TIMESTAMP);
  if (!saved) return true;
  return Date.now() - Number(saved) > TOKEN_TTL_MS;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: UserRole;
  userId: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

function loadFromStorage(): Partial<AuthState> {
  if (typeof window === 'undefined') return {};
  if (isTokenExpired()) {
    clearAuthStorage();
    return {};
  }
  return {
    accessToken: localStorage.getItem(LS_ACCESS_TOKEN),
    refreshToken: localStorage.getItem(LS_REFRESH_TOKEN),
    role: deriveRole(),
    userId: localStorage.getItem(LS_USER_ID),
    isAuthenticated: !!localStorage.getItem(LS_ACCESS_TOKEN),
  };
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  role: 'student',
  userId: null,
  status: 'idle',
  error: null,
  ...loadFromStorage(),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setTokens(
      state,
      action: PayloadAction<{
        tokens: AuthTokens;
        userId: string;
        role?: UserRole;
      }>,
    ) {
      const { tokens, userId, role = 'student' } = action.payload;
      state.accessToken = tokens.accessToken;
      state.refreshToken = tokens.refreshToken;
      state.isAuthenticated = true;
      state.role = role;
      state.userId = userId;
      state.status = 'succeeded';

      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_ACCESS_TOKEN, tokens.accessToken);
        localStorage.setItem(LS_REFRESH_TOKEN, tokens.refreshToken);
        localStorage.setItem(LS_USER_ROLE, role);
        localStorage.setItem(LS_USER_ID, userId);
        localStorage.setItem(LS_TOKEN_TIMESTAMP, String(Date.now()));
        document.cookie = `tadrebk_access_token=${tokens.accessToken}; path=/; max-age=${TOKEN_TTL_MS / 1000}`;
        document.cookie = `tadrebk_user_role=${role}; path=/; max-age=${TOKEN_TTL_MS / 1000}`;
      }
    },
    setRole(state, action: PayloadAction<UserRole>) {
      state.role = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_USER_ROLE, action.payload);
        document.cookie = `tadrebk_user_role=${action.payload}; path=/; max-age=${TOKEN_TTL_MS / 1000}`;
      }
    },
    logout(state) {
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.role = 'student';
      state.userId = null;
      state.status = 'idle';
      state.error = null;
      if (typeof window !== 'undefined') clearAuthStorage();
    },
    clearError(state) {
      state.error = null;
    },
    setStatus(state, action: PayloadAction<AuthState['status']>) {
      state.status = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.status = 'failed';
    },
  },
});

export const { setTokens, setRole, logout, clearError, setStatus, setError } =
  authSlice.actions;
export default authSlice.reducer;
