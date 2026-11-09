'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, MailX } from 'lucide-react';
import { instructorAuthService } from '@/features/company/services/permission.service';
import { getErrorMessage } from '@/lib/axios';
import { ArticleSkeleton } from '@/components/ui/PageSkeletons';

function ConfirmInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const inviteId = searchParams.get('invite') || '';

  const [state, setState] = useState<'working' | 'done' | 'error'>('working');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !inviteId) {
      setError('This confirmation link is incomplete.');
      setState('error');
      return;
    }
    instructorAuthService
      .confirmInvite({ inviteId, token })
      .then(() => setState('done'))
      .catch((err) => {
        setError(getErrorMessage(err));
        setState('error');
      });
  }, [token, inviteId]);



  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 py-12 text-center">
      {state === 'working' && (
        <>
          <Loader2 size={36} className="animate-spin text-emerald-500" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Confirming your invitation…</h1>
          <p className="mt-2 text-sm text-slate-500">One moment while we verify your link.</p>
        </>
      )}
      {state === 'done' && (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Invitation confirmed!</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your invitation has been confirmed successfully.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Back to Home
          </Link>
        </>
      )}
      {state === 'error' && (
        <>
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
            <MailX size={32} className="text-rose-500" />
          </span>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Link didn&apos;t work</h1>
          <p className="mt-2 text-sm text-slate-500">{error || 'This link is invalid or expired.'}</p>
          <Link
            href="/"
            className="mt-6 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Back to Home
          </Link>
        </>
      )}
    </div>
  );
}

export default function InstructorConfirmPage() {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <ConfirmInner />
    </Suspense>
  );
}
