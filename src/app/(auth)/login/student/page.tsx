import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/features/auth/components/LoginForm';
import { AuthFormSkeleton } from '@/components/ui/PageSkeletons';

export const metadata: Metadata = {
  title: 'Student Sign In',
  description: 'Sign in to your Tadrebk student account.',
};

export default function StudentLoginPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginForm role="student" />
    </Suspense>
  );
}

