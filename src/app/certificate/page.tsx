'use client';

import { Suspense } from 'react';
import { ArticleSkeleton } from '@/components/ui/PageSkeletons';
import CertificateScreen from '@/features/student/screens/certificate.screen';

export default function CertificatePage() {
  return (
    <Suspense fallback={<ArticleSkeleton />}>
      <CertificateScreen />
    </Suspense>
  );
}
