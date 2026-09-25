'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Share2,
  MoreVertical,
  TrendingUp,
  Clock,
  Award,
  GraduationCap,
  MapPin,
  Mail,
  Phone,
  Building2,
  CalendarRange,
  FileCode2,
  Users2,
  Info,
  Crown,
} from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { internService } from '@/features/company/services/intern.service';
import { Intern } from '@/features/company/types/management';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const TABS = ['Performance Overview', 'Task History', 'Feedback & Reviews'];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InternProfileScreen() {
  const params = useParams();
  const router = useRouter();
  const company = useAppSelector((s) => s.company.currentCompany);
  const internId = params.internId as string;
  const [intern, setIntern] = useState<Intern | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(TABS[0]);

  useEffect(() => {
    if (!company?._id || !internId) return;
    (async () => {
      try {
        const data = await internService.getIntern(company._id, internId);
        setIntern(data);
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [company?._id, internId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar active="Interns" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title="Intern Profile" />
          <main className="flex-1 space-y-6 px-[2.5%] py-4 sm:p-6 lg:p-8 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-36 rounded-lg bg-slate-200" />
                <div className="h-7 w-24 rounded-full bg-slate-200" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-24 rounded-lg bg-slate-200" />
                <div className="h-9 w-9 rounded-lg bg-slate-200" />
                <div className="h-9 w-32 rounded-lg bg-slate-200" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                  <div className="mx-auto h-24 w-24 rounded-full bg-slate-200" />
                  <div className="mx-auto mt-4 h-4 w-32 rounded-full bg-slate-200" />
                  <div className="mx-auto mt-2 h-3 w-24 rounded-full bg-slate-200" />
                  <div className="mx-auto mt-4 h-6 w-20 rounded-full bg-slate-200" />
                  <div className="mt-6 grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-4">
                    <div className="space-y-2">
                      <div className="mx-auto h-3 w-16 rounded-full bg-slate-200" />
                      <div className="mx-auto h-4 w-10 rounded-full bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <div className="mx-auto h-3 w-16 rounded-full bg-slate-200" />
                      <div className="mx-auto h-4 w-14 rounded-full bg-slate-200" />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="h-4 w-40 rounded-full bg-slate-200" />
                  <div className="mt-5 space-y-4">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded bg-slate-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-20 rounded-full bg-slate-200" />
                          <div className="h-3.5 w-full max-w-[180px] rounded-full bg-slate-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="h-4 w-44 rounded-full bg-slate-200" />
                  <div className="mt-4 space-y-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="h-12 rounded-xl bg-slate-100" />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-900 p-6">
                  <div className="h-4 w-36 rounded-full bg-slate-700" />
                  <div className="mt-4 h-3 w-full rounded-full bg-slate-700" />
                  <div className="mt-2 h-3 w-3/4 rounded-full bg-slate-700" />
                </div>
              </div>

              <div className="space-y-6 lg:col-span-2">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="h-8 w-8 rounded-lg bg-slate-200" />
                      <div className="mt-3 h-6 w-16 rounded-full bg-slate-200" />
                      <div className="mt-2 h-3 w-24 rounded-full bg-slate-200" />
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex gap-6 border-b border-slate-100">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-4 w-24 rounded-full bg-slate-200 pb-3" />
                    ))}
                  </div>
                  <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-4">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div className="h-40 rounded-xl bg-slate-100" />
                    </div>
                    <div className="space-y-4">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div className="h-40 rounded-xl bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar active="Interns" />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar title="Intern Profile" />
          <div className="text-center py-20 text-sm text-slate-400">Intern not found.</div>
        </div>
      </div>
    );
  }

  const name = `${intern.firstName} ${intern.lastName}`.trim();
  const initials = (name || intern.email).split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const email = intern.email;
  const phone = intern.phoneNumber;
  // Skills come straight from the intern's profile — shown as-is, no invented scores.
  const skillLabels = (intern.skills || [])
    .slice(0, 8)
    .map((s) => (typeof s === 'string' ? s : s.name))
    .filter(Boolean);
  const avgRating =
    intern.ratingCount != null && intern.ratingCount > 0
      ? (intern.ratingSum || 0) / intern.ratingCount
      : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="Interns" />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title="Intern Profile" />

        <main className="flex-1 space-y-6 overflow-y-auto px-[2.5%] py-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/company/admin/interns" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <ArrowLeft size={15} /> Back to Interns
              </Link>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                Intern ID: {intern._id ? intern._id.slice(-6).toUpperCase() : '—'}
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">Active</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href).then(
                    () => toastHelper.success('Profile link copied'),
                    () => toastHelper.error('Could not copy link'),
                  );
                }}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                <Share2 size={15} /> Share
              </button>
              <button
                onClick={() => router.push(`/company/admin/evaluations?internId=${intern._id}`)}
                className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
              >
                Evaluate Intern
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                {intern.profilePicture?.secure_url ? (
                  <img
                    src={intern.profilePicture.secure_url}
                    alt={name}
                    className="mx-auto h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-700 text-2xl font-semibold text-white">
                    {initials || '?'}
                  </div>
                )}
                <h3 className="mt-4 break-words text-lg font-semibold text-slate-900">{name || '—'}</h3>
                <p className="break-words text-sm text-slate-400">{intern.headline || 'Intern'}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                    <Crown size={11} className="mr-1 inline" /> {intern.totalPoints} Pts
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-xs text-slate-400">TOTAL POINTS</p>
                    <p className="text-lg font-semibold text-slate-900">{intern.totalPoints}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">STATUS</p>
                    <p className="text-lg font-semibold text-slate-900">{intern.isConfirmed ? 'Active' : 'Pending'}</p>
                  </div>
                </div>
                {intern.resume?.secure_url && (
                  <a
                    href={intern.resume.secure_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <FileCode2 size={15} /> View CV
                  </a>
                )}
                {intern.ratingCount != null && intern.ratingCount > 0 && (
                  <p className="mt-3 flex items-center justify-center gap-1 text-sm text-amber-600">
                    <Award size={14} /> {((intern.ratingSum || 0) / intern.ratingCount).toFixed(1)} rating ({intern.ratingCount})
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Personal Information</h3>
                <dl className="mt-4 space-y-4 text-sm">
                  {[
                    { icon: GraduationCap, label: 'SKILLS', value: (intern.skills || []).map((s) => (typeof s === 'string' ? s : s.name)).join(', ') || '—' },
                    { icon: Mail, label: 'EMAIL ADDRESS', value: email },
                    { icon: Phone, label: 'PHONE NUMBER', value: phone || '—' },
                    { icon: MapPin, label: 'LOCATION', value: intern.address || '—' },
                    { icon: Building2, label: 'HEADLINE', value: intern.headline || '—' },
                    { icon: Users2, label: 'GENDER', value: intern.gender || '—' },
                    { icon: CalendarRange, label: 'DATE OF BIRTH', value: formatDate(intern.dateOfBirth) },
                    { icon: CalendarRange, label: 'INTERNSHIP PERIOD', value: `${formatDate(intern.internshipStartDate)} — ${formatDate(intern.internshipEndDate)}` },
                  ].map((f) => (
                    <div key={f.label} className="flex items-start gap-3">
                      <f.icon size={16} className="mt-0.5 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <dt className="text-xs text-slate-400">{f.label}</dt>
                        <dd className="break-words font-medium text-slate-900">{f.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-2xl bg-slate-900 p-6 text-white">
                <h3 className="font-semibold">Supervisor Notes</h3>
                <p className="mt-3 break-words rounded-lg bg-white/5 p-3 text-sm italic text-slate-300">
                  {intern.bio || 'No supervisor notes yet for this intern.'}
                </p>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Performance Score</p>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600"><TrendingUp size={15} /></span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {avgRating != null ? `${avgRating.toFixed(1)}/5` : '—'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {avgRating != null ? `From ${intern.ratingCount} rating${intern.ratingCount === 1 ? '' : 's'}` : 'No ratings yet'}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Status</p>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><Clock size={15} /></span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{intern.isConfirmed ? 'Active' : 'Pending'}</p>
                  <p className="text-xs text-slate-400">Enrolled {formatDate(intern.enrolledAt)}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-start justify-between">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Points Earned</p>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Award size={15} /></span>
                  </div>
                  <p className="mt-2 text-2xl font-bold text-slate-900">{intern.totalPoints}</p>
                  <p className="text-xs text-slate-400">Total points</p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex gap-6 overflow-x-auto border-b border-slate-100 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`whitespace-nowrap pb-3 font-medium transition-colors ${
                        activeTab === tab
                          ? 'text-emerald-600 shadow-[inset_0_-2px_0_0_#10b981]'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {activeTab === 'Performance Overview' ? (
                  <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">Skills</h4>
                        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
                          {skillLabels.length} listed
                        </span>
                      </div>
                      {skillLabels.length === 0 ? (
                        <p className="mt-4 text-sm text-slate-400">No skills listed on this profile.</p>
                      ) : (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {skillLabels.map((label) => (
                            <span key={label} className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <p>
                          <span className="font-semibold">Insight:</span>{' '}
                          {avgRating != null
                            ? `Rated ${avgRating.toFixed(1)}/5 across ${intern.ratingCount} review${intern.ratingCount === 1 ? '' : 's'} with ${intern.totalPoints ?? 0} points earned.`
                            : `No reviews yet · ${intern.totalPoints ?? 0} points earned so far.`}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-slate-400">
                    {activeTab} content goes here.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">Education</h3>
                  <div className="mt-4 space-y-3">
                    {!intern.education || intern.education.length === 0 ? (
                      <p className="text-sm text-slate-400">No education listed.</p>
                    ) : (
                      intern.education.map((e, i) => (
                        <div key={i} className="rounded-xl border border-slate-100 p-3">
                          <p className="break-words text-sm font-medium text-slate-900">
                            {[e.degree, e.field].filter(Boolean).join(' · ') || 'Education'}
                          </p>
                          {e.institution && <p className="break-words text-xs text-slate-500">{e.institution}</p>}
                          {(e.grade || e.startDate) && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {[e.grade, [formatDate(e.startDate), formatDate(e.endDate)].filter((d) => d !== '—').join(' — ')].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">Experience</h3>
                  <div className="mt-4 space-y-3">
                    {!intern.experience || intern.experience.length === 0 ? (
                      <p className="text-sm text-slate-400">No experience listed.</p>
                    ) : (
                      intern.experience.map((e, i) => (
                        <div key={i} className="rounded-xl border border-slate-100 p-3">
                          <p className="break-words text-sm font-medium text-slate-900">
                            {[e.internshipTitle, e.companyName].filter(Boolean).join(' @ ') || 'Experience'}
                          </p>
                          {e.completedAt && <p className="text-xs text-slate-400">Completed {formatDate(e.completedAt)}</p>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Courses & Certificates</h3>
                <div className="mt-4 space-y-2">
                  {!intern.courses || intern.courses.length === 0 ? (
                    <p className="text-sm text-slate-400">No courses listed.</p>
                  ) : (
                    intern.courses.map((c, i) => (
                      <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 p-3">
                        <p className="min-w-0 flex-1 break-words text-sm font-medium text-slate-900">{c.name || 'Course'}</p>
                        {c.certificate?.secure_url && (
                          <a href={c.certificate.secure_url} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-medium text-emerald-600 hover:underline">
                            Certificate
                          </a>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}