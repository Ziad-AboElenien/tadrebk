'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/features/auth/schemas/auth.schemas';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage } from '@/lib/axios';
import { LS_PENDING_EMAIL } from '@/lib/constants';
import Input from '@/components/ui/Input';
import OTPInput from '@/components/ui/OTPInput';
import Button from '@/components/ui/Button';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(LS_PENDING_EMAIL) || '';
    setEmail(stored);
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(data: ResetPasswordFormData) {
    if (!email) {
      toast.error('Email not found. Please go back to Forgot Password.');
      return;
    }
    try {
      // API uses "password" not "newPassword"
      await authService.resetPassword({
        email,
        otp: data.otp,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Password reset successfully! Please sign in.');
      localStorage.removeItem(LS_PENDING_EMAIL);
      router.push('/login/student');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
        <i className="fas fa-shield-alt text-2xl text-primary" />
      </div>
      <h1 className="text-3xl font-black text-dark mb-2">Reset password</h1>
      <p className="text-gray-400 text-sm mb-8">
        Enter the 6-digit code we sent to{' '}
        <span className="font-semibold text-dark">{email || 'your email'}</span>{' '}
        and choose a new password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* OTP */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Verification Code
          </label>
          <Controller
            name="otp"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <OTPInput
                value={field.value}
                onChange={field.onChange}
                error={errors.otp?.message}
              />
            )}
          />
        </div>

        {/* New password — note: Zod schema has "password" field */}
        <Input
          label="New password"
          id="reset-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 chars, 1 uppercase, 1 number"
          leftIcon={<i className="fas fa-lock text-sm" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className={`fas fa-eye${showPassword ? '-slash' : ''} text-sm`} />
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm new password"
          id="reset-confirm-password"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat your new password"
          leftIcon={<i className="fas fa-lock text-sm" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
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
          id="reset-password-submit-btn"
        >
          Reset Password
        </Button>
      </form>

      <p className="text-center text-gray-400 text-sm mt-6">
        <Link href="/forgot-password" className="text-primary font-semibold hover:underline">
          ← Resend OTP
        </Link>
      </p>
    </div>
  );
}
