'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArticleSkeleton } from '@/components/ui/PageSkeletons';
import GuideView from '@/features/guide/components/GuideView';

function CompanyGuideInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get('welcome') === '1';

  return (
    <GuideView
      role="company"
      welcome={welcome}
      onGotIt={() => router.replace('/company/admin')}
    />
  );
}

export default function CompanyGuidePage() {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <CompanyGuideInner />
    </Suspense>
  );
}
