'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, Eye, FileText, Loader2, Mail, XCircle } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import InternAvatar from '@/components/ui/InternAvatar';
import { applicationService, Application } from '@/features/student/services/application.service';
import { internshipService } from '@/features/internship/services/internship.service';
import { Internship } from '@/features/internship/types';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const STATUS_META: Record<Application['status'], { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-600' },
  accepted: { label: 'Accepted', className: 'bg-emerald-50 text-emerald-600' },
  rejected: { label: 'Rejected', className: 'bg-rose-50 text-rose-500' },
};

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ApplicationDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const internshipId = params.internshipId as string;
  const applicationId = params.applicationId as string;
  const companyId = useAppSelector((s) => s.company.currentCompany?._id);

  const [app, setApp] = useState<Application | null>(null);
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!companyId || !internshipId || !applicationId) return;
    setLoading(true);
    try {
      const [internData, appData] = await Promise.all([
        internshipService.getInternshipById(internshipId).catch(() => null),
        applicationService.getCompanyApplications(companyId, internshipId, { limit: 200 }),
      ]);
      setInternship(internData);
      setApp(appData.applications.find((a) => a._id === applicationId) ?? null);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [companyId, internshipId, applicationId]);

  useEffect(() => {
    const t = setTimeout(fetchAll, 0);
    return () => clearTimeout(t);
  }, [fetchAll]);

  const handleReview = async (status: 'accepted' | 'rejected') => {
    if (!companyId || !app) return;
    setReviewing(true);
    try {
      const updated = await applicationService.reviewApplication(companyId, internshipId, app._id, { status });
      setApp((prev) => (prev ? { ...prev, ...updated } : prev));
      toastHelper.success(status === 'accepted' ? 'Application accepted' : 'Application rejected');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setReviewing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!companyId || !app) return;
    setSendingEmail(true);
    try {
      await applicationService.sendAcceptanceEmail(companyId, internshipId, app._id);
      toastHelper.success('Acceptance email sent');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSendingEmail(false);
    }
  };

  const student = app?.studentId as unknown as {
    _id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    bio?: string;
    headline?: string;
    skills?: string[];
    profilePicture?: { secure_url?: string };
    education?: { institution?: string; degree?: string; field?: string; grade?: string; startDate?: string; endDate?: string }[];
    experience?: { internshipTitle?: string; companyName?: string; completedAt?: string }[];
  } | undefined;
  const studentName = student
    ? `${student.firstName ?? ''} ${student.lastName ?? ''}`.trim() || student.email || 'Student'
    : 'Student';
  const meta = app ? STATUS_META[app.status] : STATUS_META.pending;
  const cv = app?.resume?.secure_url;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Interns" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Application Details" />

        <main className="animate-fade-in mx-auto w-full max-w-4xl flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft size={15} /> Back
            </button>
            {app && !loading && (
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
            </div>
          ) : !app ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Application not found.
            </p>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <InternAvatar
                      src={student?.profilePicture?.secure_url}
                      firstName={student?.firstName}
                      lastName={student?.lastName}
                      email={student?.email}
                      className="h-14 w-14 text-base"
                    />
                    <div className="min-w-0">
                      <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">{studentName}</h2>
                      <p className="break-all text-sm text-slate-400">{student?.email || ''}</p>
                      {internship && (
                        <p className="mt-1 truncate text-xs text-slate-400">
                          Applied for <span className="font-medium text-slate-600">{internship.title}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  {app.status === 'pending' && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleReview('accepted')}
                        disabled={reviewing}
                        className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
                      >
                        {reviewing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle2 size={13} className="inline" />} Accept
                      </button>
                      <button
                        onClick={() => handleReview('rejected')}
                        disabled={reviewing}
                        className="rounded-lg border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 disabled:opacity-60"
                      >
                        <XCircle size={13} className="inline" /> Reject
                      </button>
                    </div>
                  )}
                  {app.status === 'accepted' && (
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {sendingEmail ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />}
                      Send Acceptance Email
                    </button>
                  )}
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Submitted</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{formatDate(app.createdAt)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Phone</p>
                    <p className="mt-1 break-words text-sm font-medium text-slate-800">{student?.phoneNumber || '—'}</p>
                  </div>
                  {student?.headline && (
                    <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Headline</p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-800">{student.headline}</p>
                    </div>
                  )}
                </div>

                {student?.bio && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Bio</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{student.bio}</p>
                  </div>
                )}

                {Array.isArray(student?.skills) && student.skills.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Skills</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {student.skills.map((sk) => (
                        <span key={sk} className="break-words rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(student?.education?.length || student?.experience?.length) ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                  <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                    <Eye size={18} className="text-emerald-500" /> Background
                  </h3>
                  {(student.education || []).map((e, i) => (
                    <p key={i} className="mt-2 break-words text-sm text-slate-700">
                      {[e.degree, e.field].filter(Boolean).join(' · ') || 'Education'}
                      {e.institution ? ` — ${e.institution}` : ''}
                      {e.grade ? ` (${e.grade})` : ''}
                    </p>
                  ))}
                  {(student.experience || []).map((e, i) => (
                    <p key={`x${i}`} className="mt-2 break-words text-sm text-slate-700">
                      {[e.internshipTitle, e.companyName].filter(Boolean).join(' @ ') || 'Experience'}
                    </p>
                  ))}
                </div>
              ) : null}

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900">
                  <FileText size={18} className="text-emerald-500" /> Application
                </h3>
                {app.coverLetter ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Cover letter</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">{app.coverLetter}</p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">No cover letter provided.</p>
                )}
                {Array.isArray(app.answers) && app.answers.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Answers</p>
                    {app.answers.map((a, i) => (
                      <p key={i} className="whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-2.5 text-sm text-slate-700">
                        {a.type === 'mcq' ? a.selectedOption : a.text}
                      </p>
                    ))}
                  </div>
                )}
                {cv && (
                  <a href={cv} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    <FileText size={13} /> View CV
                  </a>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
