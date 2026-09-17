'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import RateApplicationForm from '@/features/internship/components/RateApplicationForm';
import { applicationService } from '@/features/student/services/application.service';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

export default function CompanyRateApplicationScreen() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationId = params.applicationId as string;
  const name = searchParams.get('name') || 'this intern';

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
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Interns" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Rate Intern" />

        <main className="animate-fade-in mx-auto w-full max-w-2xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Link
            href="/company/admin/interns"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={15} /> Back
          </Link>

          {done ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle2 size={30} className="text-emerald-500" />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-slate-900">Rating Submitted!</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                Thanks for rating {name}. Your feedback was recorded.
              </p>
              <button
                onClick={() => router.back()}
                className="mt-6 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                Go Back
              </button>
            </div>
          ) : (
            <RateApplicationForm
              heading={`Rate ${name}`}
              subheading="Share how this intern performed during the internship."
              submitting={submitting}
              serverError={serverError}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
            />
          )}
        </main>
      </div>
    </div>
  );
}
