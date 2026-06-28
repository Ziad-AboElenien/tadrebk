import { z } from 'zod';
import { OTP_LENGTH } from '@/lib/constants';

// ─── Password rule (shared) ───────────────────────────────────
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

// ─── Signup (no role field per API) ──────────────────────────
export const signupSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z
      .string()
      .regex(/^(\+20|0)?1[0125]\d{8}$/, 'Invalid Egyptian phone number')
      .optional()
      .or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Login ───────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── OTP ─────────────────────────────────────────────────────
export const otpSchema = z.object({
  otp: z
    .string()
    .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
    .regex(/^\d+$/, 'OTP must contain only digits'),
});

// ─── Forgot Password ─────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ─── Reset Password (uses "password" field per API spec) ──────
export const resetPasswordSchema = z
  .object({
    otp: z
      .string()
      .length(OTP_LENGTH, `OTP must be ${OTP_LENGTH} digits`)
      .regex(/^\d+$/, 'OTP must contain only digits'),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Change Password (uses "currentPassword" per API spec) ───
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Change Email (step 1: just new email) ───────────────────
export const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
});

// ─── Company Onboarding (step 2 after signup) ────────────────
export const companyOnboardingSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  industry: z.string().min(1, 'Please select an industry'),
  address: z.string().min(5, 'Address is required'),
  numberOfEmployees: z.string().min(1, 'Number of employees is required'),
  companyEmail: z.string().email('Invalid company email'),
  legalAttachment: z
    .any()
    .refine((f) => f instanceof File, 'Legal document is required'),
});

// ─── Internship Form ─────────────────────────────────────────
export const internshipSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.enum(['on-site', 'remote', 'hybrid'], {
    errorMap: () => ({ message: 'Please select a location type' }),
  }),
  workingTime: z.enum(['full-time', 'part-time']).optional(),
  softSkills: z.array(z.string()).optional().default([]),
  technicalSkills: z.array(z.string()).optional().default([]),
});

// ─── Exported Types ───────────────────────────────────────────
export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;
export type CompanyOnboardingFormData = z.infer<typeof companyOnboardingSchema>;
export type InternshipFormData = z.infer<typeof internshipSchema>;
