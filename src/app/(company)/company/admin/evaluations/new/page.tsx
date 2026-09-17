'use client';

import { Suspense } from 'react';
import EvaluationNewScreen from '@/features/company/screens/admin/evaluation-new.screen';

export default function AdminEvaluationNewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-400">Loading...</div>}>
      <EvaluationNewScreen />
    </Suspense>
  );
}
