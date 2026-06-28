'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schemas';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage } from '@/lib/axios';
import { LS_COMPANY_ID } from '@/lib/constants';
import { useAppDispatch } from '@/store/store';
import { setTokens } from '@/store/authSlice';
import { setUser } from '@/store/userSlice';
import { setCompany } from '@/store/companySlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { companyService } from '@/services/company.service';

interface LoginFormProps {
  role: 'student' | 'company';
}

export default function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const res = await authService.login(data);
      const { tokens, user } = res.data;

      // Determine role: check if user has a company
      // We'll set initial role as 'student' then check for company
      let userRole: 'student' | 'company' = 'student';

      try {
        const { companies } = await companyService.listCompanies({ limit: 50 });
        const owned = companies.find((c) => c.createdBy === user._id);
        if (owned) {
          userRole = 'company';
          dispatch(setCompany(owned));
        }
      } catch {
        // No company found — user is a student
      }

      dispatch(setTokens({ tokens, userId: user._id, role: userRole }));
      dispatch(setUser({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isConfirmed: user.isConfirmed,
        provider: user.provider,
        bio: user.bio,
        headline: user.headline,
        skills: user.skills,
        education: user.education,
        experience: user.experience,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        address: user.address,
      }));

      toast.success(`Welcome back, ${user.firstName}!`);

      const next = searchParams.get('next');
      if (next && next.startsWith('/')) {
        router.push(next);
        return;
      }

      if (userRole === 'company') {
        router.push('/company/dashboard');
      } else if (role === 'company') {
        router.push('/company/onboarding');
      } else {
        router.push('/dashboard');
      }
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
            {isCompany ? 'Company' : 'Student'} Sign In
          </span>
        </div>
        <h1 className="text-3xl font-black text-dark mb-2">Welcome back</h1>
        <p className="text-gray-400 text-sm">Sign in to continue to your account.</p>
      </div>

      {/* Google Auth */}
      <button
        type="button"
        id="google-login-btn"
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
        <span className="text-xs text-gray-300 font-medium">or continue with email</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          id="login-email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<i className="fas fa-envelope text-sm" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <div>
          <Input
            label="Password"
            id="login-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Your password"
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
            autoComplete="current-password"
            {...register('password')}
          />
          <div className="mt-2 text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-primary hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          id="login-submit-btn"
        >
          Sign In
        </Button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-gray-400 text-sm mt-6">
        Don't have an account?{' '}
        <Link href="/get-started" className="text-primary font-semibold hover:underline">
          Sign up free
        </Link>
      </p>

      {/* Switch role */}
      <p className="text-center text-gray-300 text-xs mt-3">
        {isCompany ? (
          <>
            Signing in as a student?{' '}
            <Link href="/login/student" className="text-gray-400 hover:text-primary transition-colors">
              Switch here
            </Link>
          </>
        ) : (
          <>
            Are you a company?{' '}
            <Link href="/login/company" className="text-gray-400 hover:text-primary transition-colors">
              Switch here
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
