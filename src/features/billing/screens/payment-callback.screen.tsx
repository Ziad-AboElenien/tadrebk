'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { billingService } from '@/services/billing.service';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setCredits } from '@/store/billingSlice';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';

type Status = 'processing' | 'success' | 'error';

function PaymentCallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const company = useAppSelector((s) => s.company.currentCompany);

  const [status, setStatus] = useState<Status>('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!company?._id) return;

    const paymentOrderId = searchParams.get('paymentOrderId');
    if (!paymentOrderId) {
      setStatus('error');
      setErrorMsg('Missing payment order ID.');
      return;
    }

    billingService
      .confirmPayment(company._id, { paymentOrderId })
      .then(async () => {
        const credits = await billingService.getCredits(company._id);
        dispatch(setCredits(credits));
        setStatus('success');
        toast.success('Payment confirmed! Credits added.');
      })
      .catch((err) => {
        setStatus('error');
        setErrorMsg(getErrorMessage(err));
      });
  }, [company?._id, searchParams, dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-3xl p-8 sm:p-10 shadow-sm text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <Spinner />
            </div>
            <h1 className="text-xl font-black text-dark mb-2">Processing payment...</h1>
            <p className="text-sm text-gray-500">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-check text-emerald-600 text-2xl" />
            </div>
            <h1 className="text-xl font-black text-dark mb-2">Payment successful!</h1>
            <p className="text-sm text-gray-500 mb-8">Your credits have been added to your account.</p>
            <Button onClick={() => router.push('/company/billing')}>
              Go to billing
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-xmark text-red-500 text-2xl" />
            </div>
            <h1 className="text-xl font-black text-dark mb-2">Payment failed</h1>
            <p className="text-sm text-gray-500 mb-2">{errorMsg || 'Something went wrong.'}</p>
            <p className="text-sm text-gray-400 mb-8">Please try again or contact support.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/company/billing/plans')}>
                Try again
              </Button>
              <Button onClick={() => router.push('/company/dashboard')}>
                Go to dashboard
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentCallbackScreen() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    }>
      <PaymentCallbackInner />
    </Suspense>
  );
}
