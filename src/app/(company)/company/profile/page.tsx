'use client';

import { Suspense } from 'react';
import CompanyOwnProfileScreen from '@/features/profiles/screens/company-own-profile.screen';
import { CompanyProfileSkeleton } from '@/features/profiles/components/ProfileSkeletons';

export default function CompanyProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <CompanyProfileSkeleton />
        </div>
      }
    >
      <CompanyOwnProfileScreen />
    </Suspense>
  );
}
