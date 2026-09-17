'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { applicationService } from '@/features/student/services/application.service';
import RateApplicationForm from '@/features/internship/components/RateApplicationForm';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

export default function RateApplicationScreen() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = params.applicationId as string;
  const name = searchParams.get('name') || 'this application';

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (score: number, comment?: string) => {
    setSubmitting(true);
    setServerError('');
    try {
      await applicationService.rateApplication(applicationId, { score, comment });
      setDone(true);
      window.scrollTo(0, 0);
    } catch (err) {
      const msg = getErrorMessage(err);
      if (msg.includes('already') || msg.includes('blind')) {
        setServerError(msg);
      } else {
        toastHelper.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="animate-fade-in mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft size={15} /> Back to dashboard
        </Link>

        <div className="mt-4">
          {done ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={30} className="text-emerald-500" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Rating Submitted!</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Thanks for rating your experience. Your feedback helps future interns.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href="/dashboard" className="rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600">
                  Back to Dashboard
                </Link>
                <Link href="/internships" className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                  Browse Internships
                </Link>
              </div>
            </div>
          ) : (
            <RateApplicationForm
              heading={`Rate your experience`}
              subheading={`How was working with ${name}?`}
              submitting={submitting}
              serverError={serverError}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
            />
          )}
        </div>
      </main>
    </div>
  );
}
