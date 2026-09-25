'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { applicationService, Application } from '@/features/student/services/application.service';
import type { RatingData } from '@/features/student/services/application.service';
import Badge from '@/components/ui/Badge';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
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
  const [ratings, setRatings] = useState<Record<string, RatingData | null>>({});

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
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user, page, filter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => { setPage(1); }, [filter]);

  useEffect(() => {
    if (applications.length === 0) return;
    const completed = applications.filter((a) => a.completed && a.status === 'accepted');
    completed.forEach(async (app) => {
      try {
        const res = await applicationService.getRatings(app._id);
        setRatings((prev) => ({ ...prev, [app._id]: res.studentRating }));
      } catch {
        setRatings((prev) => ({ ...prev, [app._id]: null }));
      }
    });
  }, [applications]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">Please log in to view your applications.</p>
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
        <Link href="/dashboard" className="text-sm text-emerald-600 hover:underline font-semibold flex items-center gap-1 mb-4">
          <i className="fas fa-arrow-left text-xs" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
        <p className="text-sm text-slate-500 mt-1">Track the status of all your internship applications</p>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all ${
              filter === key ? 'border-emerald-500 ring-2 ring-primary/20' : 'border-slate-100 hover:border-slate-200'
            }`}
          >
            <p className={`text-2xl font-bold ${
              key === 'pending' ? 'text-amber-600' : key === 'accepted' ? 'text-emerald-600' : key === 'rejected' ? 'text-red-500' : 'text-slate-900'
            }`}>
              {statusCounts[key]}
            </p>
            <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">{key === 'all' ? 'All' : key}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-3xl border border-slate-100 bg-white p-5">
              <div className="h-5 w-2/3 rounded-lg bg-slate-100" />
              <div className="mt-2 h-4 w-1/3 rounded-full bg-slate-100" />
              <div className="mt-3 flex gap-2">
                <div className="h-8 w-24 rounded-xl bg-slate-100" />
                <div className="h-8 w-24 rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
          <i className="fas fa-file-alt text-4xl text-slate-300 mb-4 block" />
          <p className="font-semibold text-slate-500">No applications</p>
          <p className="text-sm text-slate-400 mt-1">
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
              <div key={app._id} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={internId ? `/internships/${internId}` : '#'}
                      className="font-semibold text-slate-900 hover:text-emerald-600 transition-colors truncate block text-lg"
                    >
                      {title}
                    </Link>
                    <p className="text-xs text-slate-400 mt-1">
                      Applied {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <Badge variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                      {statusLabels[app.status] || app.status}
                    </Badge>
                    {app.status === 'accepted' && app.completed && internId && (
                      <Link
                        href={`/certificate?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&internshipId=${internId}`}
                        className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition"
                      >
                        <i className="fas fa-certificate mr-1" /> Certificate
                      </Link>
                    )}
                    {app.status === 'accepted' && app.completed && ratings[app._id] == null && (
                      <Link
                        href={`/applications/${app._id}/rate?name=${encodeURIComponent(typeof app.companyId === 'object' ? (app.companyId as any)?.name || 'Company' : 'Company')}`}
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition"
                      >
                        <i className="fas fa-star mr-1" /> Rate Company
                      </Link>
                    )}
                    {app.status === 'accepted' && app.completed && ratings[app._id] != null && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, s) => (
                          <i key={s} className={`fas fa-star text-xs ${s < (ratings[app._id]?.score || 0) ? 'text-amber-400' : 'text-gray-200'}`} />
                        ))}
                      </div>
                    )}
                    {internId && (
                      <Link href={`/internships/${internId}`}>
                        <span className="text-xs font-semibold text-emerald-600 hover:underline">View Internship</span>
                      </Link>
                    )}
                  </div>
                </div>

                {app.coverLetter && (
                  <div className="mt-3 bg-slate-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Cover Letter</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-2">{app.coverLetter}</p>
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <i className="fas fa-chevron-left text-xs mr-1" /> Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
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

