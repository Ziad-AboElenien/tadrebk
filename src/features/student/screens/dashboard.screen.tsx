'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logout } from '@/store/authSlice';
import { applicationService, Application } from '@/features/student/services/application.service';
import { internshipService } from '@/features/internship/services/internship.service';
import { Internship } from '@/features/internship/types';
import { getCompanyImgUrl } from '@/features/company/types';
import { getUserImgUrl } from '@/features/student/types';
import { useBlankImage } from '@/lib/use-blank-image';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'completed';

export default function StudentDashboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.currentUser);
  const userId = useAppSelector((s) => s.auth.userId);

  // Saved internships
  const [savedInternships, setSavedInternships] = useState<Internship[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Applications
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const FILTER_KEYS = ['all', 'pending', 'accepted', 'rejected', 'completed'] as const;
  const filterBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useEffect(() => {
    const idx = FILTER_KEYS.indexOf(filter);
    const btn = filterBtnRefs.current[idx];
    const container = filterContainerRef.current;
    if (btn && container) {
      const containerRect = container.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillStyle({ left: btnRect.left - containerRect.left, width: btnRect.width });
    }
  }, [filter]);

  useEffect(() => {
    (async () => {
      try {
        const res = await internshipService.getSavedInternships(1, 50);
        setSavedInternships(res.internships);
      } catch { /* ignore */ }
      finally { setLoadingSaved(false); }
    })();
  }, []);

  const fetchApplications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingApps(true);
      const params: Record<string, any> = { page, limit: 10 };
      if (filter !== 'all' && filter !== 'completed') params.status = filter;
      const result = await applicationService.getUserApplications(userId, params);
      let apps = result.applications;
      if (filter === 'completed') {
        apps = apps.filter((a) => a.status === 'accepted' && a.completed);
      }
      setApplications(apps);
      setTotalPages(filter === 'completed' ? 1 : result.pagination.pages);
    } catch { toastHelper.error('Failed to load applications'); }
    finally { setLoadingApps(false); }
  }, [userId, page, filter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => { setPage(1); }, [filter]);

  const handleCancel = useCallback(async (companyId: string, internId: string, appId: string) => {
    setCancellingId(appId);
    try {
      await applicationService.cancelApplication(companyId, internId, appId);
      toastHelper.success('Application cancelled');
      fetchApplications();
    } catch (err) { toastHelper.error(getErrorMessage(err)); }
    finally { setCancellingId(null); }
  }, [fetchApplications]);

  const handleSignOut = useCallback(() => {
    dispatch(logout());
    router.push('/');
    toastHelper.success('Signed out');
  }, [dispatch, router]);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Student';
  const firstName = user?.firstName || 'there';
  const education = user?.education?.[0];
  const savedCount = savedInternships.length;
  const profileBlank = useBlankImage(getUserImgUrl(user?.profilePicture));

  const authStatus = useAppSelector((s) => s.auth.status);
  const hydrating = authStatus === 'idle' || authStatus === 'loading';

  if (hydrating) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div><div className="h-8 w-64 bg-gray-200 rounded-full animate-pulse" /><div className="h-4 w-80 bg-gray-100 rounded-full animate-pulse mt-2" /></div>
            <div className="h-10 w-40 bg-emerald-200 rounded-xl animate-pulse" />
          </div>
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px] items-start">
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="h-36 bg-gradient-to-r from-emerald-200 to-teal-200 animate-pulse" />
              <div className="px-8 pb-8 -mt-16 text-center">
                <div className="flex justify-center"><div className="h-32 w-32 rounded-[1.75rem] border-4 border-white bg-gray-200 animate-pulse" /></div>
                <div className="mt-5 h-7 w-48 bg-gray-200 rounded-full animate-pulse mx-auto" />
                <div className="mt-2 h-4 w-36 bg-gray-100 rounded-full animate-pulse mx-auto" />
                <div className="mt-6 inline-flex gap-2">
                  {[1,2,3].map((i) => <div key={i} className="h-10 w-24 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-50 rounded-2xl animate-pulse" />)}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl bg-white p-6 shadow-sm"><div className="h-5 w-28 bg-gray-200 rounded-full animate-pulse" /><div className="mt-4 space-y-3">{[1,2].map((i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div></div>
              <div className="rounded-3xl bg-white p-6 shadow-sm mt-auto"><div className="h-12 bg-gray-50 rounded-xl animate-pulse" /></div>
            </div>
          </div>
          <div className="flex gap-2 mb-6">{[1,2,3,4,5].map((i) => <div key={i} className="h-9 w-20 bg-gray-200 rounded-full animate-pulse" />)}</div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">{[1,2].map((i) => <div key={i} className="h-32 bg-white border border-gray-100 rounded-2xl shadow-sm animate-pulse" />)}</div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Please sign in to view your dashboard.</p>
        <Link href="/login/student"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-6xl px-4 sm:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome back, {firstName}!</h1>
            <p className="mt-1 text-sm text-gray-400">
              {savedCount > 0 ? `You have ${savedCount} saved internships. Keep applying!` : 'Start exploring internships that match your skills.'}
            </p>
          </div>
          <Link href="/internships" className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 hover:shadow-md">
            <i className="fas fa-search mr-2" />Browse Internships
          </Link>
        </div>

        {/* Email verification */}
        {user.isConfirmed === false && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <i className="fas fa-envelope text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">Verify your email</p>
                <p className="text-xs text-amber-700 mt-0.5">Please confirm your email address to receive notifications and acceptance emails.</p>
              </div>
            </div>
            <Link href="/confirm-email" className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm">
              Verify Now
            </Link>
          </div>
        )}

        {/* ── Profile Card + Quick Links ── */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          {/* Profile Card */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="relative bg-gradient-to-br from-emerald-500 via-emerald-400 to-teal-500 px-8 pt-10 pb-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_50%)]" />
            </div>
            <div className="px-8 pb-8 -mt-20 text-center">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1.5 rounded-[2rem] bg-gradient-to-br from-emerald-400 to-teal-500 opacity-60 blur-sm" />
                  <div className="relative h-32 w-32 flex-shrink-0 rounded-[1.75rem] border-4 border-white bg-gray-900 overflow-hidden shadow-2xl">
                    {profileBlank.showImage ? (
                      <img src={getUserImgUrl(user.profilePicture)!} alt="" className="w-full h-full object-cover" onLoad={profileBlank.onImgLoad} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                        <i className="fas fa-user text-4xl text-white/80" />
                      </div>
                    )}
                    <span className="absolute bottom-2 right-2 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                  </div>
                </div>
              </div>

              {/* Name & info */}
              <h2 className="mt-5 text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{displayName}</h2>
              <p className="mt-1.5 text-sm text-gray-400">{education?.institution || 'Not specified'}</p>

              {/* Info grid */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl bg-gray-50 px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Major</p>
                  <p className="mt-1 text-sm font-bold text-gray-900 truncate">{education?.field || 'Not specified'}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Graduation</p>
                  <p className="mt-1 text-sm font-bold text-gray-900 truncate">{education?.endDate ? `Class of ${new Date(education.endDate).getFullYear()}` : 'Not specified'}</p>
                </div>
                <div className="rounded-2xl bg-gray-50 px-4 py-3.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Email</p>
                  <p className="mt-1 text-sm font-bold text-gray-900 truncate">{user?.email || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-gray-900">Quick Links</h3>
              <div className="mt-4 space-y-3">
                <Link href="/profile" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500"><i className="fas fa-user text-xs" /></span>
                  View Profile
                </Link>
                <Link href="/internships" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500"><i className="fas fa-search text-xs" /></span>
                  Browse Internships
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-3xl bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center gap-2">
                <div className="flex-1 text-center rounded-2xl bg-white/80 backdrop-blur-sm px-3 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <p className="text-lg font-extrabold text-gray-900">{applications.length || 0}</p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Applied</p>
                </div>
                <button onClick={() => document.getElementById('saved-internships')?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="flex-1 text-center rounded-2xl bg-white/80 backdrop-blur-sm px-3 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:shadow-[0_4px_16px_rgba(16,185,129,0.12)] cursor-pointer">
                  <p className="text-lg font-extrabold text-gray-900">{savedCount}</p>
                  <p className="text-[11px] font-semibold text-emerald-500 uppercase tracking-wide mt-0.5">Saved</p>
                </button>
                <div className="flex-1 text-center rounded-2xl bg-white/80 backdrop-blur-sm px-3 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                  <p className="text-lg font-extrabold text-gray-900">{applications.filter((a) => a.status === 'accepted' && a.completed).length}</p>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mt-0.5">Done</p>
                </div>
              </div>
            </div>

            {/* Sign out */}
            <div className="rounded-3xl bg-white p-6 shadow-sm mt-auto">
              <button onClick={handleSignOut} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50">
                <i className="fas fa-sign-out-alt" /> Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* ── Applications section ── */}
        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">My Applications</h2>
              <p className="text-sm text-gray-400">Track and manage your internship applications</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div ref={filterContainerRef} className="relative mb-6 rounded-2xl bg-white/50 backdrop-blur-xl border border-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.06)] p-2">
            <div
              className="absolute top-2 bottom-2 rounded-xl bg-white/90 backdrop-blur-sm shadow-[0_2px_12px_rgba(16,185,129,0.15)] border border-emerald-100 transition-all duration-300 ease-out"
              style={{ left: pillStyle.left, width: pillStyle.width }}
            />
            <div className="relative flex w-full gap-1.5">
              {FILTER_KEYS.map((key, i) => (
                <button
                  key={key}
                  ref={(el) => { filterBtnRefs.current[i] = el; }}
                  onClick={() => setFilter(key)}
                  className={`flex-1 shrink-0 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 ${
                    filter === key ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {key === 'all' ? 'All' : key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {loadingApps ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : applications.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm text-center py-16 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-paper-plane text-2xl text-gray-300" />
              </div>
              <p className="font-semibold text-gray-600">No applications</p>
              <p className="text-sm mt-1">
                {filter === 'all' ? "You haven't applied to any internships yet." : `No ${filter} applications.`}
              </p>
              <Link href="/internships" className="inline-block mt-4">
                <Button variant="primary">Browse Internships</Button>
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
              <div className="divide-y divide-gray-50">
                {applications.map((app) => {
                  const internId = typeof app.internshipId === 'string' ? app.internshipId : app.internshipId._id;
                  const intern = typeof app.internshipId === 'object' ? app.internshipId : null;
                  const title = intern?.title || 'Internship';
                  const location = intern?.location || '';
                  const workingTime = intern?.workingTime || '';
                  const companyName = (intern as any)?.companyId?.name || '';
                  const companyLogo = (intern as any)?.companyId?.logo;
                  const logoUrl = getCompanyImgUrl(companyLogo);
                  return (
                  <div key={app._id} className="p-6 sm:p-8 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold shrink-0 text-sm">
                        {companyLogo && logoUrl ? (
                          <img src={logoUrl} alt="" className="w-full h-full rounded-xl object-contain p-1" />
                        ) : (
                          title?.[0]?.toUpperCase() || '?'
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link href={`/internships/${internId}`} className="font-bold text-gray-900 hover:text-emerald-600 transition-colors block text-base leading-snug">
                              {title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-gray-400">
                              {companyName && (
                                <span className="flex items-center gap-1"><i className="fas fa-building text-[10px]" />{companyName}</span>
                              )}
                              {location && (
                                <span className="flex items-center gap-1"><i className="fas fa-location-dot text-[10px]" />{location}</span>
                              )}
                              {workingTime && (
                                <span className="flex items-center gap-1"><i className="fas fa-clock text-[10px]" />{workingTime}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 flex-wrap">
                            <Badge variant={
                              app.status === 'accepted' && app.completed ? 'success' :
                              app.status === 'accepted' ? 'success' :
                              app.status === 'rejected' ? 'danger' : 'warning'
                            }>
                              {app.status === 'accepted' && app.completed ? 'completed' : app.status}
                            </Badge>

                            {app.status === 'accepted' && app.completed && (
                              <Link
                                href={`/certificate?name=${encodeURIComponent(displayName)}&internshipId=${internId}`}
                                className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm hover:bg-amber-600 transition"
                              >
                                <i className="fas fa-certificate mr-1" /> Certificate
                              </Link>
                            )}

                            {app.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                loading={cancellingId === app._id}
                                onClick={() => handleCancel(app.companyId, internId, app._id)}
                                className="border-red-200 text-red-500 hover:bg-red-50 hover:border-red-300"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>

                        {app.coverLetter && (
                          <div className="mt-3 bg-gray-50 rounded-xl p-4">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Cover Letter</p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed line-clamp-3">{app.coverLetter}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2.5 text-[11px] text-gray-400">
                          {app.createdAt && (
                            <span>Applied {new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          )}
                          {app.updatedAt && app.updatedAt !== app.createdAt && (
                            <span>Updated {new Date(app.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          )}
                          {app.reviewedBy && (
                            <span className="flex items-center gap-1"><i className="fas fa-check-circle" /> Reviewed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>

        {/* ── Saved Internships ── */}
        {savedInternships.length > 0 && (
          <section id="saved-internships" className="mb-10">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">Saved Internships</h2>
                <p className="text-sm text-gray-400">Roles you&apos;ve bookmarked for later.</p>
              </div>
              <Link href="/internships" className="text-sm font-semibold text-emerald-500 hover:underline">Browse All</Link>
            </div>
            {loadingSaved ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedInternships.map((intern) => {
                const companyObj = typeof intern.companyId === 'object' ? (intern.companyId as any) : null;
                const companyName = companyObj?.name || '';
                const logoUrl = companyObj ? getCompanyImgUrl(companyObj.logo) : null;
                return (
                <Link key={intern._id} href={`/internships/${intern._id}`}>
                  <div className="group rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer h-full flex flex-col">
                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-10 h-10 rounded-xl object-contain border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                          {intern.title[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">{intern.title}</p>
                        <p className="text-xs text-gray-400 truncate">{companyName || 'Internship'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {intern.location && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                          <i className="fas fa-map-marker-alt text-[9px]" />{intern.location === 'on-site' ? 'On-site' : intern.location === 'remote' ? 'Remote' : 'Hybrid'}
                        </span>
                      )}
                      {intern.workingTime && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500">
                          <i className="fas fa-clock text-[9px]" />{intern.workingTime}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto pt-4">
                      <span className="block w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white shadow-sm text-center group-hover:bg-emerald-600 group-hover:shadow-md transition-all">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
                );
              })}
            </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
