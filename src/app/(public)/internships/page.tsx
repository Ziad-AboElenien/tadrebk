'use client';

import { Suspense } from 'react';
import Spinner from '@/components/ui/Spinner';
import InternshipsListingScreen from '@/features/internship/screens/internships-listing.screen';

export default function InternshipsPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
      <InternshipsListingScreen />
    </Suspense>
  );
}
