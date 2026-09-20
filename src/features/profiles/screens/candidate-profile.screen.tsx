'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { StudentProfileSkeleton } from '@/features/profiles/components/ProfileSkeletons';
import { useAppSelector } from '@/store/store';
import { userService } from '@/features/student/services/user.service';
import { companyService } from '@/features/company/services/company.service';
import type { User } from '@/features/student/types';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import StudentProfileViewer from '@/features/profiles/components/StudentProfileViewer';

export default function CandidateProfileScreen() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = useAppSelector((s) => s.company.currentCompany?._id);
  const userId = params.userId as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [invited, setInvited] = useState(false);

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
  const internshipId = searchParams.get('internshipId');

  async function handleInvite() {
    if (!companyId || !internshipId || inviting || invited) return;
    setInviting(true);
    try {
      await companyService.sendInvite(companyId, internshipId, userId);
      setInvited(true);
      toastHelper.success('Invitation sent to the candidate!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setInviting(false);
    }
  }

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
              onInvite={internshipId && !invited ? handleInvite : undefined}
              inviteLabel={inviting ? 'Sending…' : invited ? 'Invited ✓' : undefined}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
