'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, KeyRound, MailX } from 'lucide-react';
import { instructorAuthService } from '@/features/company/services/permission.service';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ArticleSkeleton } from '@/components/ui/PageSkeletons';

function SetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const inviteId = searchParams.get('invite') || '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);

  if (!token || !inviteId) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
          <MailX size={32} className="text-rose-500" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">Link didn&apos;t work</h1>
        <p className="mt-2 text-sm text-slate-500">This setup link is incomplete or expired.</p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setWorking(true);
    try {
      await instructorAuthService.acceptInvite({
        inviteId,
        token,
        newPassword: password,
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setDone(true);
      toastHelper.success('Account activated! Please sign in.');
      router.push('/login/company');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setWorking(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">You&apos;re on the team!</h1>
        <p className="mt-2 text-sm text-slate-500">Your account is active. Continue to sign in.</p>
        <Link
          href="/login/company"
          className="mt-6 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <div className="mb-6 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
          <KeyRound size={24} className="text-emerald-600" />
        </span>
        <h1 className="mt-3 text-2xl font-bold text-slate-900">Set your password</h1>
        <p className="mt-1 text-sm text-slate-500">Final step — secure your staff account.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name (optional)" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Layla" />
          <Input label="Last name (optional)" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Hassan" />
        </div>
        <Input
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          autoComplete="new-password"
        />
        <Input
          label="Confirm password"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat your password"
          autoComplete="new-password"
        />
        {error && <p className="text-xs font-medium text-rose-500">{error}</p>}
        <Button type="submit" fullWidth size="lg" loading={working}>
          Activate Account
        </Button>
      </form>
    </div>
  );
}

export default function InstructorSetupPage() {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <SetupInner />
    </Suspense>
  );
}
