'use client';

import { Suspense } from 'react';
import Spinner from '@/components/ui/Spinner';
import CertificateScreen from '@/features/student/screens/certificate.screen';

export default function CertificatePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><Spinner size="lg" /></div>}>
      <CertificateScreen />
    </Suspense>
  );
}
