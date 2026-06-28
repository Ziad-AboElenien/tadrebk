import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/features/auth/components/LoginForm';
import Spinner from '@/components/ui/Spinner';

export const metadata: Metadata = {
  title: 'Company Sign In',
  description: 'Sign in to your Tadrebk company account.',
};

export default function CompanyLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      }
    >
      <LoginForm role="company" />
    </Suspense>
  );
}
