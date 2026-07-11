'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { billingService } from '@/features/billing/services/billing.service';
import { useAppSelector } from '@/store/store';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';

export default function BillingScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?._id) { setLoading(false); return; }
    billingService
      .getCredits(company._id)
      .then(setCredits)
      .catch((err) => toast.error(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [company?._id]);

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Complete your company profile to access billing.</p>
        <Link href="/company/onboarding"><Button>Complete Company Profile</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 sm:px-8 py-8">

        <Link href="/company/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <i className="fas fa-arrow-left text-xs" /> Back to Dashboard
        </Link>

        {/* ── Credits card ── */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <i className="fas fa-coins" />
            </div>
            <div>
              <h2 className="font-bold text-dark">Internship credits</h2>
              <p className="text-xs text-gray-400">Your remaining internship posting credits</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-black text-dark">{credits ?? 0}</p>
                <p className="text-sm text-gray-500 mt-1">credits remaining</p>
              </div>
              <Link href="/company/billing/plans">
                <Button leftIcon={<i className="fas fa-plus text-xs" />}>
                  Buy credits
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* ── Plans quick overview ── */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <i className="fas fa-store" />
            </div>
            <div>
              <h2 className="font-bold text-dark">Available plans</h2>
              <p className="text-xs text-gray-400">Choose a plan that fits your needs</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['starter', 'growth', 'enterprise'].map((plan) => (
              <div key={plan} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-5 text-center">
                <p className="text-sm font-bold text-dark capitalize mb-1">{plan}</p>
                <p className="text-xs text-gray-400">Purchase credits to post internships</p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link href="/company/billing/plans">
              <Button variant="outline">View all plans &amp; pricing</Button>
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
