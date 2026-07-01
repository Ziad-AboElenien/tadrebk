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
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';

interface SignupFormProps {
  role: 'student' | 'company';
}

export default function SignupForm({ role }: SignupFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signInWithGoogle } = useGoogleAuth();

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
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 hover:border-gray-200 bg-white py-3 rounded-xl font-semibold text-sm text-gray-700 transition-all mb-6 hover:shadow-sm"
      >
        <i className="fab fa-google text-lg" style={{ color: '#4285F4' }} />
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
