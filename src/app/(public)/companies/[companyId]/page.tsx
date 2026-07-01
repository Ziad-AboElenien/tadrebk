'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Company } from '@/types/company';
import { Internship } from '@/types/internship';
import InternshipCard from '@/components/ui/InternshipCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { companyService } from '@/services/company.service';
import { internshipService } from '@/services/internship.service';
import { toast } from 'react-toastify';

export default function CompanyProfilePage() {
  const params = useParams();
  const companyId = params.companyId as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalInternships, setTotalInternships] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch company details
        const companyData = await companyService.getCompanyById(companyId);
        setCompany(companyData);

        // Fetch company's internships
        const result = await internshipService.listInternships({
          companyId,
          limit: 12,
        });
        setInternships(result.internships);
        setTotalInternships(result.pagination.total);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || 'Failed to load company profile',
          { position: 'bottom-right' }
        );
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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

  const initials = company.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/internships" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Internships
          </Link>
        </div>
      </div>

      {/* Cover Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Company Header */}
        <div className="py-12 border-b border-slate-200">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Logo */}
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
              {initials}
            </div>

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-slate-900">
                  {company.name}
                </h1>
                {!company.approvedByAdmin && (
                  <Badge variant="warning">Pending Approval</Badge>
                )}
              </div>

              <p className="text-lg text-slate-600 mb-3">{company.industry}</p>

              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Company Size</p>
                  <p className="font-semibold text-slate-900">
                    {company.numberOfEmployees} employees
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Location</p>
                  <p className="font-semibold text-slate-900">{company.address}</p>
                </div>
                <div>
                  <p className="text-slate-500">Active Positions</p>
                  <p className="font-semibold text-slate-900">{totalInternships}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <section className="py-12 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">About the Company</h2>
          <p className="text-slate-700 leading-relaxed text-lg">
            {company.description || 'No description provided'}
          </p>
        </section>

        {/* Open Positions */}
        <section className="py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900">
              Open Positions ({totalInternships})
            </h2>
          </div>

          {internships.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-lg">
              <p className="text-slate-600 text-lg">
                No open positions at the moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {internships.map((internship) => (
                <InternshipCard
                  key={internship._id}
                  internship={internship}
                  compact={true}
                />
              ))}
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section className="py-12 border-t border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h2>
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <p className="text-slate-700 mb-4">
              Interested in this company or have questions about their opportunities?
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href={`mailto:${company.companyEmail}`}>
                <Button variant="primary">Send Email</Button>
              </a>
              <Link href="/internships">
                <Button variant="outline">Browse More Internships</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
