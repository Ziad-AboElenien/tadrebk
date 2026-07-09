'use client';

import { useState } from 'react';
import { billingService } from '@/services/billing.service';
import { useAppSelector } from '@/store/store';
import type { PlanId } from '@/features/billing/types';
import { PLAN_DETAILS } from '@/features/billing/types';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/lib/axios';

export default function BillingPlansScreen() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const [purchasing, setPurchasing] = useState<PlanId | null>(null);

  const plans = Object.values(PLAN_DETAILS);

  async function handlePurchase(planId: PlanId) {
    if (!company) return;
    setPurchasing(planId);
    try {
      const [creditsBefore, { paymentUrl, paymentOrderId }] = await Promise.all([
        billingService.getCredits(company._id).catch(() => 0),
        billingService.purchasePlan(company._id, { planId }),
      ]);
      sessionStorage.setItem('pendingPaymentOrderId', paymentOrderId);
      sessionStorage.setItem('creditsBefore', String(creditsBefore));
      window.location.href = paymentUrl;
    } catch (err) {
      toast.error(getErrorMessage(err));
      setPurchasing(null);
    }
  }

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Complete your company profile to access billing.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-dark">Choose your plan</h1>
        <p className="text-gray-500 mt-2">Purchase internship credits to start posting opportunities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((details) => (
          <div
            key={details.planId}
            className={`relative bg-white border rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col ${details.popular ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'}`}
          >
            {details.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                Most popular
              </span>
            )}

            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${details.color} flex items-center justify-center mb-5 shadow-lg`}>
              <i className={`${details.icon} text-white text-xl`} />
            </div>

            <h2 className="text-xl font-bold text-dark capitalize">{details.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{details.credits} internship credits</p>

            <div className="mt-6 mb-8">
              <span className="text-4xl font-black text-dark">{details.price}</span>
              <span className="text-gray-400 text-sm ml-1">EGP / one-time</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <i className="fas fa-check text-primary mt-0.5" />
                <span>{details.credits} internship {details.credits === 1 ? 'credit' : 'credits'}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <i className="fas fa-check text-primary mt-0.5" />
                <span>Post internships for {details.credits === 1 ? '1 student' : 'up to 3 months'}</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-gray-600">
                <i className="fas fa-check text-primary mt-0.5" />
                <span>Review applications</span>
              </li>
              {details.planId === 'enterprise' && (
                <li className="flex items-start gap-3 text-sm text-gray-600">
                  <i className="fas fa-check text-primary mt-0.5" />
                  <span>Priority support</span>
                </li>
              )}
            </ul>

            <Button
              fullWidth
              variant={details.popular ? 'primary' : 'outline'}
              loading={purchasing === details.planId}
              onClick={() => handlePurchase(details.planId)}
            >
              {purchasing === details.planId ? 'Redirecting to payment...' : `Purchase — ${details.price} EGP`}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
