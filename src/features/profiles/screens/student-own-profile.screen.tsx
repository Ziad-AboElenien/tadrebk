'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setUser } from '@/store/userSlice';
import { userService } from '@/features/student/services/user.service';
import type { User } from '@/features/student/types';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import Button from '@/components/ui/Button';
import StudentProfileOwn from '@/features/profiles/components/StudentProfileOwn';
import StudentProfileViewer from '@/features/profiles/components/StudentProfileViewer';
import { StudentProfileSkeleton } from '@/features/profiles/components/ProfileSkeletons';

export default function StudentOwnProfileScreen() {
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const storedUser = useAppSelector((s) => s.user.currentUser);
  const userId = useAppSelector((s) => s.auth.userId);
  const [remoteUser, setRemoteUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isPreview = searchParams.get('preview') === 'company';

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const fresh = await userService.getUserProfile(userId);
        if (cancelled) return;
        dispatch(setUser(fresh));
        setRemoteUser(fresh);
      } catch (err) {
        if (!cancelled) toastHelper.error(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // `dispatch` is stable; `userId` is the only real input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const user = remoteUser ?? storedUser;

  if (!userId && !user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Profile not found</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to view your profile.</p>
          <Link href="/login/student" className="mt-6 inline-block">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user || (userId && loading && !storedUser)) {
    return (
      <div className="min-h-screen bg-slate-50">
        <StudentProfileSkeleton />
      </div>
    );
  }

  if (isPreview) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
          <p className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            Preview — this is how companies see your profile.{' '}
            <Link href="/profile" className="font-semibold underline">
              Back to my profile
            </Link>
          </p>
        </div>
        <StudentProfileViewer user={user} backHref="/profile" backLabel="Back to my profile" />
      </div>
    );
  }

  return <StudentProfileOwn user={user} />;
}
