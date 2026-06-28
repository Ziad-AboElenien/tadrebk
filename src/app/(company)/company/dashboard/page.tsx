'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/services/internship.service';
import { Internship } from '@/types/internship';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';

export default function CompanyDashboardPage() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!company?._id) {
      setLoading(false);
      return;
    }

    internshipService
      .listInternships({ companyId: company._id, limit: 10 })
      .then((res) => setInternships(res.internships))
      .catch(() => setInternships([]))
      .finally(() => setLoading(false));
  }, [company?._id]);

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">
          Complete your company profile to access the dashboard.
        </p>
        <Link href="/company/onboarding">
          <Button>Complete Company Profile</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {!company.approvedByAdmin && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <i className="fas fa-clock text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Pending admin approval</p>
            <p className="text-sm text-amber-800">
              Your company profile is under review. You can still manage internships.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-3xl p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-dark">{company.name}</h1>
            <p className="text-gray-500 text-sm mt-1">{company.industry}</p>
          </div>
          <Badge variant={company.approvedByAdmin ? 'success' : 'warning'}>
            {company.approvedByAdmin ? 'Approved' : 'Pending'}
          </Badge>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-dark">Your internships</h2>
        <Button variant="outline" disabled title="Coming soon">
          Post internship
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : internships.length === 0 ? (
        <p className="text-gray-500 text-center py-12">
          No internships posted yet.
        </p>
      ) : (
        <div className="space-y-3">
          {internships.map((intern) => (
            <div
              key={intern._id}
              className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
            >
              <div>
                <p className="font-semibold text-dark">{intern.title}</p>
                <p className="text-sm text-gray-500">
                  {intern.location} · {intern.workingTime}
                </p>
              </div>
              <Badge variant={intern.closed ? 'neutral' : 'success'}>
                {intern.closed ? 'Closed' : 'Open'}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
