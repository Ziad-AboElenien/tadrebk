'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  changeEmailSchema,
  type ChangeEmailFormData,
} from '@/features/auth/schemas/auth.schemas';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage } from '@/lib/axios';
import Input from '@/components/ui/Input';
import OTPInput from '@/features/auth/components/OTPInput';
import Button from '@/components/ui/Button';

export default function ChangeEmailForm() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [newEmail, setNewEmail] = useState('');
  const [sending, setSending] = useState(false);

  const emailForm = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
  });

  const [otp, setOtp] = useState('');
  const [confirming, setConfirming] = useState(false);

  async function onSubmitEmail(data: ChangeEmailFormData) {
    setSending(true);
    try {
      await authService.requestEmailChange({ newEmail: data.newEmail });
      setNewEmail(data.newEmail);
      toast.success('OTP sent to your new email');
      setStep('otp');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  async function onSubmitOtp() {
    if (!otp || otp.length < 6) return;
    setConfirming(true);
    try {
      await authService.confirmEmailChange({ otp });
      toast.success('Email changed successfully!');
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div>
      {step === 'email' ? (
        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-5">
          <Input
            label="New email address"
            type="email"
            error={emailForm.formState.errors.newEmail?.message}
            placeholder="new@example.com"
            {...emailForm.register('newEmail')}
          />
          <div className="flex gap-4 pt-2">
            <Button type="submit" loading={sending}>Send OTP</Button>
            <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-gray-600">
            Enter the OTP sent to <strong>{newEmail}</strong>
          </p>
          <OTPInput
            value={otp}
            onChange={setOtp}
            error={otp && otp.length < 6 ? 'OTP must be 6 digits' : undefined}
          />
          <div className="flex gap-4 pt-2">
            <Button onClick={onSubmitOtp} loading={confirming}>Confirm</Button>
            <Button variant="outline" type="button" onClick={() => setStep('email')}>Back</Button>
          </div>
        </div>
      )}
    </div>
  );
}
