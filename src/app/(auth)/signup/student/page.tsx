import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignupForm from '@/features/auth/components/SignupForm';
import Spinner from '@/components/ui/Spinner';

export const metadata: Metadata = {
  title: 'Student Sign Up',
  description: 'Create your student account on Tadrebk and start finding internships.',
};

export default function StudentSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      }
    >
      <SignupForm role="student" />
    </Suspense>
  );
}
