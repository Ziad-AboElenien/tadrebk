'use client';

import { Suspense } from 'react';
import StudentOwnProfileScreen from '@/features/profiles/screens/student-own-profile.screen';
import { StudentProfileSkeleton } from '@/features/profiles/components/ProfileSkeletons';

export default function StudentProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <StudentProfileSkeleton />
        </div>
      }
    >
      <StudentOwnProfileScreen />
    </Suspense>
  );
}
