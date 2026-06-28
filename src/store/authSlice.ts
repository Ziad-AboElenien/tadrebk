import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthTokens, UserRole } from '@/types/auth';
import {
  LS_ACCESS_TOKEN,
  LS_REFRESH_TOKEN,
  LS_USER_ROLE,
  LS_USER_ID,
  LS_COMPANY_ID,
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
  // Fallback: if company id exists, they're a company user
  return localStorage.getItem(LS_COMPANY_ID) ? 'company' : 'student';
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
        role?: UserRole; // optional — defaults to 'student', set to 'company' after company onboarding
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
        // Sync to cookie for middleware
        document.cookie = `tadrebk_access_token=${tokens.accessToken}; path=/; max-age=86400`;
        document.cookie = `tadrebk_user_role=${role}; path=/; max-age=86400`;
      }
    },
    setRole(state, action: PayloadAction<UserRole>) {
      state.role = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_USER_ROLE, action.payload);
        document.cookie = `tadrebk_user_role=${action.payload}; path=/; max-age=86400`;
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

      if (typeof window !== 'undefined') {
        localStorage.removeItem(LS_ACCESS_TOKEN);
        localStorage.removeItem(LS_REFRESH_TOKEN);
        localStorage.removeItem(LS_USER_ROLE);
        localStorage.removeItem(LS_USER_ID);
        localStorage.removeItem(LS_COMPANY_ID);
        document.cookie = 'tadrebk_access_token=; Max-Age=0; path=/';
        document.cookie = 'tadrebk_user_role=; Max-Age=0; path=/';
      }
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
