'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage } from '@/lib/axios';
import { LS_PENDING_EMAIL, LS_INTENDED_ROLE } from '@/lib/constants';
import OTPInput from '@/features/auth/components/OTPInput';
import Button from '@/components/ui/Button';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [otpError, setOtpError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(LS_PENDING_EMAIL) || '';
    setEmail(stored);
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  async function handleConfirm() {
    if (otp.length < 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }
    setOtpError('');
    setIsSubmitting(true);
    try {
      await authService.confirmEmail({ email, otp });
      toast.success('Email confirmed! Welcome to Tadrebk!');
      localStorage.removeItem(LS_PENDING_EMAIL);

      // Route based on intended role
      const intendedRole = localStorage.getItem(LS_INTENDED_ROLE);
      localStorage.removeItem(LS_INTENDED_ROLE);
      if (intendedRole === 'company') {
        router.push('/login/company?next=/company/onboarding');
      } else {
        router.push('/login/student');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (!email) return;
    setIsResending(true);
    try {
      await authService.resendOtp({ email });
      toast.success('New OTP sent! Check your email.');
      setCountdown(300); // 5 min cooldown
      setOtp('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="w-full max-w-md text-center">
      {/* Icon */}
      <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-envelope-open-text text-3xl text-primary" />
      </div>

      <h1 className="text-3xl font-black text-dark mb-3">Check your email</h1>
      <p className="text-gray-400 text-sm mb-2">
        We sent a 6-digit verification code to
      </p>
      <p className="text-dark font-semibold text-sm mb-8 bg-gray-50 px-4 py-2 rounded-xl inline-block">
        {email || 'your email address'}
      </p>

      <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4 text-left">
        <p className="text-xs font-semibold text-amber-800 flex items-center gap-1.5">
          <i className="fas fa-exclamation-triangle text-amber-500" />
          Email delivery notice
        </p>
        <p className="text-xs text-amber-700 mt-1 leading-relaxed">
          In some cases, the email may not trigger a notification. Please check your spam folder in case the email was filtered.
        </p>
      </div>

      {/* OTP Input */}
      <div className="mb-8">
        <OTPInput
          length={6}
          value={otp}
          onChange={(v) => { setOtp(v); setOtpError(''); }}
          disabled={isSubmitting}
          error={otpError}
        />
      </div>

      <Button
        onClick={handleConfirm}
        fullWidth
        size="lg"
        loading={isSubmitting}
        disabled={otp.length < 6}
        id="confirm-email-btn"
      >
        Verify Email
      </Button>

      {/* Resend */}
      <div className="mt-6">
        {countdown > 0 ? (
          <p className="text-gray-400 text-sm">
            Resend OTP in{' '}
            <span className="text-primary font-semibold">
              {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-sm">
            Didn't receive it?{' '}
            <button
              onClick={handleResend}
              disabled={isResending}
              id="resend-otp-btn"
              className="text-primary font-semibold hover:underline disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend OTP'}
            </button>
          </p>
        )}
      </div>

      {/* Wrong email */}
      <p className="text-gray-300 text-xs mt-4">
        Wrong email?{' '}
        <button
          onClick={() => router.push('/signup/student')}
          className="text-gray-400 hover:text-primary transition-colors"
        >
          Go back and try again
        </button>
      </p>
    </div>
  );
}
