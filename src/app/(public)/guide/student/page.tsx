'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArticleSkeleton } from '@/components/ui/PageSkeletons';
import GuideView from '@/features/guide/components/GuideView';

function StudentGuideInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get('welcome') === '1';

  return (
    <GuideView
      role="student"
      welcome={welcome}
      onGotIt={() => router.replace('/dashboard')}
    />
  );
}

export default function StudentGuidePage() {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <StudentGuideInner />
    </Suspense>
  );
}
