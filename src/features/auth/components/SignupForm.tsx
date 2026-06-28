'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { signupSchema, type SignupFormData } from '@/features/auth/schemas/auth.schemas';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage } from '@/lib/axios';
import { LS_PENDING_EMAIL } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface SignupFormProps {
  role: 'student' | 'company';
}

export default function SignupForm({ role }: SignupFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    try {
      await authService.signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone || undefined,
      });
      // Store pending email for the confirm-email page
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_PENDING_EMAIL, data.email);
      }
      toast.success('Account created! Please check your email for the OTP.');
      router.push('/confirm-email');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const isCompany = role === 'company';

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompany ? 'bg-gray-100' : 'bg-emerald-50'}`}>
            <i className={`${isCompany ? 'fas fa-building text-gray-600' : 'fas fa-graduation-cap text-primary'} text-sm`} />
          </div>
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {isCompany ? 'Company' : 'Student'} Sign Up
          </span>
        </div>
        <h1 className="text-3xl font-black text-dark mb-2">Create your account</h1>
        <p className="text-gray-400 text-sm">
          {isCompany
            ? "You'll set up your company profile after confirming your email."
            : 'Join thousands of students finding their dream internships.'}
        </p>
      </div>

      {/* Google Auth */}
      <button
        type="button"
        id="google-signup-btn"
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 hover:border-gray-200 bg-white py-3 rounded-xl font-semibold text-sm text-gray-700 transition-all mb-6 hover:shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-300 font-medium">or sign up with email</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            id="signup-firstName"
            placeholder="Ahmed"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            id="signup-lastName"
            placeholder="Hassan"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email address"
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<i className="fas fa-envelope text-sm" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone number (optional)"
          id="signup-phone"
          type="tel"
          placeholder="01012345678"
          leftIcon={<i className="fas fa-phone text-sm" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Password"
          id="signup-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 chars, 1 uppercase, 1 number"
          leftIcon={<i className="fas fa-lock text-sm" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={`fas fa-eye${showPassword ? '-slash' : ''} text-sm`} />
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm password"
          id="signup-confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat your password"
          leftIcon={<i className="fas fa-lock text-sm" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              <i className={`fas fa-eye${showConfirm ? '-slash' : ''} text-sm`} />
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          id="signup-submit-btn"
          className="mt-2"
        >
          Create Account
        </Button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-gray-400 text-sm mt-6">
        Already have an account?{' '}
        <Link
          href={`/login/${role}`}
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>

      {/* Switch role */}
      <p className="text-center text-gray-300 text-xs mt-3">
        {isCompany ? (
          <>
            Signing up as a student?{' '}
            <Link href="/signup/student" className="text-gray-400 hover:text-primary transition-colors">
              Switch here
            </Link>
          </>
        ) : (
          <>
            Are you a company?{' '}
            <Link href="/signup/company" className="text-gray-400 hover:text-primary transition-colors">
              Switch here
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
