import { UserRole } from '@/features/auth/types';

// ============================================================
// IMPORTANT: There is NO role field in /auth/signup API.
// "Role" is a frontend concept only:
//   - student  = user who did NOT create a company
//   - company  = user who created a company via POST /company/
//
// We store "intendedRole" in localStorage during signup flow
// to guide the user to the right onboarding path.
// The actual role is determined by checking if the user has
// a company profile (LS_COMPANY_ID set).
// ============================================================
export const LS_INTENDED_ROLE = 'tadrebk_intended_role'; // temp during signup

// ============================================================
// Internship enums matching API spec
// ============================================================
export const INTERNSHIP_LOCATION = {
  ON_SITE: 'on-site',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
} as const;

export const INTERNSHIP_LOCATION_LABELS: Record<string, string> = {
  'on-site': 'On-site',
  remote: 'Remote',
  hybrid: 'Hybrid',
};

export const INTERNSHIP_TYPE = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
} as const;

export const INTERNSHIP_TYPE_LABELS: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
};

// ============================================================
// Company industry options
// ============================================================
export const COMPANY_INDUSTRIES = [
  { value: 'Technology', label: 'Technology' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Media', label: 'Media & Entertainment' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Other', label: 'Other' },
] as const;

// ============================================================
// OTP config
// ============================================================
export const OTP_LENGTH = 6;

// ============================================================
// Pagination defaults
// ============================================================
export const DEFAULT_PAGE_SIZE = 9;
export const HOME_FEATURED_LIMIT = 6;

// ============================================================
// Local storage keys
// ============================================================
export const LS_ACCESS_TOKEN = 'tadrebk_access_token';
export const LS_REFRESH_TOKEN = 'tadrebk_refresh_token';
export const LS_USER_ROLE = 'tadrebk_user_role';   // 'student' | 'company'
export const LS_USER_ID = 'tadrebk_user_id';
export const LS_COMPANY_ID = 'tadrebk_company_id';
export const LS_TOKEN_TIMESTAMP = 'tadrebk_token_timestamp';
// Stored temporarily during signup to route user to correct onboarding
export const LS_PENDING_EMAIL = 'tadrebk_pending_email';
export const LS_PROFILE_PICTURE = 'tadrebk_profile_picture';
export const LS_COVER_PICTURE = 'tadrebk_cover_picture';

export const TOKEN_TTL_MS = 86400000; // 1 day

// ============================================================
// Avatar gradient fallbacks
// ============================================================
export const AVATAR_GRADIENTS = [
  'from-emerald-400 to-teal-600',
  'from-violet-400 to-purple-600',
  'from-amber-400 to-orange-600',
  'from-rose-400 to-pink-600',
  'from-sky-400 to-blue-600',
  'from-lime-400 to-green-600',
] as const;
