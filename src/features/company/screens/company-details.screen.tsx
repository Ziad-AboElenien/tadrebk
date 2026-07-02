'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Company, getImgUrl } from '@/features/company/types';
import { Internship } from '@/features/internship/types';
import InternshipCard from '@/components/ui/InternshipCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { companyService } from '@/services/company.service';
import { internshipService } from '@/services/internship.service';
import { toast } from 'react-toastify';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function CompanyDetailsScreen() {
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
        const companyData = await companyService.getCompanyById(companyId);
        setCompany(companyData);
        const result = await internshipService.listInternships({ companyId, limit: 12 });
        setInternships(result.internships);
        setTotalInternships(result.pagination.total);
      } catch {
        toast.error('Failed to load company profile');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) fetchData();
  }, [companyId]);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Spinner /></div>;
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <EmptyState title="Company not found" description="The company you're looking for doesn't exist or has been removed." action={<Link href="/internships"><Button variant="outline">Back to Internships</Button></Link>} />
        </div>
      </div>
    );
  }

  const [logoUrl] = useState(() => getImgUrl(company.logo));
  const [logoError, setLogoError] = useState(false);
  const coverUrl = getImgUrl(company.coverPicture);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-5xl px-4 sm:px-8 py-8">
        {/* Back */}
        <Link href="/internships" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <i className="fas fa-arrow-left text-xs" /> Back to Internships
        </Link>

        {/* Cover */}
        <div className="relative h-48 sm:h-56 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-emerald-500/20 to-teal-500/20">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-emerald-500/10 to-teal-500/10" />
          )}
        </div>

        {/* Avatar + header */}
        <div className="relative px-4 sm:px-6 -mt-14 mb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-3 sm:gap-4">
            {logoUrl && !logoError ? (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl shrink-0 bg-white">
                <img src={logoUrl} alt="" className="w-full h-full object-contain p-2" onError={() => setLogoError(true)} />
              </div>
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xl shrink-0">
                <i className="fas fa-building text-2xl sm:text-3xl text-white" />
              </div>
            )}
            <div className="text-center sm:text-left pb-1">
              <h1 className="text-xl sm:text-3xl font-black text-dark">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {company.industry && (
                  <span className="px-3 py-1 bg-emerald-50 text-primary text-sm font-semibold rounded-full border border-emerald-100">
                    {company.industry}
                  </span>
                )}
                {!company.approvedByAdmin && (
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-sm font-semibold rounded-full border border-amber-100">
                    Pending Approval
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 mt-5 text-sm text-gray-500">
            {company.companyEmail && (
              <span className="flex items-center gap-1.5 max-w-full">
                <i className="fas fa-envelope text-gray-300 text-xs shrink-0" /> <span className="break-all">{company.companyEmail}</span>
              </span>
            )}
            {company.address && (
              <span className="flex items-center gap-1.5 max-w-full">
                <i className="fas fa-location-dot text-gray-300 text-xs shrink-0" /> <span className="break-all">{company.address}</span>
              </span>
            )}
            {company.numberOfEmployees && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <i className="fas fa-users text-gray-300 text-xs" /> {company.numberOfEmployees} employees
              </span>
            )}
            <span className="flex items-center gap-1.5 whitespace-nowrap">
              <i className="fas fa-briefcase text-gray-300 text-xs" /> {totalInternships} open position{totalInternships !== 1 ? 's' : ''}
            </span>
            {company.createdAt && (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                <i className="fas fa-calendar text-gray-300 text-xs" /> Joined {formatDate(company.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* About */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <h2 className="font-bold text-dark text-lg mb-3 flex items-center gap-2">
            <i className="fas fa-building text-primary text-base" /> About
          </h2>
          {company.description ? (
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{company.description}</p>
          ) : (
            <p className="text-gray-400 italic">No description provided.</p>
          )}
        </div>

        {/* Open Positions */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              <i className="fas fa-list text-primary text-base" /> Open Positions
              <span className="text-sm font-semibold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">{totalInternships}</span>
            </h2>
          </div>

          {internships.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
              <i className="fas fa-file-circle-plus text-3xl text-gray-300 mb-3 block" />
              <p className="font-semibold text-gray-500">No open positions at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {internships.map((internship) => (
                <InternshipCard key={internship._id} internship={internship} compact />
              ))}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-primary/5 to-emerald-50 border border-primary/10 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <h2 className="font-bold text-dark text-lg mb-3 flex items-center gap-2">
            <i className="fas fa-headset text-primary text-base" /> Get in Touch
          </h2>
          <p className="text-sm text-gray-600 mb-4">Interested in this company or have questions about their opportunities?</p>
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${company.companyEmail}`}>
              <Button variant="primary" leftIcon={<i className="fas fa-envelope text-xs" />}>Send Email</Button>
            </a>
            <Link href="/internships">
              <Button variant="outline">Browse More Internships</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
