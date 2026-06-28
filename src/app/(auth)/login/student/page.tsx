import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from '@/features/auth/components/LoginForm';
import Spinner from '@/components/ui/Spinner';

export const metadata: Metadata = {
  title: 'Student Sign In',
  description: 'Sign in to your Tadrebk student account.',
};

export default function StudentLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      }
    >
      <LoginForm role="student" />
    </Suspense>
  );
}
