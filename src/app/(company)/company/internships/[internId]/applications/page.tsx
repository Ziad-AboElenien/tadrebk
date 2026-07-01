'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/services/internship.service';
import { applicationService, Application } from '@/services/application.service';
import { Internship } from '@/types/internship';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export default function InternshipApplicationsPage() {
  const params = useParams();
  const router = useRouter();
  const internId = params.internId as string;
  const company = useAppSelector((s) => s.company.currentCompany);

  const [internship, setInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    if (!company || !internId) return;
    try {
      const [internData, appData] = await Promise.all([
        internshipService.getInternshipById(internId),
        applicationService.getCompanyApplications(company._id, internId, { limit: 100 }),
      ]);
      setInternship(internData);
      setApplications(appData.applications);
    } catch {
      toast.error('Failed to load applications');
      router.push('/company/dashboard');
    } finally {
      setLoading(false);
    }
  }, [company, internId, router]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  async function handleReview(applicationId: string, status: 'accepted' | 'rejected') {
    if (!company) return;
    setReviewingId(applicationId);
    try {
      const updated = await applicationService.reviewApplication(company._id, internId, applicationId, { status });
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? updated : a)));
      toast.success(`Application ${status === 'accepted' ? 'approved' : 'rejected'}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReviewingId(null);
    }
  }

  const filtered = filter === 'all'
    ? applications
    : applications.filter((a) => a.status === filter);

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Spinner /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Back + title */}
      <div className="mb-8">
        <Link href="/company/dashboard" className="text-sm text-primary hover:underline font-semibold flex items-center gap-1 mb-4">
          <i className="fas fa-arrow-left text-xs" /> Back to dashboard
        </Link>
        <h1 className="text-2xl font-black text-dark">{internship?.title || 'Internship'}</h1>
        <p className="text-gray-500 text-sm mt-1">Manage applications for this internship</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all ${
              filter === key ? 'border-primary ring-2 ring-primary/20' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <p className={`text-2xl font-black ${
              key === 'pending' ? 'text-amber-600' : key === 'accepted' ? 'text-emerald-600' : key === 'rejected' ? 'text-red-500' : 'text-dark'
            }`}>
              {statusCounts[key]}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{key}</p>
          </button>
        ))}
      </div>

      {/* Applications list */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-user-plus text-3xl mb-3 block" />
            <p className="font-semibold">No applications</p>
            <p className="text-sm mt-1">
              {filter === 'all' ? 'No one has applied yet.' : `No ${filter} applications.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((app) => (
              <div key={app._id} className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                      {app.user
                        ? `${app.user.firstName[0]}${app.user.lastName[0]}`.toUpperCase()
                        : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-dark truncate">
                        {app.user ? `${app.user.firstName} ${app.user.lastName}` : 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{app.user?.email}</p>
                      {app.coverLetter && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{app.coverLetter}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={
                      app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'
                    }>
                      {app.status}
                    </Badge>

                    {app.status === 'pending' && (
                      <>
                        <Button
                          variant="primary"
                          size="sm"
                          loading={reviewingId === app._id}
                          onClick={() => handleReview(app._id, 'accepted')}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          loading={reviewingId === app._id}
                          onClick={() => handleReview(app._id, 'rejected')}
                          className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {app.createdAt && (
                  <p className="text-xs text-gray-400 mt-3">
                    Applied {new Date(app.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
