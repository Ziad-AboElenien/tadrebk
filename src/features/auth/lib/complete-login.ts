'use client';

import { LS_COMPANY_ID, LS_COMPANY_PROFILE_COMPLETED, LS_PENDING_ONBOARDING, LS_PENDING_EMAIL } from '@/lib/constants';
import type { AppDispatch } from '@/store/store';
import type { AuthTokens } from '@/features/auth/types';
import { toastHelper } from '@/lib/toast';
import { setTokens, setRole } from '@/store/authSlice';
import { setUser } from '@/store/userSlice';
import { setCompany } from '@/store/companySlice';
import { companyService } from '@/features/company/services/company.service';
import type { Company } from '@/features/company/types';
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

/** Per-account flag: this browser completed the company profile at least once. */
export function markCompanyProfileCompleted(userId: string) {
  try {
    localStorage.setItem(`${LS_COMPANY_PROFILE_COMPLETED}_${userId}`, 'true');
  } catch {
    /* ignore */
  }
}

export function isCompanyProfileCompleted(userId: string): boolean {
  try {
    return localStorage.getItem(`${LS_COMPANY_PROFILE_COMPLETED}_${userId}`) === 'true';
  } catch {
    return false;
  }
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

  // The backend is the source of truth for the account kind — a fresh company
  // account has no company object and no categories yet, so deriving the role
  // from those alone misclassifies it as a student (and breaks both flows).
  const backendRole = (user as { role?: string }).role || '';
  const isCompanyByRole = /company/i.test(backendRole);
  // Staff (instructors & custom roles) go straight to the dashboard: they
  // never create a company profile and must never see onboarding.
  const isStaff = /instructor/i.test(backendRole);

  // Remember a previously-saved company id: the owned search below is a
  // best-effort match and must not be the only path to the company object.
  const savedCompanyId = localStorage.getItem(LS_COMPANY_ID);

  const { companies } = await companyService.listCompanies({ limit: 50 });

  let userRole: 'student' | 'company' = isCompanyByRole ? 'company' : 'student';
  let companyLoaded = false;
  let loadedApproved: boolean | null = null;
  // Staff membership carries its own company — resolve it directly instead
  // of the owned-company search (staff own nothing).
  const membershipCompanyId =
    (user as { staffMembership?: { companyId?: string; status?: string }[] }).staffMembership?.find(
      (m) => !m.status || m.status === 'active',
    )?.companyId || null;
  if (isStaff && membershipCompanyId) {
    try {
      const staffCompany = await companyService.getCompanyById(membershipCompanyId);
      dispatch(setCompany(staffCompany));
      localStorage.setItem(LS_COMPANY_ID, staffCompany._id);
      companyLoaded = true;
    } catch {
      /* fall through to the searches below */
    }
  }
  const owned = companies.find((c) => {
    const createdBy =
      typeof c.createdBy === 'object' && c.createdBy !== null
        ? (c.createdBy as { _id: string })._id
        : (c.createdBy as string);
    return createdBy === userId;
  });
  if (owned) {
    userRole = 'company';
    try {
      const full = await companyService.getCompanyById(owned._id);
      dispatch(setCompany(full));
      localStorage.setItem(LS_COMPANY_ID, full._id);
      loadedApproved = (full as { approvedByAdmin?: boolean }).approvedByAdmin ?? null;
    } catch {
      // LIST sees the company but GET 404s (backend inconsistency) — the
      // list object itself is usable, don't leave the store empty.
      dispatch(setCompany(owned as Company));
      localStorage.setItem(LS_COMPANY_ID, owned._id);
      loadedApproved = (owned as unknown as { approvedByAdmin?: boolean }).approvedByAdmin ?? null;
    }
    companyLoaded = true;
  } else if (savedCompanyId) {
    // Fallback: check if companyId saved in localStorage actually exists
    try {
      const savedCompany = await companyService.getCompanyById(savedCompanyId);
      if (savedCompany) {
        userRole = 'company';
        dispatch(setCompany(savedCompany));
        companyLoaded = true;
        loadedApproved = (savedCompany as { approvedByAdmin?: boolean }).approvedByAdmin ?? null;
      }
    } catch {
      // Stale id (e.g. backend DB was reset) — drop it so we stop retrying it.
      localStorage.removeItem(LS_COMPANY_ID);
    }
  } else if (isCompanyByRole) {
    // Company account without a profile yet (fresh signup) — role stays
    // company so it lands on company onboarding, never the student track.
    userRole = 'company';
  }

  dispatch(setRole(userRole));
  dispatch(setUser(user));

  if (user.isConfirmed === false) {
    localStorage.setItem(LS_PENDING_EMAIL, user.email);
    return { redirect: '/confirm-email?resend=true', needsConfirmation: true };
  }

  // Only allow same-origin relative paths — reject "//evil.com" and "\evil.com"
  if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) {
    // Entering company onboarding explicitly marks the fresh-signup flow,
    // so the form stays reachable even for manual navigation.
    if (next.startsWith('/company/onboarding')) {
      localStorage.setItem(LS_PENDING_ONBOARDING, 'true');
    } else if (userRole !== 'company' && next.startsWith('/company/')) {
      // Company-intent user without a company must complete onboarding first
      localStorage.setItem(LS_PENDING_ONBOARDING, 'true');
    }
    return { redirect: next, needsConfirmation: false };
  }

  if (userRole === 'company') {
    // Staff always land on the dashboard — no profile, no onboarding, no flag.
    if (isStaff) {
      return { redirect: '/company/admin', needsConfirmation: false };
    }
    // Profile resolved from the server — verified or not, the dashboard
    // (and its under-review states) is home. Remember the completion.
    if (companyLoaded) {
      markCompanyProfileCompleted(userId);
      localStorage.removeItem(LS_PENDING_ONBOARDING);
      if (loadedApproved === false) {
        toastHelper.info('Your company profile is submitted and waiting for admin review.');
      }
      return { redirect: '/company/admin', needsConfirmation: false };
    }
    // No profile resolvable: a previous submit on this browser means the
    // company exists but is hidden (pending) — dashboard with a review
    // notice, NOT the onboarding form (it would just fail on duplicates).
    if (isCompanyProfileCompleted(userId)) {
      localStorage.removeItem(LS_PENDING_ONBOARDING);
      toastHelper.info('Your company profile is submitted and waiting for admin review.');
      return { redirect: '/company/admin', needsConfirmation: false };
    }
    // Truly fresh company account → the ONLY case that sees the form.
    localStorage.setItem(LS_PENDING_ONBOARDING, 'true');
    return { redirect: '/company/onboarding', needsConfirmation: false };
  }
  if (formRole === 'company') {
    localStorage.setItem(LS_PENDING_ONBOARDING, 'true');
    return { redirect: '/company/onboarding', needsConfirmation: false };
  }
  // A fully-onboarded student carrying a company-pending flag is holding
  // another account's leftover — drop it before it can hijack this login.
  const hasCategories = !!user.categories && user.categories.length > 0;
  if (userRole === 'student' && hasCategories) {
    localStorage.removeItem(LS_PENDING_ONBOARDING);
  }
  // NOTE: a bare pending flag (with no company role, company form, company
  // intent or owned company behind it) is NEVER honored — it is always
  // another account's leftover on this browser. Honoring it hijacked real
  // student accounts into company onboarding.
  // Student fallthrough: drop any flag remnants so they can never hijack
  // this account into company onboarding again.
  localStorage.removeItem(LS_PENDING_ONBOARDING);
  if (!hasCategories) {
    return { redirect: '/student/onboarding', needsConfirmation: false };
  }
  return { redirect: '/dashboard', needsConfirmation: false };
}
