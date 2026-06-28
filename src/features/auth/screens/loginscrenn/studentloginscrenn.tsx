import type { Metadata } from 'next';
import LoginForm from '@/features/auth/components/LoginForm';

export const metadata: Metadata = {
  title: 'Student Sign In',
  description: 'Sign in to your Tadrebk student account.',
};

export default function StudentLoginScreen() {
  return <LoginForm role="student" />;
}
