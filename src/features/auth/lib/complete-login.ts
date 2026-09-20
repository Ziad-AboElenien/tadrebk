'use client';

import { LS_COMPANY_ID, LS_PENDING_ONBOARDING, LS_PENDING_EMAIL } from '@/lib/constants';
import type { AppDispatch } from '@/store/store';
import type { AuthTokens } from '@/features/auth/types';
import { setTokens, setRole } from '@/store/authSlice';
import { setUser } from '@/store/userSlice';
import { setCompany } from '@/store/companySlice';
import { companyService } from '@/features/company/services/company.service';
import { userService } from '@/features/student/services/user.service';

export interface CompleteLoginInput {
  tokens: AuthTokens;
  /** 'student' | 'company' form the user signed in from (drives first-time routing). */
  formRole: 'student' | 'company' | 'admin';
  /** Safe `next` param passthrough (same rules as LoginForm). */
  next?: string | null;
}

export interface CompleteLoginResult {
  redirect: string;
  needsConfirmation: boolean;
}

function parseJwt(token: string): { id?: string; role?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Shared post-auth sequence: persist tokens, load profile, derive the
 * student/company role and decide where to send the user next.
 * Used by LoginForm and by the confirm-email auto-login.
 */
export async function completeLogin(
  dispatch: AppDispatch,
  { tokens, formRole, next }: CompleteLoginInput,
): Promise<CompleteLoginResult> {
  const decoded = parseJwt(tokens.accessToken);
  const userId: string | undefined = decoded?.id;
  if (!userId) {
    throw new Error('Could not read session from server response. Please try again.');
  }

  // Persist the fresh tokens immediately so any authenticated call after
  // this uses them instead of a stale token left in localStorage.
  dispatch(setTokens({ tokens, userId, role: 'student' }));

  const user = await userService.getUserProfile(userId);

  // Check if JWT says admin, OR user profile has admin role
  if (decoded?.role === 'admin' || (user as { role?: string }).role === 'admin') {
    dispatch(setRole('admin'));
    dispatch(setUser(user));
    return { redirect: '/admin/dashboard', needsConfirmation: false };
  }

  const { companies } = await companyService.listCompanies({ limit: 50 });

  let userRole: 'student' | 'company' = 'student';
  const owned = companies.find((c) => {
    const createdBy =
      typeof c.createdBy === 'object' && c.createdBy !== null
        ? (c.createdBy as { _id: string })._id
        : (c.createdBy as string);
    return createdBy === userId;
  });
  if (owned) {
    userRole = 'company';
    const full = await companyService.getCompanyById(owned._id);
    dispatch(setCompany(full));
  } else {
    // Fallback: check if companyId saved in localStorage actually exists
    const savedCompanyId = localStorage.getItem(LS_COMPANY_ID);
    if (savedCompanyId) {
      try {
        const savedCompany = await companyService.getCompanyById(savedCompanyId);
        if (savedCompany) {
          userRole = 'company';
          dispatch(setCompany(savedCompany));
        }
      } catch {
        /* saved company no longer exists */
      }
    }
  }

  dispatch(setRole(userRole));
  dispatch(setUser(user));

  if (user.isConfirmed === false) {
    localStorage.setItem(LS_PENDING_EMAIL, user.email);
    return { redirect: '/confirm-email?resend=true', needsConfirmation: true };
  }

  // Only allow same-origin relative paths — reject "//evil.com" and "\evil.com"
  if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) {
    // Company-intent user without a company must complete onboarding first
    if (userRole !== 'company' && next.startsWith('/company/')) {
      localStorage.setItem(LS_PENDING_ONBOARDING, 'true');
    }
    return { redirect: next, needsConfirmation: false };
  }

  if (userRole === 'company') {
    return { redirect: '/company/admin', needsConfirmation: false };
  }
  if (formRole === 'company') {
    localStorage.setItem(LS_PENDING_ONBOARDING, 'true');
    return { redirect: '/company/onboarding', needsConfirmation: false };
  }
  if (!user.categories || user.categories.length === 0) {
    return { redirect: '/onboarding', needsConfirmation: false };
  }
  return { redirect: '/dashboard', needsConfirmation: false };
}
