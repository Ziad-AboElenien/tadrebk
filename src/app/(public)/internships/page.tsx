import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ListingPageSkeleton } from '@/components/ui/PageSkeletons';
import InternshipsListingScreen from '@/features/internship/screens/internships-listing.screen';

export const metadata: Metadata = {
  title: 'Internships',
  description:
    'Explore fresh internship opportunities posted by verified companies across Egypt.',
};

export default function InternshipsPage() {
  return (
    <Suspense fallback={<ListingPageSkeleton />}>
      <InternshipsListingScreen />
    </Suspense>
  );
}
