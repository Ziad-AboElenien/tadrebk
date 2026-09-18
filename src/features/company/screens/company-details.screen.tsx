'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Company } from '@/features/company/types';
import type { Internship } from '@/features/internship/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { companyService } from '@/features/company/services/company.service';
import { internshipService } from '@/features/internship/services/internship.service';
import { toastHelper } from '@/lib/toast';
import CompanyProfileViewer from '@/features/profiles/components/CompanyProfileViewer';

export default function CompanyDetailsScreen() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [totalInternships, setTotalInternships] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const companyData = await companyService.getCompanyById(companyId);
        setCompany(companyData);
        const result = await internshipService.listInternships({ companyId, limit: 12 });
        setInternships(result.internships);
        setTotalInternships(result.pagination.total);
      } catch {
        toastHelper.error('Failed to load company profile');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <EmptyState
            title="Company not found"
            description="The company you're looking for doesn't exist or has been removed."
            action={
              <Link href="/internships">
                <Button variant="outline">Back to Internships</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6">
        <Link
          href="/internships"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:underline"
        >
          <i className="fas fa-arrow-left text-xs" /> Back to Internships
        </Link>

        {company.bannedAt && (
          <div className="mb-6 mt-4 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <i className="fas fa-ban text-red-500" />
            <div>
              <p className="text-sm font-bold text-red-700">This company is currently unavailable</p>
              <p className="mt-0.5 text-xs text-red-600">
                The company profile has been suspended. Open positions may not be active.
              </p>
            </div>
          </div>
        )}
      </div>

      <CompanyProfileViewer company={company} postings={internships} totalPostings={totalInternships} />
    </div>
  );
}
