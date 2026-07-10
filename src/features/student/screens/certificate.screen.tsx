'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { internshipService } from '@/services/internship.service';
import { getImgUrl } from '@/features/company/types';
import type { Internship } from '@/features/internship/types';
import Spinner from '@/components/ui/Spinner';

export default function CertificateScreen() {
  const searchParams = useSearchParams();
  const studentName = searchParams.get('name') || 'Student';
  const internshipId = searchParams.get('internshipId') || '';

  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!internshipId) { setLoading(false); return; }
    internshipService.getInternshipById(internshipId)
      .then(setInternship)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [internshipId]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!internship) return <div className="text-center py-20 text-gray-500">Invalid certificate link.</div>;

  const company = (internship.companyId as any)?._id
    ? (internship.companyId as any)
    : internship.company || {};
  const companyName = company.name || 'Company';
  const logoUrl = getImgUrl(company.logo);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-8">
      <div className="w-full max-w-3xl bg-white rounded-[2rem] shadow-2xl border border-amber-100 overflow-hidden" id="certificate">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2" />
        <div className="p-12 sm:p-16 text-center">
          <div className="mb-8 flex justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-20 w-20 rounded-2xl object-cover border border-gray-200" />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center text-2xl font-black text-amber-700">
                {companyName.charAt(0)}
              </div>
            )}
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-500 mb-2">Certificate of Completion</p>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">{internship.title}</h1>

          <div className="w-24 h-1 bg-amber-400 mx-auto my-6 rounded-full" />

          <p className="text-gray-500 text-sm mb-2">This certifies that</p>
          <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6">{studentName}</p>
          <p className="text-gray-500 text-sm leading-relaxed max-w-lg mx-auto">
            has successfully completed the internship program at{' '}
            <span className="font-bold text-gray-800">{companyName}</span>.
          </p>

          <div className="w-24 h-1 bg-amber-400 mx-auto my-8 rounded-full" />

          <p className="text-xs text-gray-400">
            Issued on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={() => window.print()}
          className="rounded-2xl bg-amber-500 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-amber-600 transition"
        >
          <i className="fas fa-print mr-2" /> Print (Ctrl+P)
        </button>
        <Link
          href="/my-applications"
          className="rounded-2xl bg-white px-8 py-3 text-sm font-bold text-gray-600 shadow-lg border border-gray-200 hover:bg-gray-50 transition"
        >
          Back
        </Link>
      </div>
    </div>
  );
}
