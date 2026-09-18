'use client';

import { Suspense } from 'react';
import CompanySettingsScreen from '@/features/company/screens/settings.screen';
import { SettingsSkeleton } from '@/features/profiles/components/ProfileSkeletons';

export default function CompanySettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <SettingsSkeleton />
        </div>
      }
    >
      <CompanySettingsScreen />
    </Suspense>
  );
}
