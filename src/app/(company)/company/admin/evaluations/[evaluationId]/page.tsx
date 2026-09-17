'use client';

import { Suspense } from 'react';
import EvaluationDetailScreen from '@/features/company/screens/admin/evaluation-detail.screen';

export default function AdminEvaluationDetailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">Loading...</div>}>
      <EvaluationDetailScreen />
    </Suspense>
  );
}
