import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupForm from '@/features/auth/components/SignupForm';
import { AuthFormSkeleton } from '@/components/ui/PageSkeletons';

export const metadata: Metadata = {
  title: 'Student Sign Up',
  description: 'Create your student account on Tadrebk and start finding internships.',
};

export default function StudentSignupPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <SignupForm role="student" />
    </Suspense>
  );
}

