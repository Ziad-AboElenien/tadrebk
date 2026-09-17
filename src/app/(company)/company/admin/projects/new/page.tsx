'use client';

import { Suspense } from 'react';
import AddNewProjectScreen from '@/features/company/screens/admin/add-new-project.screen';

export default function AdminAddNewProjectPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">Loading...</div>}>
      <AddNewProjectScreen />
    </Suspense>
  );
}
