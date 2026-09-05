'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/features/internship/services/internship.service';
import { applicationService, Application } from '@/features/student/services/application.service';
import { Internship } from '@/features/internship/types';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

export default function ComposeEmailScreen() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const internId = params.internId as string;
  const company = useAppSelector((s) => s.company.currentCompany);

  const target = searchParams.get('target'); // 'all' or applicationId
  const isAll = target === 'all';

  const [internship, setInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const fetchAll = useCallback(async () => {
    if (!company || !internId) return;
    try {
      const [internData, appData] = await Promise.all([
        internshipService.getInternshipById(internId),
        applicationService.getCompanyApplications(company._id, internId, { limit: 200 }),
      ]);
      setInternship(internData);
      setApplications(appData.applications);
    } catch {
      toastHelper.error('Failed to load data');
      router.push('/company/admin');
    } finally {
      setLoading(false);
    }
  }, [company, internId, router]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const acceptedApps = useMemo(
    () => applications.filter((a) => a.status === 'accepted'),
    [applications],
  );

  const singleApp = useMemo(
    () => (target && !isAll ? applications.find((a) => a._id === target) : null),
    [applications, target, isAll],
  );

  const companyName = company?.name || 'Company';
  const studentName = isAll ? 'Student' : (singleApp?.studentId ? `${singleApp.studentId.firstName} ${singleApp.studentId.lastName}` : 'Student');
  const internshipTitle = internship?.title || 'Internship';
  const preKnowledge = internship?.preKnowledge || [];

  const handleSend = useCallback(async () => {
    if (!company) return;
    setSending(true);
    try {
      const msg = message.trim() || undefined;
      if (isAll) {
        let sent = 0;
        let failed = 0;
        for (const app of acceptedApps) {
          try {
            await applicationService.sendAcceptanceEmail(company._id, internId, app._id, msg);
            sent++;
          } catch {
            failed++;
          }
        }
        if (sent > 0) toastHelper.success(`${sent} acceptance email${sent > 1 ? 's' : ''} sent!`);
        if (failed > 0) toastHelper.error(`${failed} email${failed > 1 ? 's' : ''} failed`);
      } else if (target) {
        await applicationService.sendAcceptanceEmail(company._id, internId, target, msg);
        toastHelper.success('Acceptance email sent!');
      }
      router.push(`/company/internships/${internId}/applications`);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  }, [company, internId, message, isAll, acceptedApps, target, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          href={`/company/internships/${internId}/applications`}
          className="text-sm text-emerald-600 hover:underline font-semibold flex items-center gap-1 mb-6"
        >
          <i className="fas fa-arrow-left text-xs" /> Back to applications
        </Link>

        <h1 className="text-2xl font-black text-gray-900 mb-1">Compose Email</h1>
        <p className="text-sm text-gray-500 mb-8">
          {isAll
            ? `Sending to all ${acceptedApps.length} accepted applicant${acceptedApps.length !== 1 ? 's' : ''}`
            : `Sending to ${studentName}`}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Editor */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <i className="fas fa-pen-to-square text-emerald-600 text-sm" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Your Message</h2>
                <p className="text-xs text-gray-400">This will appear in the email body</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Recipient
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <i className="fas fa-user text-gray-400 text-xs" />
                  <span className="text-sm text-gray-700 font-medium">{studentName}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Internship
                </label>
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <i className="fas fa-briefcase text-gray-400 text-xs" />
                  <span className="text-sm text-gray-700 font-medium">{internshipTitle}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Message <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  placeholder="e.g. Welcome to the team! We're excited to have you on board. Your start date will be..."
                  className="w-full border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40 focus:border-emerald-400 resize-none"
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  {message.length > 0 ? `${message.length} characters` : 'Leave empty for default template only'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                onClick={handleSend}
                loading={sending}
                className="flex-1 !bg-gradient-to-r !from-emerald-500 !to-emerald-600 !shadow-lg !shadow-emerald-200 !font-bold !rounded-xl !py-3"
              >
                <i className="fas fa-paper-plane mr-2" /> Send Email
              </Button>
              <Link href={`/company/internships/${internId}/applications`}>
                <Button variant="outline" className="!rounded-xl !py-3">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Live Preview */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <i className="fas fa-eye text-blue-600 text-sm" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Email Preview</h2>
                <p className="text-xs text-gray-400">Live preview of the email template</p>
              </div>
            </div>

            {/* Email template preview */}
            <div className="rounded-3xl overflow-hidden shadow-[0_20px_50px_-12px_rgba(16,24,17,0.15)] border border-gray-200">
              {/* Template header */}
              <div className="bg-[#22c55e] px-8 py-6 text-center">
                <h1 className="text-white text-2xl font-extrabold tracking-wide">Tadreebak</h1>
              </div>

              {/* Template body */}
              <div className="bg-white px-8 py-8">
                <h2 className="text-[#16a34a] text-xl font-extrabold mb-4">
                  Congratulations, {studentName}! ðŸŽ‰
                </h2>

                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  We are thrilled to inform you that your application for the{' '}
                  <strong className="text-gray-900 font-bold">{internshipTitle}</strong> internship at{' '}
                  <strong className="text-gray-900 font-bold">{companyName}</strong> has been{' '}
                  <strong className="text-gray-900 font-bold">accepted</strong>.
                </p>

                {/* Message box */}
                {message.trim() && (
                  <div className="bg-[#f0fdf4] border-l-4 border-[#22c55e] rounded-lg px-5 py-4 my-5">
                    <p className="text-[#16a34a] text-xs font-bold mb-2">
                      A message from {companyName}:
                    </p>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{message.trim()}</p>
                  </div>
                )}

                {preKnowledge.length > 0 && (
                  <>
                    <p className="text-gray-700 text-sm leading-relaxed mb-3">
                      To help you prepare, here is some pre-knowledge that will be useful for this internship:
                    </p>
                    <div className="bg-gray-50 rounded-lg px-5 py-4 my-4">
                      <ul className="space-y-1">
                        {preKnowledge.map((item, i) => (
                          <li key={i} className="text-[#16a34a] text-sm leading-relaxed flex items-start gap-2">
                            <span className="text-[#22c55e] font-bold mt-0.5">â€¢</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                <p className="text-gray-500 text-sm leading-relaxed mt-4">
                  Get ready to learn, grow, and make the most of this opportunity.
                </p>

                <div className="mt-5 text-gray-700 text-sm leading-relaxed">
                  Best regards,<br />
                  <strong className="font-bold">Tadreebak Team</strong>
                </div>
              </div>

              {/* Template footer */}
              <div className="bg-gray-100 px-8 py-4 text-center">
                <p className="text-gray-400 text-xs">Â© 2026 Tadreebak. All rights reserved.</p>
                <p className="text-gray-400 text-xs mt-1">
                  <span className="text-[#22c55e]">Unsubscribe</span> Â· <span className="text-[#22c55e]">Privacy Policy</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
