// The role distinction (student/company) is frontend-only.
// The backend /auth/signup has no role field.
// A user becomes a "company user" when they create a Company via POST /company/
// We store the intended role in localStorage ONLY to guide the post-signup flow.

export type UserRole = 'student' | 'company' | 'admin';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// No role field — same endpoint for all users
export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  education?: {
    institution: string;
    degree: string;
    field: string;
    grade: string;
    startDate: string;
    endDate?: string;
  }[];
}

export interface OtpConfirmRequest {
  email: string;
  otp: string;
}

export interface ResendOtpRequest {
  email: string;
}

// Step 1: send new email → OTP sent to new email
export interface ChangeEmailRequest {
  newEmail: string;
}

// Step 2: confirm with OTP
export interface ConfirmChangeEmailRequest {
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

// Note: field is "password" not "newPassword" per API spec
export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
  confirmPassword: string;
}

// Note: field is "currentPassword" not "oldPassword" per API spec
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}

// ─── API Response shapes ──────────────────────────────────────
export interface ApiUserShape {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  isConfirmed: boolean;
  provider: 'system' | 'google';
  bio?: string;
  headline?: string;
  skills?: string[];
  education?: {
    institution: string;
    degree?: string;
    field?: string; // "field" not "fieldOfStudy"
    startDate?: string;
    endDate?: string;
  }[];
  experience?: {
    company: string;
    title: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }[];
  dateOfBirth?: string;
  gender?: 'male' | 'female';
  address?: string;
}

export interface SignupResponse {
  data: { user: ApiUserShape };
  msg: string;
}

export interface LoginResponse {
  data: {
    tokens: AuthTokens;
    user: ApiUserShape;
  };
  msg: string;
}

export interface TokensResponse {
  data: { tokens: AuthTokens };
  msg: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
}
