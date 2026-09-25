import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/features/auth/components/LoginForm';
import { AuthFormSkeleton } from '@/components/ui/PageSkeletons';

export const metadata: Metadata = {
  title: 'Company Sign In',
  description: 'Sign in to your Tadrebk company account.',
};

export default function CompanyLoginPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginForm role="company" />
    </Suspense>
  );
}

