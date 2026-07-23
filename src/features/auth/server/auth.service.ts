import api from '@/lib/axios';
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  TokensResponse,
  OtpConfirmRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ChangeEmailRequest,
  ConfirmChangeEmailRequest,
  GoogleAuthRequest,
} from '@/features/auth/types';

// ─── Signup (no role field per API spec) ─────────────────────
export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const res = await api.post<SignupResponse>('/auth/signup', {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
    ...(data.phone ? { phone: data.phone } : {}),
    ...(data.education ? { education: data.education } : {}),
  });
  console.log('Signup response:', res); // Log the response data
  return res.data;
}

// ─── Login ───────────────────────────────────────────────────
export async function login(data: LoginRequest) {
  const res = await api.post<LoginResponse>('/auth/login', data);
  return res.data.data;
}

// ─── Google Auth ─────────────────────────────────────────────
export async function googleAuth(data: GoogleAuthRequest) {
  const res = await api.post<LoginResponse>('/auth/google', data);
  return res.data.data;
}

// ─── Confirm Email (OTP) ─────────────────────────────────────
export async function confirmEmail(data: OtpConfirmRequest) {
  const res = await api.patch('/auth/confirm-email', data);
  return res.data;
}

// ─── Resend OTP ──────────────────────────────────────────────
export async function resendOtp(data: ResendOtpRequest) {
  const res = await api.patch('/auth/resend-otp', data);
  return res.data;
}

// ─── Forgot Password ─────────────────────────────────────────
export async function forgotPassword(email: string) {
  const res = await api.patch('/auth/forgot-password', { email });
  return res.data;
}

// ─── Reset Password (field: "password" per API spec) ─────────
export async function resetPassword(data: ResetPasswordRequest) {
  const res = await api.patch('/auth/reset-password', data);
  return res.data;
}

// ─── Change Password (field: "currentPassword" per API spec) ─
export async function changePassword(data: ChangePasswordRequest) {
  const res = await api.patch('/auth/change-password', data);
  return res.data;
}

// ─── Change Email — Step 1: send OTP ─────────────────────────
export async function requestEmailChange(data: ChangeEmailRequest) {
  const res = await api.post('/auth/change-email', data);
  return res.data;
}

// ─── Change Email — Step 2: confirm with OTP ──────────────────
export async function confirmEmailChange(data: ConfirmChangeEmailRequest) {
  const res = await api.post('/auth/confirm-change-email', data);
  return res.data;
}

// ─── Refresh Token ────────────────────────────────────────────
export async function refreshTokens(refreshToken: string): Promise<TokensResponse> {
  const res = await api.post<TokensResponse>('/auth/refresh', { refreshToken });
  return res.data;
}

// ─── Logout ──────────────────────────────────────────────────
export async function logout() {
  try {
    await api.post('/auth/logout');
  } catch {
    // Silently fail — we clear state regardless
  }
}