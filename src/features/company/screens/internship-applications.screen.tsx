'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/services/internship.service';
import { applicationService, Application } from '@/services/application.service';
import { Internship } from '@/features/internship/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getErrorMessage } from '@/lib/axios';
import { getFileProxyUrl } from '@/lib/file-proxy';
import { toast } from 'react-toastify';
import Link from 'next/link';

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

export default function InternshipApplicationsScreen() {
  const params = useParams();
  const router = useRouter();
  const internId = params.internId as string;
  const company = useAppSelector((s) => s.company.currentCompany);

  const [internship, setInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [emailConfirmTarget, setEmailConfirmTarget] = useState<string | null>(null);

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
      setApplications((prev) => prev.map((a) => (a._id === applicationId ? { ...a, ...updated, studentId: a.studentId, internshipId: a.internshipId, companyId: a.companyId } : a)));
      toast.success(`Application ${status === 'accepted' ? 'approved' : 'rejected'}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setReviewingId(null);
    }
  }

  async function handleSendAcceptanceEmail(applicationId: string) {
    if (!company) return;
    setSendingEmailId(applicationId);
    setEmailConfirmTarget(null);
    try {
      await applicationService.sendAcceptanceEmail(company._id, internId, applicationId);
      toast.success('Acceptance email sent!');
    } catch (err) {
      toast.error(getErrorMessage(err));
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
    if (sent > 0) toast.success(`${sent} acceptance email${sent > 1 ? 's' : ''} sent!`);
    if (failed > 0) toast.error(`${failed} email${failed > 1 ? 's' : ''} failed`);
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
              {filter === 'all' ? 'No one has applied yet.' : `No ${filter} applications.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((app) => {
              const s = app.studentId;
              const profilePic = s?.profilePicture?.secure_url;
              const studentId = s?._id;
              return (
              <div key={app._id} className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <Link
                    href={`/company/applicants/${studentId || '#'}`}
                    className="shrink-0"
                  >
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt={`${s.firstName} ${s.lastName}`}
                        className="w-14 h-14 rounded-full object-cover border-2 border-gray-100"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {s ? `${s.firstName[0]}${s.lastName[0]}`.toUpperCase() : '?'}
                      </div>
                    )}
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
                          <Button
                            variant="outline"
                            size="sm"
                            loading={sendingEmailId === app._id}
                            onClick={() => setEmailConfirmTarget(app._id)}
                            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            <i className="fas fa-envelope text-xs mr-1" /> Send Email
                          </Button>
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
                        <a
                          href={getFileProxyUrl(app.resume.secure_url) ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 hover:bg-red-100 transition-colors"
                        >
                          <i className="fas fa-file-pdf text-red-500" />
                          <span className="text-sm font-semibold text-gray-900">Application CV</span>
                          <i className="fas fa-external-link-alt text-xs text-red-400 ml-auto" />
                        </a>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEmailConfirmTarget(null)} />
          <div className="relative bg-white rounded-[2rem] p-10 shadow-2xl max-w-sm w-full mx-4 text-center animate-fade-in-up">
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
    </div>
  );
}
