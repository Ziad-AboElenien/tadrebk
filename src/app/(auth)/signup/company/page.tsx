import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupForm from '@/features/auth/components/SignupForm';
import Spinner from '@/components/ui/Spinner';

export const metadata: Metadata = {
  title: 'Company Sign Up',
  description: 'Create your company account on Tadrebk and start finding top internship talent.',
};

export default function CompanySignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      }
    >
      <SignupForm role="company" />
    </Suspense>
  );
}
