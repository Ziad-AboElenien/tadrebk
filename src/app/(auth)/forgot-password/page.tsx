'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toastHelper } from '@/lib/toast';
import Link from 'next/link';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/features/auth/schemas/auth.schemas';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage, getErrorStatus } from '@/lib/axios';
import { LS_PENDING_EMAIL } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [socialAccount, setSocialAccount] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    try {
      await authService.forgotPassword(data.email);
      localStorage.setItem(LS_PENDING_EMAIL, data.email);
      setSent(true);
      toastHelper.success('OTP sent to your email!');
    } catch (err) {
      if (getErrorStatus(err) === 400 && /social login/i.test(getErrorMessage(err))) {
        setSocialAccount(true);
        return;
      }
      toastHelper.error(getErrorMessage(err));
    }
  }

  if (socialAccount) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-google text-3xl text-sky-500" />
        </div>
        <h1 className="text-3xl font-black text-dark mb-3">No password to reset</h1>
        <p className="text-gray-400 text-sm mb-8 leading-relaxed">
          This account uses Google sign-in and has no password to reset. Sign in
          with Google to access your account instead.
        </p>
        <Link href="/login/student">
          <Button fullWidth size="lg" leftIcon={<i className="fas fa-google text-sm" />}>
            Go to Sign In
          </Button>
        </Link>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-paper-plane text-3xl text-primary" />
        </div>
        <h1 className="text-3xl font-black text-dark mb-3">OTP Sent!</h1>
        <p className="text-gray-400 text-sm mb-8">
          We've sent a password reset code to <span className="font-semibold text-dark">{getValues('email')}</span>. Check your inbox.
        </p>
        <Button
          fullWidth
          size="lg"
          onClick={() => router.push('/reset-password')}
          id="go-to-reset-btn"
        >
          Enter Reset Code
        </Button>
        <p className="text-gray-300 text-xs mt-4">
          Didn't receive it? Wait 5 minutes then try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
        <i className="fas fa-key text-2xl text-amber-500" />
      </div>
      <h1 className="text-3xl font-black text-dark mb-2">Forgot password?</h1>
      <p className="text-gray-400 text-sm mb-8">
        Enter your email and we'll send you a reset code.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Email address"
          id="forgot-email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<i className="fas fa-envelope text-sm" />}
          error={errors.email?.message}
          {...register('email')}
        />
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          id="forgot-password-submit-btn"
        >
          Send Reset Code
        </Button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        Remembered it?{' '}
        <Link href="/login/student" className="text-primary font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
