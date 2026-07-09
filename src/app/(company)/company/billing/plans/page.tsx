'use client';

import { useAppSelector } from '@/store/store';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import BillingPlansScreen from '@/features/billing/screens/plans.screen';

export default function BillingPlansPage() {
  const role = useAppSelector((s) => s.auth.role);

  if (role !== 'company') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">You need a company account to purchase plans.</p>
        <Link href="/login/company"><Button>Sign in as Company</Button></Link>
      </div>
    );
  }

  return <BillingPlansScreen />;
}
