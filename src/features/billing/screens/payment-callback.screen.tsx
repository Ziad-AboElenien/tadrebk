'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { billingService } from '@/services/billing.service';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setCredits } from '@/store/billingSlice';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { toast } from 'react-toastify';

type Status = 'processing' | 'success' | 'error';

function PaymentCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const company = useAppSelector((s) => s.company.currentCompany);

  const [status, setStatus] = useState<Status>('processing');
  const [errorMsg, setErrorMsg] = useState('');
  const [creditsAmount, setCreditsAmount] = useState(0);

  useEffect(() => {
    if (!company?._id) return;

    const creditsBefore = Number(sessionStorage.getItem('creditsBefore')) || 0;
    const paymentOrderId = searchParams.get('paymentOrderId') || sessionStorage.getItem('pendingPaymentOrderId');

    const cid = company._id;
    async function checkCredits(): Promise<boolean> {
      const current = await billingService.getCredits(cid).catch(() => 0);
      if (current > creditsBefore) {
        dispatch(setCredits(current));
        setCreditsAmount(current);
        setStatus('success');
        toast.success('Payment confirmed! Credits added.');
        sessionStorage.removeItem('pendingPaymentOrderId');
        sessionStorage.removeItem('creditsBefore');
        return true;
      }
      return false;
    }

    async function run() {
      const already = await checkCredits();
      if (already) return;

      if (!paymentOrderId) {
        setStatus('error');
        setErrorMsg('We could not verify your payment. Please check your credits in billing.');
        return;
      }

      await billingService.confirmPayment(cid, { paymentOrderId }).catch(() => {});
      const confirmed = await checkCredits();
      if (!confirmed) {
        setStatus('error');
        setErrorMsg('Payment failed. Please try again.');
      }
    }

    run();
  }, [company?._id, searchParams, dispatch]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-100/30 blur-3xl" />
        <div className="absolute top-1/4 left-1/3 w-64 h-64 rounded-full bg-emerald-50/60 blur-2xl" />
      </div>

      <div className="relative w-full max-w-lg">
        {status === 'processing' && (
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-[2.5rem] p-10 shadow-xl shadow-emerald-100/50 text-center">
            <div className="w-20 h-20 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center mx-auto mb-6">
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-dark mb-2">Confirming your payment</h1>
            <p className="text-gray-500">Please wait while we verify your transaction.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-[2.5rem] p-10 sm:p-12 shadow-2xl shadow-emerald-100/50 text-center animate-fade-in-up">
            {/* Animated checkmark */}
            <div className="relative mx-auto mb-8 w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping-slow opacity-60" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <svg className="w-12 h-12 text-white animate-check-scale" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            {/* Sparkle dots */}
            <div className="flex justify-center gap-2 mb-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-dark mb-3 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
              Payment Successful! 🎉
            </h1>
            <p className="text-gray-500 text-lg mb-2 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
              Your internship credits have been added.
            </p>

            {/* Credits counter */}
            <div className="my-8 inline-block animate-fade-in-up" style={{ animationDelay: '0.6s', animationFillMode: 'both' }}>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl px-8 py-5 border border-emerald-200/50">
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">Available Credits</p>
                <p className="text-5xl font-black text-emerald-600">
                  {creditsAmount}
                  <span className="text-lg font-bold text-emerald-400 ml-1">credits</span>
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up" style={{ animationDelay: '0.8s', animationFillMode: 'both' }}>
              <Button
                onClick={() => router.push('/company/billing')}
                className="!bg-gradient-to-r !from-emerald-500 !to-emerald-600 !shadow-lg !shadow-emerald-200 hover:!shadow-xl hover:!shadow-emerald-300 !transition-all !duration-300 !px-8 !py-3.5 !text-base !font-bold !rounded-xl"
              >
                <i className="fas fa-coins mr-2" />
                Check My Credits
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/company/dashboard')}
                className="!px-8 !py-3.5 !text-base !font-semibold !rounded-xl !border-2"
              >
                <i className="fas fa-th-large mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white/80 backdrop-blur-sm border border-red-100 rounded-[2.5rem] p-10 shadow-xl shadow-red-100/30 text-center">
            <div className="w-20 h-20 rounded-[1.25rem] bg-red-50 flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-black text-dark mb-2">Payment Failed</h1>
            <p className="text-gray-500 mb-2">{errorMsg || 'Something went wrong.'}</p>
            <p className="text-sm text-gray-400 mb-8">Please try again or contact support.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/company/billing/plans')}>
                Try Again
              </Button>
              <Button onClick={() => router.push('/company/dashboard')}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Global animations */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping-slow {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 0; }
        }
        @keyframes check-scale {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out both; }
        .animate-ping-slow { animation: ping-slow 2s ease-in-out infinite; }
        .animate-check-scale { animation: check-scale 0.5s ease-out 0.3s both; }
      `}</style>
    </div>
  );
}

export default function PaymentCallbackScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <PaymentCallbackInner />
    </Suspense>
  );
}
