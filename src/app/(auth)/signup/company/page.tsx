import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupForm from '@/features/auth/components/SignupForm';
import { AuthFormSkeleton } from '@/components/ui/PageSkeletons';

export const metadata: Metadata = {
  title: 'Company Sign Up',
  description: 'Create your company account on Tadrebk and start finding top internship talent.',
};

export default function CompanySignupPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <SignupForm role="company" />
    </Suspense>
  );
}

