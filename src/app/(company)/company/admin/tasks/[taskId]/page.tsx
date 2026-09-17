'use client';

import { Suspense } from 'react';
import TaskDetailScreen from '@/features/company/screens/admin/task-detail.screen';

export default function AdminTaskDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">Loading...</div>}>
      <TaskDetailScreen />
    </Suspense>
  );
}
