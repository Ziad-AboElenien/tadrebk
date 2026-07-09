'use client';

import { useAppSelector } from '@/store/store';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import BillingScreen from '@/features/billing/screens/billing.screen';

export default function BillingPage() {
  const role = useAppSelector((s) => s.auth.role);

  if (role !== 'company') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">You need a company account to access billing.</p>
        <Link href="/login/company"><Button>Sign in as Company</Button></Link>
      </div>
    );
  }

  return <BillingScreen />;
}
