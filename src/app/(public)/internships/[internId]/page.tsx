'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Internship } from '@/types/internship';
import { Company } from '@/types/company';
import InternshipCard from '@/components/ui/InternshipCard';
import CompanyCard from '@/components/ui/CompanyCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { internshipService } from '@/services/internship.service';
import { companyService } from '@/services/company.service';
import { toast } from 'react-toastify';

export default function InternshipDetailsPage() {
  const params = useParams();
  const internId = params.internId as string;

  const [internship, setInternship] = useState<Internship | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [moreInternships, setMoreInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch internship details
        const internshipData = await internshipService.getInternshipById(internId);
        setInternship(internshipData);

        // Fetch company details
        const companyData = await companyService.getCompanyById(internshipData.companyId);
        setCompany(companyData);

        // Fetch more internships from this company
        const result = await internshipService.listInternships({
          companyId: internshipData.companyId,
          limit: 3,
        });
        const filtered = result.internships.filter((i) => i._id !== internId);
        setMoreInternships(filtered);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || 'Failed to load internship details',
          { position: 'bottom-right' }
        );
      } finally {
        setLoading(false);
      }
    };

    if (internId) {
      fetchData();
    }
  }, [internId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <EmptyState
            title="Internship not found"
            description="The internship you're looking for doesn't exist or has been removed."
            action={
              <Link href="/internships">
                <Button variant="default">Back to Internships</Button>
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const locationEmojis: Record<string, string> = {
    'on-site': '📍',
    remote: '🌐',
    hybrid: '🔀',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/internships" className="text-blue-600 hover:text-blue-700 text-sm">
            ← Back to Internships
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Content */}
        <article className="mb-12">
          {/* Title & Status */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">
                  {internship.title}
                </h1>
              </div>
              {internship.closed && (
                <Badge variant="danger" className="ml-4">
                  Closed
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="info">
                {locationEmojis[internship.location]} {internship.location}
              </Badge>
              <Badge variant="info">
                ⏰ {internship.workingTime}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <section className="mb-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">About this Internship</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
              {internship.description}
            </p>
          </section>

          {/* Skills Required */}
          <section className="mb-12">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Required Skills</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Technical Skills */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {internship.technicalSkills.length > 0 ? (
                    internship.technicalSkills.map((skill) => (
                      <Badge key={skill} variant="neutral">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-slate-600 text-sm">No specific technical skills required</p>
                  )}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-4">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {internship.softSkills.length > 0 ? (
                    internship.softSkills.map((skill) => (
                      <Badge key={skill} variant="neutral">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-slate-600 text-sm">No specific soft skills required</p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* CTA Buttons */}
          <section className="flex gap-4 mb-12 pb-12 border-b border-slate-200">
            <Button variant="primary" size="lg" className="flex-1">
              Apply Now
            </Button>
            <Button variant="outline" size="lg" className="flex-1">
              Save for Later
            </Button>
          </section>

          {/* Company Section */}
          {company && (
            <section className="mb-12">
              <h2 className="text-xl font-bold text-slate-900 mb-6">About the Company</h2>

              {/* Company Mini Card */}
              <div className="mb-8 p-6 border border-slate-200 rounded-lg">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                    {company.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {company.name}
                    </h3>
                    <p className="text-slate-600">{company.industry}</p>
                  </div>
                </div>

                <p className="text-slate-700 mb-4 leading-relaxed">
                  {company.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Company Size</p>
                    <p className="font-semibold text-slate-900">
                      {company.numberOfEmployees} employees
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Location</p>
                    <p className="font-semibold text-slate-900">{company.address}</p>
                  </div>
                </div>

                <Link href={`/companies/${company._id}`}>
                  <Button variant="outline" className="w-full">
                    View Company Profile
                  </Button>
                </Link>
              </div>
            </section>
          )}
        </article>

        {/* More Opportunities */}
        {moreInternships.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                More Opportunities at {company?.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {moreInternships.map((internship) => (
                <InternshipCard
                  key={internship._id}
                  internship={internship}
                  compact={true}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
