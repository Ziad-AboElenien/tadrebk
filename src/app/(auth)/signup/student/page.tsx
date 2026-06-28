import type { Metadata } from 'next';
import SignupForm from '@/features/auth/components/SignupForm';

export const metadata: Metadata = {
  title: 'Student Sign Up',
  description: 'Create your student account on Tadrebk and start finding internships.',
};

export default function StudentSignupPage() {
  return <SignupForm role="student" />;
}
