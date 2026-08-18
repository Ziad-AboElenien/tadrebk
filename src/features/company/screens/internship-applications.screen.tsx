'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService, Application } from '@/features/student/services/application.service';
import type { RatingData } from '@/features/student/services/application.service';
import { userService } from '@/features/student/services/user.service';
import type { User } from '@/features/student/types';
import { getUserImgUrl } from '@/features/student/types';
import MediaImage from '@/components/ui/MediaImage';
import { Internship } from '@/features/internship/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getErrorMessage } from '@/lib/axios';
import { openFileProxy } from '@/lib/file-proxy';
import { toastHelper } from '@/lib/toast';
import Link from 'next/link';

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

const OTHER_VALUE = '__other__';

function collectInstitutions(user: Pick<User, 'education'> | null | undefined): string[] {
  if (!user?.education?.length) return [];
  return [
    ...new Set(
      user.education
        .map((e) => e.institution?.trim())
        .filter((x): x is string => Boolean(x)),
    ),
  ];
}

export default function InternshipApplicationsScreen() {
  const params = useParams();
  const router = useRouter();
  const internId = params.internId as string;
  const company = useAppSelector((s) => s.company.currentCompany);

  const [internship, setInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [studentUniversities, setStudentUniversities] = useState<Record<string, string[]>>({});
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [universityOpen, setUniversityOpen] = useState(false);
  const [showOtherUniversity, setShowOtherUniversity] = useState(false);
  const universityRef = useRef<HTMLDivElement>(null);
  const universityFetchedRef = useRef(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [emailConfirmTarget, setEmailConfirmTarget] = useState<string | null>(null);
  const [ratingModal, setRatingModal] = useState<{ applicationId: string; studentName: string } | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratings, setRatings] = useState<Record<string, RatingData | null>>({});

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
      toastHelper.error('Failed to load applications');
      router.push('/company/dashboard');
    } finally {
      setLoading(false);
    }
  }, [company, internId, router]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // Gather university names from the applicants' own data (exact same names),
  // fetching full profiles only when the applications response doesn't include education.
  useEffect(() => {
    if (applications.length === 0 || universityFetchedRef.current) return;
    const students = applications.map((a) => a.studentId).filter(Boolean);
    let cancelled = false;
    (async () => {
      const byId: Record<string, string[]> = {};
      const missingIds: string[] = [];
      students.forEach((s) => {
        if (s.education?.length) byId[s._id] = collectInstitutions(s);
        else missingIds.push(s._id);
      });
      if (missingIds.length > 0) {
        setLoadingUniversities(true);
        const results = await Promise.allSettled(missingIds.map((id) => userService.getUserProfile(id)));
        if (cancelled) return;
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') byId[missingIds[i]] = collectInstitutions(r.value);
        });
        setLoadingUniversities(false);
      }
      universityFetchedRef.current = true;
      setStudentUniversities(byId);
    })();
    return () => { cancelled = true; };
  }, [applications]);

  // Close university dropdown on outside click / Escape
  useEffect(() => {
    if (!universityOpen) return;
    function handle(e: MouseEvent) {
      if (universityRef.current && !universityRef.current.contains(e.target as Node)) setUniversityOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setUniversityOpen(false);
    }
    document.addEventListener('mousedown', handle);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handle);
      document.removeEventListener('keydown', handleKey);
    };
  }, [universityOpen]);

  const universities = useMemo(() => {
    const set = new Set<string>();
    Object.values(studentUniversities).forEach((insts) => insts.forEach((i) => set.add(i)));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [studentUniversities]);

  useEffect(() => {
    if (applications.length === 0) return;
    const completed = applications.filter((a) => a.completed && a.status === 'accepted');
    completed.forEach(async (app) => {
      try {
        const res = await applicationService.getRatings(app._id);
        setRatings((prev) => ({ ...prev, [app._id]: res.companyRating }));
      } catch {
        setRatings((prev) => ({ ...prev, [app._id]: null }));
      }
    });
  }, [applications]);

  async function submitRating() {
    if (!ratingModal) return;
    setSubmittingRating(true);
    try {
      await applicationService.rateApplication(ratingModal.applicationId, {
        score: ratingScore,
        comment: ratingComment || undefined,
      });
      setRatings((prev) => ({ ...prev, [ratingModal.applicationId]: { submitted: true, score: ratingScore, comment: ratingComment } }));
      setRatingModal(null);
      setRatingScore(5);
      setRatingComment('');
      toastHelper.success('Rating submitted!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSubmittingRating(false);
    }
  }

  async function handleReview(applicationId: string, status: 'accepted' | 'rejected') {
    if (!company) return;
    setReviewingId(applicationId);
    try {
      const updated = await applicationService.reviewApplication(company._id, internId, applicationId, { status });
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? { ...a, ...updated, studentId: a.studentId, internshipId: a.internshipId, companyId: a.companyId } : a)));
      toastHelper.success(`Application ${status === 'accepted' ? 'approved' : 'rejected'}`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setReviewingId(null);
    }
  }

  async function handleComplete(applicationId: string) {
    if (!company) return;
    try {
      await applicationService.completeApplication(company._id, internId, applicationId);
      setApplications((prev) =>
        prev.map((a) => (a._id === applicationId ? { ...a, completed: true } : a)),
      );
      toastHelper.success('Application marked as completed');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    }
  }

  async function handleSendAcceptanceEmail(applicationId: string) {
    if (!company) return;
    setSendingEmailId(applicationId);
    setEmailConfirmTarget(null);
    try {
      await applicationService.sendAcceptanceEmail(company._id, internId, applicationId);
      toastHelper.success('Acceptance email sent!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSendingEmailId(null);
    }
  }

  async function handleSendAllEmails() {
    if (!company) return;
    setEmailConfirmTarget(null);
    const accepted = applications.filter((a) => a.status === 'accepted');
    setSendingAll(true);
    let sent = 0;
    let failed = 0;
    for (const app of accepted) {
      try {
        await applicationService.sendAcceptanceEmail(company._id, internId, app._id);
        sent++;
      } catch {
        failed++;
      }
    }
    setSendingAll(false);
    if (sent > 0) toastHelper.success(`${sent} acceptance email${sent > 1 ? 's' : ''} sent!`);
    if (failed > 0) toastHelper.error(`${failed} email${failed > 1 ? 's' : ''} failed`);
  }

  const filtered = applications.filter((a) => {
    const statusOk = filter === 'all' || a.status === filter;
    if (!statusOk) return false;
    if (!selectedUniversity) return true;
    const insts = studentUniversities[a.studentId?._id ?? ''] ?? [];
    return insts.some((i) => i.toLowerCase() === selectedUniversity.toLowerCase());
  });

  function pickUniversity(value: string) {
    if (value === OTHER_VALUE) {
      setSelectedUniversity('');
      setShowOtherUniversity(true);
      setUniversityOpen(false);
      return;
    }
    setShowOtherUniversity(false);
    setSelectedUniversity(value);
    setUniversityOpen(false);
  }

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
        {internship?.preKnowledge && internship.preKnowledge.length > 0 && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <h3 className="text-sm font-bold text-amber-900 mb-1">Pre-knowledge to Start</h3>
            <ul className="list-disc list-inside text-sm text-amber-800">
              {internship.preKnowledge.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
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

      {/* University filter */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
            <i className="fas fa-graduation-cap text-primary" /> University:
          </label>
          <div ref={universityRef} className="relative">
            <button
              type="button"
              onClick={() => setUniversityOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 border-gray-200 min-w-[210px]"
            >
              <span className={selectedUniversity ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                {selectedUniversity || 'All universities'}
              </span>
              {loadingUniversities && (
                <span className="ml-auto w-4 h-4 rounded-full border-2 border-gray-200 border-t-primary animate-spin" />
              )}
              <i className={`fas fa-chevron-down text-xs text-gray-400 ml-auto transition-transform ${universityOpen ? 'rotate-180' : ''}`} />
            </button>

            {universityOpen && (
              <div className="absolute z-50 mt-1 w-full min-w-[240px] bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 py-1 max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => pickUniversity('')}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between text-gray-600 hover:bg-gray-50"
                >
                  All universities
                  {selectedUniversity === '' && !showOtherUniversity && <i className="fas fa-check text-emerald-500 text-xs" />}
                </button>
                {universities.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => pickUniversity(u)}
                    className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between text-gray-600 hover:bg-gray-50"
                  >
                    {u}
                    {selectedUniversity === u && <i className="fas fa-check text-emerald-500 text-xs" />}
                  </button>
                ))}
                {universities.length === 0 && !loadingUniversities && (
                  <div className="px-4 py-3 text-sm text-gray-400">No universities found</div>
                )}
                <button
                  type="button"
                  onClick={() => pickUniversity(OTHER_VALUE)}
                  className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 text-primary hover:bg-emerald-50 border-t border-gray-50"
                >
                  <i className="fas fa-plus text-xs" /> Other
                </button>
              </div>
            )}
          </div>

          {selectedUniversity && (
            <button
              type="button"
              onClick={() => { setSelectedUniversity(''); setShowOtherUniversity(false); }}
              className="text-xs font-semibold text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
            >
              <i className="fas fa-times" /> Clear
            </button>
          )}
        </div>

        {showOtherUniversity && (
          <div className="mt-3 max-w-sm">
            <input
              type="text"
              autoFocus
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              placeholder="Type a university name..."
              className="w-full border border-gray-200 rounded-xl bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
            />
          </div>
        )}
      </div>

      {/* Send all button */}
      {filter === 'accepted' && statusCounts.accepted > 0 && (
        <div className="mb-6 flex justify-end">
          <Button
            variant="primary"
            loading={sendingAll}
            onClick={() => setEmailConfirmTarget('all')}
          >
            <i className="fas fa-envelope text-xs mr-1" /> Send Email to All ({statusCounts.accepted})
          </Button>
        </div>
      )}

      {/* Applications list */}
      <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <i className="fas fa-user-plus text-3xl mb-3 block" />
            <p className="font-semibold">No applications</p>
            <p className="text-sm mt-1">
              {selectedUniversity
                ? `No applicants from ${selectedUniversity}.`
                : filter === 'all'
                  ? 'No one has applied yet.'
                  : `No ${filter} applications.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((app) => {
              const s = app.studentId;
              const profilePic = getUserImgUrl(s?.profilePicture);
              const studentId = s?._id;
              return (
              <div key={app._id} className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <Link
                    href={`/company/applicants/${studentId || '#'}`}
                    className="shrink-0"
                  >
                    <MediaImage
                      src={profilePic}
                      alt={`${s.firstName} ${s.lastName}`}
                      boxClassName="w-14 h-14 rounded-full border-2 border-gray-100 overflow-hidden"
                      imgClassName="w-full h-full object-cover"
                      iconClassName="fas fa-user text-xl text-gray-400"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          href={`/company/applicants/${studentId || '#'}`}
                          className="font-semibold text-dark hover:text-primary transition-colors truncate block text-lg"
                        >
                          {s ? `${s.firstName} ${s.lastName}` : 'Unknown User'}
                        </Link>
                        <p className="text-sm text-gray-500">{s?.email || ''}</p>
                        {(studentUniversities[s?._id ?? ''] ?? []).length > 0 && (
                          <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1.5">
                            <i className="fas fa-graduation-cap text-xs text-primary/60" />
                            {(studentUniversities[s?._id ?? ''] ?? []).join(' · ')}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
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

                        {app.status === 'accepted' && (
                          <>
                            {!app.completed ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleComplete(app._id)}
                                className="border-amber-200 text-amber-600 hover:bg-amber-50"
                              >
                                <i className="fas fa-check-circle text-xs mr-1" /> Complete
                              </Button>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 border border-emerald-200">
                                <i className="fas fa-check-circle text-xs" /> Completed
                              </span>
                            )}
                            {ratings[app._id] == null && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const stuName = s ? `${s.firstName} ${s.lastName}` : 'Student';
                                  setRatingModal({ applicationId: app._id, studentName: stuName });
                                }}
                                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              >
                                <i className="fas fa-star text-xs mr-1" /> Rate Student
                              </Button>
                            )}
                            {ratings[app._id] != null && (
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }, (_, s) => (
                                  <i key={s} className={`fas fa-star text-xs ${s < (ratings[app._id]?.score || 0) ? 'text-amber-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              loading={sendingEmailId === app._id}
                              onClick={() => setEmailConfirmTarget(app._id)}
                              className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            >
                              <i className="fas fa-envelope text-xs mr-1" /> Send Email
                            </Button>
                          </>
                        )}

                        <Link href={`/company/applicants/${studentId || '#'}`}>
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-external-link-alt text-xs" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {app.resume?.secure_url && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => openFileProxy(app.resume?.secure_url)}
                          className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 hover:bg-red-100 transition-colors w-full"
                        >
                          <i className="fas fa-file-pdf text-red-500" />
                          <span className="text-sm font-semibold text-gray-900">Application CV</span>
                          <i className="fas fa-external-link-alt text-xs text-red-400 ml-auto" />
                        </button>
                      </div>
                    )}

                    {app.answers && app.answers.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Answers</p>
                        {app.answers.map((a, ai) => (
                          <div key={ai} className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 font-medium mb-1">Q{ai + 1}</p>
                            <p className="text-sm text-gray-700">
                              {a.type === 'mcq' ? a.selectedOption : a.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {app.coverLetter && (
                      <div className="mt-3 bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cover Letter</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {app.coverLetter}
                        </p>
                      </div>
                    )}

                    {app.createdAt && (
                      <p className="text-xs text-gray-400 mt-3">
                        Applied {new Date(app.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Email confirmation modal */}
      {emailConfirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEmailConfirmTarget(null)} />
          <div className="relative bg-white rounded-[2rem] p-6 sm:p-10 shadow-2xl max-w-sm w-full text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-dark mb-2">Send acceptance email?</h2>
            <p className="text-sm text-gray-500 mb-8">
              {emailConfirmTarget === 'all'
                ? `This will send acceptance emails to all ${applications.filter((a) => a.status === 'accepted').length} accepted applicants.`
                : 'An acceptance email will be sent to this applicant.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => emailConfirmTarget === 'all' ? handleSendAllEmails() : handleSendAcceptanceEmail(emailConfirmTarget as string)}
                className="!bg-gradient-to-r !from-emerald-500 !to-emerald-600 !shadow-lg !shadow-emerald-200 !font-bold"
              >
                <i className="fas fa-envelope mr-2" /> Send
              </Button>
              <Button variant="outline" onClick={() => setEmailConfirmTarget(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModal && (
        <>
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm" onClick={() => setRatingModal(null)} />
          <div className="fixed inset-0 z-[101] flex items-center justify-center overflow-y-auto p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-dark mb-1">Rate {ratingModal.studentName}</h3>
              <p className="text-sm text-gray-400 mb-5">How was this student's performance?</p>

              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingScore(star)}
                    className="text-2xl transition-transform hover:scale-110"
                  >
                    <i className={`fas fa-star ${star <= ratingScore ? 'text-amber-400' : 'text-gray-200'}`} />
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">{ratingScore}/5</span>
              </div>

              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={3}
                placeholder="Leave a comment (optional)..."
                className="w-full border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none mb-5"
              />

              <div className="flex gap-3">
                <button
                  onClick={submitRating}
                  disabled={submittingRating}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition disabled:opacity-50"
                >
                  {submittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
                <button
                  onClick={() => setRatingModal(null)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
