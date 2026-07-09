'use client';

import { useAppSelector } from '@/store/store';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import PaymentCallbackScreen from '@/features/billing/screens/payment-callback.screen';

export default function PaymentCallbackPage() {
  const role = useAppSelector((s) => s.auth.role);

  if (role !== 'company') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">You need a company account to access billing.</p>
        <Link href="/login/company"><Button>Sign in as Company</Button></Link>
      </div>
    );
  }

  return <PaymentCallbackScreen />;
}
