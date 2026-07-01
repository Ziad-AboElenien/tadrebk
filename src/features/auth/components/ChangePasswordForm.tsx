'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from '@/features/auth/schemas/auth.schemas';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage } from '@/lib/axios';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ChangePasswordForm() {
  const router = useRouter();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  async function onSubmit(data: ChangePasswordFormData) {
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success('Password changed successfully!');
      router.back();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        label="Current password"
        type={showCurrent ? 'text' : 'password'}
        error={errors.currentPassword?.message}
        rightElement={
          <button type="button" onClick={() => setShowCurrent((o) => !o)} className="text-gray-400 hover:text-gray-600 text-sm">
            <i className={`fas fa-eye${showCurrent ? '' : '-slash'}`} />
          </button>
        }
        {...register('currentPassword')}
      />

      <Input
        label="New password"
        type={showNew ? 'text' : 'password'}
        error={errors.newPassword?.message}
        hint="At least 8 characters, 1 uppercase letter, 1 number"
        rightElement={
          <button type="button" onClick={() => setShowNew((o) => !o)} className="text-gray-400 hover:text-gray-600 text-sm">
            <i className={`fas fa-eye${showNew ? '' : '-slash'}`} />
          </button>
        }
        {...register('newPassword')}
      />

      <Input
        label="Confirm new password"
        type={showConfirm ? 'text' : 'password'}
        error={errors.confirmPassword?.message}
        rightElement={
          <button type="button" onClick={() => setShowConfirm((o) => !o)} className="text-gray-400 hover:text-gray-600 text-sm">
            <i className={`fas fa-eye${showConfirm ? '' : '-slash'}`} />
          </button>
        }
        {...register('confirmPassword')}
      />

      <div className="flex gap-4 pt-2">
        <Button type="submit" loading={isSubmitting}>Change Password</Button>
        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
      </div>
    </form>
  );
}
