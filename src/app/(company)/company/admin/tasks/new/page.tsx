'use client';

import { Suspense } from 'react';
import AddNewTaskScreen from '@/features/company/screens/admin/add-new-task.screen';

export default function AdminAddNewTaskPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">Loading...</div>}>
      <AddNewTaskScreen />
    </Suspense>
  );
}
