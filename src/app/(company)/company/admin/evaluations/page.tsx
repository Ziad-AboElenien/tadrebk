'use client';

import { Suspense } from 'react';
import EvaluationsDashboardScreen from '@/features/company/screens/admin/evaluations-dashboard.screen';

export default function AdminEvaluationsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">Loading...</div>}>
      <EvaluationsDashboardScreen />
    </Suspense>
  );
}
