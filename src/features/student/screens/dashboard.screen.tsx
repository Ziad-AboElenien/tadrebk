'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logout } from '@/store/authSlice';
import { applicationService, Application } from '@/services/application.service';
import { internshipService } from '@/services/internship.service';
import { Internship } from '@/features/internship/types';
import { getCompanyIdFromInternship } from '@/features/internship/types';
import { getImgUrl } from '@/features/company/types';
import { getUserImgUrl } from '@/features/student/types';
import { getFileProxyUrl } from '@/lib/file-proxy';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import { userService } from '@/services/user.service';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';

const LS_SAVED = 'tadrebk_saved_internships';

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export default function StudentDashboardScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.currentUser);
  const userId = useAppSelector((s) => s.auth.userId);

  // Saved internships
  const [savedInternships, setSavedInternships] = useState<Internship[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(true);

  // Resume
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>((user as any)?.resume || null);
  const resumeRef = useRef<HTMLInputElement>(null);

  // Applications
  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const ids: string[] = JSON.parse(localStorage.getItem(LS_SAVED) || '[]');
        if (ids.length > 0) {
          const results = await Promise.allSettled(ids.map((id) => internshipService.getInternshipById(id)));
          const internships: Internship[] = [];
          results.forEach((r) => { if (r.status === 'fulfilled') internships.push(r.value); });
          setSavedInternships(internships);
        }
      } catch { /* ignore */ }
      finally { setLoadingSaved(false); }
    })();
  }, []);

  const fetchApplications = useCallback(async () => {
    if (!userId) return;
    try {
      setLoadingApps(true);
      const params: Record<string, any> = { page, limit: 10 };
      if (filter !== 'all') params.status = filter;
      const result = await applicationService.getUserApplications(userId, params);
      setApplications(result.applications);
      setTotalPages(result.pagination.pages);
    } catch { toast.error('Failed to load applications'); }
    finally { setLoadingApps(false); }
  }, [userId, page, filter]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);
  useEffect(() => { setPage(1); }, [filter]);

  async function handleCancel(companyId: string, internId: string, appId: string) {
    setCancellingId(appId);
    try {
      await applicationService.cancelApplication(companyId, internId, appId);
      toast.success('Application cancelled');
      fetchApplications();
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setCancellingId(null); }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try { const url = await userService.uploadResume(file); setResumeUrl(url); toast.success('Resume uploaded!'); }
    catch { toast.error('Failed to upload resume'); } finally { setUploadingResume(false); if (resumeRef.current) resumeRef.current.value = ''; }
  }

  const handleSignOut = useCallback(() => {
    dispatch(logout());
    router.push('/');
    toast.success('Signed out');
  }, [dispatch, router]);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Student';
  const firstName = user?.firstName || 'there';
  const education = user?.education?.[0];
  const savedCount = savedInternships.length;

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
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Welcome back, {firstName}!</h1>
            <p className="mt-1 text-sm text-gray-400">
              {savedCount > 0 ? `You have ${savedCount} saved internships. Keep applying!` : 'Start exploring internships that match your skills.'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/internships"><button className="rounded-xl border-2 border-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-gray-200">Browse More</button></Link>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="h-20 bg-gradient-to-r from-emerald-400 to-emerald-600" />
            <div className="px-6 pb-6">
              <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
                <div className="flex items-end gap-4 flex-wrap">
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl border-4 border-white bg-gray-900 overflow-hidden flex items-center justify-center text-white text-2xl font-bold">
                    {getUserImgUrl(user?.profilePicture) ? <img src={getUserImgUrl(user.profilePicture)!} alt="" className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
                    <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="pb-1">
                    <h2 className="text-xl font-extrabold text-gray-900">{displayName}</h2>
                    <p className="flex items-center gap-1.5 text-sm text-gray-400"><i className="fas fa-briefcase text-xs" />{education?.institution || 'Not specified'}</p>
                  </div>
                </div>
                <Link href="/profile" className="pb-1 text-sm font-semibold text-emerald-500 hover:underline">Edit Profile</Link>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-5">
                <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Major</p><p className="mt-1 text-sm font-bold text-gray-900 truncate">{education?.field || 'Not specified'}</p></div>
                <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Graduation</p><p className="mt-1 text-sm font-bold text-gray-900 truncate">{education?.endDate ? `Class of ${new Date(education.endDate).getFullYear()}` : 'Not specified'}</p></div>
                <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">Email</p><p className="mt-1 text-sm font-bold text-gray-900 truncate">{user?.email || '—'}</p></div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-gray-900">Quick Links</h3>
            <div className="mt-4 space-y-3">
              <Link href="/profile" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition"><i className="fas fa-user-pen text-emerald-500 w-5 text-center" />Edit Profile</Link>
              <Link href="/internships" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition"><i className="fas fa-search text-emerald-500 w-5 text-center" />Browse Internships</Link>
              <Link href="/profile" className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition"><i className="fas fa-cog text-emerald-500 w-5 text-center" />Account Settings</Link>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><p className="text-sm text-gray-400">Total Applied</p><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"><i className="fas fa-paper-plane" /></span></div>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">{applications.length || '—'}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><p className="text-sm text-gray-400">Resume</p><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"><i className="fas fa-file-pdf" /></span></div>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">{resumeUrl ? '✓' : '—'}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400"><i className="fas fa-clock text-xs" /> {resumeUrl ? 'Uploaded' : 'Not uploaded'}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between"><p className="text-sm text-gray-400">Saved Roles</p><span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-500"><i className="fas fa-bookmark" /></span></div>
            <p className="mt-2 text-3xl font-extrabold text-gray-900">{savedCount}</p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400"><i className="fas fa-clock text-xs" /> Stored on your device</p>
          </div>
        </div>

        {/* Applications section */}
        <div className="mb-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900">My Applications</h2>
              <p className="text-sm text-gray-400">Track and manage your internship applications</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {(['all', 'pending', 'accepted', 'rejected'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`bg-white border rounded-2xl p-5 shadow-sm text-left transition-all ${
                  filter === key ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-wide">{key === 'all' ? 'All' : key}</p>
              </button>
            ))}
          </div>

          {loadingApps ? (
            <div className="flex justify-center py-20"><Spinner /></div>
          ) : applications.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm text-center py-16 text-gray-400">
              <i className="fas fa-paper-plane text-3xl mb-3 block" />
              <p className="font-semibold">No applications</p>
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
                  const logoUrl = typeof companyLogo === 'string' ? companyLogo : companyLogo?.secure_url || '';
                  return (
                  <div key={app._id} className="p-6 sm:p-8">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold shrink-0 text-lg">
                        {title?.[0]?.toUpperCase() || '?'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="min-w-0">
                            <Link
                              href={`/internships/${internId}`}
                              className="font-bold text-dark hover:text-primary transition-colors truncate block text-lg"
                            >
                              {title}
                            </Link>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                              {companyName && (
                                <span className="flex items-center gap-1">
                                  {logoUrl && <img src={logoUrl} alt="" className="w-4 h-4 rounded object-contain" />}
                                  {companyName}
                                </span>
                              )}
                              {location && (
                                <span className="flex items-center gap-1">
                                  <i className="fas fa-location-dot text-xs text-gray-300" /> {location}
                                </span>
                              )}
                              {workingTime && (
                                <span className="flex items-center gap-1">
                                  <i className="fas fa-clock text-xs text-gray-300" /> {workingTime}
                                </span>
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
                          <div className="mt-4 bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cover Letter</p>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{app.coverLetter}</p>
                          </div>
                        )}

                        {app.resume?.secure_url && (
                          <a
                            href={getFileProxyUrl(app.resume.secure_url)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                          >
                            <i className="fas fa-file-pdf text-xs" /> View Resume
                          </a>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-xs text-gray-400">
                          {app.createdAt && (
                            <span>
                              Applied {new Date(app.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric',
                              })}
                            </span>
                          )}
                          {app.updatedAt && app.updatedAt !== app.createdAt && (
                            <span>
                              Updated {new Date(app.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'long', day: 'numeric',
                              })}
                            </span>
                          )}
                          {app.reviewedBy && (
                            <span className="flex items-center gap-1">
                              <i className="fas fa-check-circle text-xs" /> Reviewed
                            </span>
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

        {/* Saved internships */}
        {savedInternships.length > 0 && (
          <section className="mb-10">
            <div className="mb-5 flex items-center justify-between">
              <div><h2 className="text-xl font-extrabold text-gray-900">Saved Internships</h2><p className="text-sm text-gray-400">Roles you&apos;ve bookmarked for later.</p></div>
              <Link href="/internships" className="text-sm font-semibold text-primary hover:underline">Browse All</Link>
            </div>
            {loadingSaved ? (
              <div className="flex justify-center py-10"><Spinner /></div>
            ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {savedInternships.map((intern) => {
                const cid = getCompanyIdFromInternship(intern);
                const companyObj = typeof intern.companyId === 'object' ? (intern.companyId as any) : null;
                const companyName = companyObj?.name || '';
                const logoUrl = companyObj ? getImgUrl(companyObj.logo) : null;
                return (
                <Link key={intern._id} href={`/internships/${intern._id}`}>
                  <div className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md transition cursor-pointer h-full flex flex-col">
                    <div className="flex items-center gap-3">
                      {logoUrl ? (
                        <img src={logoUrl} alt="" className="w-10 h-10 rounded-xl object-contain border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {intern.title[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-900 truncate">{intern.title}</p>
                        <p className="text-xs text-gray-400 truncate">{companyName || 'Internship'}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {intern.location && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                          <i className="fas fa-map-marker-alt text-xs" />{intern.location === 'on-site' ? 'On-site' : intern.location === 'remote' ? 'Remote' : 'Hybrid'}
                        </span>
                      )}
                      {intern.workingTime && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500">
                          <i className="fas fa-clock text-xs" />{intern.workingTime}
                        </span>
                      )}
                    </div>
                    <div className="mt-auto pt-4">
                      <span className="block w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-white shadow-sm text-center hover:bg-primary-dark transition">
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

      <div className="border-t border-gray-100 bg-white mt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-4 flex justify-between items-center">
          <p className="text-sm text-gray-400">&copy; 2026 Tadrebk</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
            <i className="fas fa-sign-out-alt" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
