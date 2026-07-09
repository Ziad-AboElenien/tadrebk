'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { billingService } from '@/services/billing.service';
import { useAppSelector } from '@/store/store';
import type { PlanId } from '@/features/billing/types';
import { PLAN_DETAILS } from '@/features/billing/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'react-toastify';
import { getErrorMessage } from '@/lib/axios';

type PaymentPhase = 'idle' | 'creating' | 'popup_open' | 'confirming' | 'error';

export default function BillingPlansScreen() {
  const router = useRouter();
  const company = useAppSelector((s) => s.company.currentCompany);

  const [phase, setPhase] = useState<PaymentPhase>('idle');
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const popupRef = useRef<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const confirmRef = useRef<(() => void) | null>(null);

  const plans = Object.values(PLAN_DETAILS);

  function stopPolling() {
    if (pollRef.current) clearInterval(pollRef.current);
  }

  async function handlePurchase(planId: PlanId) {
    if (!company) return;
    setSelectedPlan(planId);
    setPhase('creating');
    setErrorMsg('');

    try {
      const { paymentUrl, paymentOrderId: orderId } = await billingService.purchasePlan(company._id, { planId });
      setPaymentOrderId(orderId);

      const popup = window.open(paymentUrl, 'paymob', 'width=600,height=750');
      if (!popup) {
        toast.warning('Popup was blocked. Please allow popups or try again.');
        setPhase('error');
        setErrorMsg('Popup blocked. Please allow popups for this site and try again.');
        return;
      }

      popupRef.current = popup;
      setPhase('popup_open');

      pollRef.current = setInterval(() => {
        if (popup.closed) {
          stopPolling();
          confirmRef.current?.();
        }
      }, 500);
    } catch (err) {
      setPhase('error');
      setErrorMsg(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    }
  }

  async function handleConfirm() {
    if (!company || !paymentOrderId) return;
    setPhase('confirming');

    try {
      await billingService.confirmPayment(company._id, { paymentOrderId });
      toast.success('Payment confirmed! Credits added.');
      router.push('/company/billing/callback?status=success');
    } catch (err) {
      setPhase('error');
      setErrorMsg(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    }
  }

  confirmRef.current = handleConfirm;

  function handleRetry() {
    stopPolling();
    if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    setPhase('idle');
    setSelectedPlan(null);
    setPaymentOrderId('');
    setErrorMsg('');
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

      {phase === 'popup_open' && (
        <div className="max-w-lg mx-auto mb-10 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <i className="fas fa-credit-card text-amber-600 text-2xl" />
          </div>
          <h2 className="text-xl font-black text-dark mb-2">Complete your payment</h2>
          <p className="text-sm text-gray-500 mb-6">
            A payment window is open. After you finish, close it and we will confirm automatically.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleConfirm} variant="outline">
              Click here if already paid
            </Button>
            <Button variant="outline" onClick={handleRetry}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {phase === 'confirming' && (
        <div className="max-w-lg mx-auto mb-10 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
            <Spinner />
          </div>
          <h2 className="text-xl font-black text-dark mb-2">Confirming payment...</h2>
          <p className="text-sm text-gray-500">Please wait while we verify your payment.</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="max-w-lg mx-auto mb-10 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
            <i className="fas fa-xmark text-red-500 text-2xl" />
          </div>
          <h2 className="text-xl font-black text-dark mb-2">Payment failed</h2>
          <p className="text-sm text-gray-500 mb-2">{errorMsg || 'Something went wrong.'}</p>
          <p className="text-sm text-gray-400 mb-8">Please try again or contact support.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleRetry}>
              Try again
            </Button>
            <Button onClick={() => router.push('/company/dashboard')}>
              Go to dashboard
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((details) => (
          <div
            key={details.planId}
            className={`relative bg-white border rounded-3xl p-6 sm:p-8 shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-1 flex flex-col ${details.popular ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100'} ${phase !== 'idle' ? 'opacity-50 pointer-events-none' : ''}`}
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
              <span className="text-4xl font-black text-dark">${details.price}</span>
              <span className="text-gray-400 text-sm ml-1">/ one-time</span>
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
              loading={phase === 'creating' && selectedPlan === details.planId}
              onClick={() => handlePurchase(details.planId)}
            >
              {phase === 'creating' && selectedPlan === details.planId
                ? 'Creating payment...'
                : `Purchase — $${details.price}`}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
