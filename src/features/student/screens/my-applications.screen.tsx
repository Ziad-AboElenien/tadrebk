'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { applicationService, Application } from '@/services/application.service';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

const statusLabels: Record<string, string> = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' };

function getInternshipId(app: Application): string | null {
  if (typeof app.internshipId === 'string') return app.internshipId;
  if (app.internshipId && typeof app.internshipId === 'object') return app.internshipId._id;
  return null;
}

function getInternshipTitle(app: Application): string {
  if (typeof app.internshipId === 'object' && app.internshipId?.title) return app.internshipId.title;
  return 'Internship';
}

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export default function MyApplicationsScreen() {
  const router = useRouter();
  const user = useAppSelector((s) => s.user.currentUser);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const fetchApplications = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;
      const res = await applicationService.getUserApplications(user._id, params);
      setApplications(res.applications);
      setTotalPages(res.pagination.pages);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user, page, filter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => { setPage(1); }, [filter]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Please log in to view your applications.</p>
      </div>
    );
  }

  const statusCounts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-2">
        <Link href="/dashboard" className="text-sm text-primary hover:underline font-semibold flex items-center gap-1 mb-4">
          <i className="fas fa-arrow-left text-xs" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-black text-dark">My Applications</h1>
        <p className="text-sm text-gray-500 mt-1">Track the status of all your internship applications</p>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
            <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{key === 'all' ? 'All' : key}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <i className="fas fa-file-alt text-4xl text-gray-300 mb-4 block" />
          <p className="font-semibold text-gray-500">No applications</p>
          <p className="text-sm text-gray-400 mt-1">
            {filter === 'all' ? "You haven't applied to any internships yet." : `No ${filter} applications.`}
          </p>
          <Link href="/internships" className="inline-block mt-4 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition">
            Browse Internships
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const internId = getInternshipId(app);
            const title = getInternshipTitle(app);
            return (
              <div key={app._id} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={internId ? `/internships/${internId}` : '#'}
                      className="font-semibold text-dark hover:text-primary transition-colors truncate block text-lg"
                    >
                      {title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">
                      Applied {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                      {statusLabels[app.status] || app.status}
                    </Badge>
                    {internId && (
                      <Link href={`/internships/${internId}`}>
                        <span className="text-xs font-semibold text-primary hover:underline">View Internship</span>
                      </Link>
                    )}
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="mt-3 bg-gray-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Cover Letter</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-2">{app.coverLetter}</p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <i className="fas fa-chevron-left text-xs mr-1" /> Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <i className="fas fa-chevron-right text-xs ml-1" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
