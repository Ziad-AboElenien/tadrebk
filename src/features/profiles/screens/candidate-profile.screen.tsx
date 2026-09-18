'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { StudentProfileSkeleton } from '@/features/profiles/components/ProfileSkeletons';
import { userService } from '@/features/student/services/user.service';
import type { User } from '@/features/student/types';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import StudentProfileViewer from '@/features/profiles/components/StudentProfileViewer';

export default function CandidateProfileScreen() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await userService.getUserProfile(userId);
        setUser(data);
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, router]);

  const internshipTitle = searchParams.get('internshipTitle');
  const status = searchParams.get('status');

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Interns" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Candidate Profile" />
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="bg-slate-50">
              <StudentProfileSkeleton />
            </div>
          ) : user ? (
            <StudentProfileViewer
              user={user}
              onBack={() => router.back()}
              application={
                internshipTitle ? { internshipTitle, status: status || 'pending' } : null
              }
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
