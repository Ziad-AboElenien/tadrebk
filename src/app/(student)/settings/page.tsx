'use client';

import { Suspense } from 'react';
import StudentSettingsScreen from '@/features/profiles/screens/student-settings.screen';
import { SettingsSkeleton } from '@/features/profiles/components/ProfileSkeletons';

export default function StudentSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <SettingsSkeleton />
        </div>
      }
    >
      <StudentSettingsScreen />
    </Suspense>
  );
}
