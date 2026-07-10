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
    <div className="min-h-screen bg-[#f0ebe3] flex items-center justify-center p-8">
      <div className="relative w-full max-w-4xl" id="certificate">
        {/* Decorative background pattern */}
        <div className="absolute -top-6 -left-6 -right-6 -bottom-6 rounded-[2.5rem] bg-gradient-to-br from-amber-200/30 via-transparent to-amber-300/20 pointer-events-none" />

        {/* Main certificate card */}
        <div className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] overflow-hidden border border-amber-200/60">
          {/* Outer border decoration */}
          <div className="m-3 rounded-[1.6rem] border-2 border-amber-300/40 overflow-hidden">
            {/* Corner decorations */}
            <div className="absolute top-5 left-5 w-12 h-12 border-t-4 border-l-4 border-amber-400/60 rounded-tl-xl pointer-events-none" />
            <div className="absolute top-5 right-5 w-12 h-12 border-t-4 border-r-4 border-amber-400/60 rounded-tr-xl pointer-events-none" />
            <div className="absolute bottom-5 left-5 w-12 h-12 border-b-4 border-l-4 border-amber-400/60 rounded-bl-xl pointer-events-none" />
            <div className="absolute bottom-5 right-5 w-12 h-12 border-b-4 border-r-4 border-amber-400/60 rounded-br-xl pointer-events-none" />

            {/* Subtle radial gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/60 via-transparent to-transparent pointer-events-none" />

            <div className="relative px-6 py-8 sm:px-20 sm:py-16">
              {/* Top section: Logo left, title right */}
              <div className="flex items-start justify-between mb-12">
                <div className="flex-shrink-0">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-20 w-20 rounded-full object-cover border-2 border-amber-300/50 shadow-md"
                      style={{ borderRadius: '50%' }}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-2xl font-black text-amber-700 shadow-md">
                      {companyName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-500 mb-1">Certificate</p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-amber-500">of Completion</p>
                </div>
              </div>

              {/* Divider with ornament */}
              <div className="flex items-center gap-4 mb-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
                <i className="fas fa-star text-amber-400 text-xs" />
                <i className="fas fa-star text-amber-500 text-sm -mx-1" />
                <i className="fas fa-star text-amber-400 text-xs" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
              </div>

              {/* Body */}
              <div className="text-center max-w-2xl mx-auto">
                <p className="text-sm text-gray-500 font-medium tracking-wide mb-1">This certifies that</p>
                <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
                  {studentName}
                </p>
                <div className="w-16 h-0.5 bg-amber-400/60 mx-auto mb-4" />
                <p className="text-gray-500 text-sm leading-relaxed">
                  has successfully completed the internship program
                </p>
                <p className="text-lg sm:text-xl font-bold text-gray-800 mt-1 mb-4">{internship.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  at <span className="font-bold text-gray-800">{companyName}</span>
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-10">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
                <i className="fas fa-star text-amber-400 text-xs" />
                <i className="fas fa-star text-amber-500 text-sm -mx-1" />
                <i className="fas fa-star text-amber-400 text-xs" />
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-amber-300/60 to-transparent" />
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Issue Date</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-px bg-gray-300 mb-1 ml-auto" />
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">Authorized Signature</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{companyName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex flex-col sm:flex-row gap-3 sm:gap-4 w-[90vw] sm:w-auto">
        <button
          onClick={() => window.print()}
          className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-3 text-sm font-bold text-white shadow-lg hover:from-amber-600 hover:to-orange-600 transition-all text-center"
        >
          <i className="fas fa-print mr-2" /> Print (Ctrl+P)
        </button>
        <Link
          href="/my-applications"
          className="rounded-2xl bg-white px-8 py-3 text-sm font-bold text-gray-600 shadow-lg border border-gray-200 hover:bg-gray-50 transition text-center"
        >
          Back
        </Link>
      </div>

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body { background: #f0ebe3 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #certificate { box-shadow: none !important; margin: 0 auto; max-width: 100%; }
          .fixed { display: none !important; }
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>
    </div>
  );
}
