'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { toastHelper } from '@/lib/toast';
import Link from 'next/link';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schemas';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage } from '@/lib/axios';
import { LS_COMPANY_ID, LS_PENDING_ONBOARDING, LS_PENDING_EMAIL } from '@/lib/constants';
import { useAppDispatch } from '@/store/store';
import { setTokens, setRole } from '@/store/authSlice';
import { setUser } from '@/store/userSlice';
import { setCompany } from '@/store/companySlice';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AuthSplit from '@/features/auth/components/AuthSplit';
import { GraduationCap, Building2, ShieldCheck, BadgeCheck, Zap } from 'lucide-react';
import { companyService } from '@/features/company/services/company.service';
import { userService } from '@/features/student/services/user.service';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

interface LoginFormProps {
  role: 'student' | 'company' | 'admin';
}

export default function LoginForm({ role }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { signInWithGoogle } = useGoogleAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    try {
      const { tokens } = await authService.login(data);

      const decoded = parseJwt(tokens.accessToken);
      const userId: string = decoded?.id;
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
        toastHelper.success(`Welcome back, ${user.firstName}!`);
        router.push('/admin/dashboard');
        return;
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
          } catch { /* saved company no longer exists */ }
        }
      }

      dispatch(setRole(userRole));
      dispatch(setUser(user));

      if (user.isConfirmed === false) {
        localStorage.setItem(LS_PENDING_EMAIL, user.email);
        toastHelper.info('Please verify your email to continue.');
        router.push('/confirm-email?resend=true');
        return;
      }

      toastHelper.success(`Welcome back, ${user.firstName}!`);

      const next = searchParams.get('next');
      // Only allow same-origin relative paths — reject "//evil.com" and "\evil.com"
      if (next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')) {
        // Company-intent user without a company must complete onboarding first
        if (userRole !== 'company' && next.startsWith('/company/')) {
          localStorage.setItem(LS_PENDING_ONBOARDING, 'true');
        }
        router.push(next);
        return;
      }

      if (userRole === 'company') {
        router.push('/company/admin');
      } else if (role === 'company') {
        localStorage.setItem(LS_PENDING_ONBOARDING, 'true');
        router.push('/company/onboarding');
      } else if (!user.categories || user.categories.length === 0) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    }
  }

  const isCompany = role === 'company';

  return (
    <AuthSplit
      heroIcon={isCompany ? Building2 : GraduationCap}
      heroGradient={isCompany ? 'from-blue-500 to-blue-700' : 'from-emerald-400 to-emerald-600'}
      heroTitle={isCompany ? 'Hire Egypt’s brightest interns' : 'Launch your career with top internships'}
      heroText={
        isCompany
          ? 'Post roles, track applicants and grow your team — everything in one organized place.'
          : 'Discover verified internships, apply in minutes and track everything from your dashboard.'
      }
      heroFeatures={
        isCompany
          ? [
              { icon: BadgeCheck, title: 'Verified Talent', tint: 'bg-blue-100', iconColor: 'text-blue-600' },
              { icon: Zap, title: 'Fast Posting', tint: 'bg-amber-100', iconColor: 'text-amber-600' },
              { icon: ShieldCheck, title: 'Secure Process', tint: 'bg-emerald-100', iconColor: 'text-emerald-600' },
            ]
          : [
              { icon: ShieldCheck, title: 'Secure Sign In', tint: 'bg-emerald-100', iconColor: 'text-emerald-600' },
              { icon: BadgeCheck, title: 'Verified Companies', tint: 'bg-blue-100', iconColor: 'text-blue-600' },
              { icon: Zap, title: 'Quick Apply', tint: 'bg-amber-100', iconColor: 'text-amber-600' },
            ]
      }
      backHref="/"
      backLabel="Back to Home"
      cardGradient={isCompany ? 'from-blue-500 to-blue-700' : 'from-emerald-400 to-emerald-600'}
      cardTitle="Welcome back"
      cardSubtitle="Sign in to continue to your account."
    >
      {/* Google Auth */}
      <button
        type="button"
        id="google-login-btn"
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 border-2 border-slate-100 hover:border-slate-200 bg-white py-3 rounded-xl font-semibold text-sm text-slate-700 transition-all mb-6 hover:shadow-sm"
      >
        <i className="fab fa-google text-lg" style={{ color: '#4285F4' }} />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-xs text-slate-300 font-medium">or continue with email</span>
        <div className="flex-1 h-px bg-slate-100" />
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
                className="text-slate-400 hover:text-slate-600 transition-colors"
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
              className="text-xs text-emerald-600 hover:underline font-medium"
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
      <p className="text-center text-slate-400 text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/get-started" className="text-emerald-600 font-semibold hover:underline">
          Sign up free
        </Link>
      </p>

    </AuthSplit>
  );
}
