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
import { userService } from '@/services/user.service';
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

      console.log('JWT payload:', decoded);

      const user = await userService.getUserProfile(userId);
      console.log('User profile:', user);

      // Check if JWT says admin, OR user profile has admin role
      if (decoded?.role === 'admin' || (user as any).role === 'admin') {
        dispatch(setTokens({ tokens, userId, role: 'admin' }));
        dispatch(setUser(user));
        toast.success(`Welcome back, ${user.firstName}!`);
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

      dispatch(setTokens({ tokens, userId, role: userRole }));
      dispatch(setUser(user));

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
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 hover:border-gray-200 bg-white py-3 rounded-xl font-semibold text-sm text-gray-700 transition-all mb-6 hover:shadow-sm"
      >
        <i className="fab fa-google text-lg" style={{ color: '#4285F4' }} />
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
