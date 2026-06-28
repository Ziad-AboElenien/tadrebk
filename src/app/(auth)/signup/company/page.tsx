import type { Metadata } from 'next';
import SignupForm from '@/features/auth/components/SignupForm';

export const metadata: Metadata = {
  title: 'Company Sign Up',
  description: 'Create your company account on Tadrebk and start finding top internship talent.',
};

export default function CompanySignupPage() {
  return <SignupForm role="company" />;
}
