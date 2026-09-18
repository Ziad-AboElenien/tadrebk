'use client';

import { Suspense } from 'react';
import CandidateProfileScreen from '@/features/profiles/screens/candidate-profile.screen';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { StudentProfileSkeleton } from '@/features/profiles/components/ProfileSkeletons';

export default function CandidateProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen bg-slate-50">
          <Sidebar active="Interns" />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <TopBar title="Candidate Profile" />
            <div className="flex-1 overflow-y-auto">
              <div className="bg-slate-50">
                <StudentProfileSkeleton />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CandidateProfileScreen />
    </Suspense>
  );
}
