'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  Sunrise,
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

const SKILLS = [
  { label: 'Frontend Architecture', pct: 85 },
  { label: 'Node.js Backend', pct: 92 },
  { label: 'UI/UX Design Systems', pct: 78 },
  { label: 'Problem Solving', pct: 95 },
  { label: 'Teamwork & Communication', pct: 88 },
];

const BADGES = [
  { icon: Sunrise, label: 'Early Bird', color: 'bg-blue-50 text-blue-500' },
  { icon: FileCode2, label: 'Code Master', color: 'bg-emerald-50 text-emerald-600' },
  { icon: TrendingUp, label: 'Top Contributor', color: 'bg-amber-50 text-amber-600' },
  { icon: Users2, label: 'Team Player', color: 'bg-indigo-50 text-indigo-600' },
];

const REQUIREMENTS = [
  { title: 'Final Internship Report', due: 'Sept 25, 2024', status: 'Pending', color: 'bg-slate-100 text-slate-500' },
  { title: 'Peer Review Submission', due: 'Sept 20, 2024', status: 'Action Required', color: 'bg-rose-50 text-rose-500' },
];

const TABS = ['Performance Overview', 'Task History', 'Feedback & Reviews'];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'â€”';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InternProfileScreen() {
  const params = useParams();
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
      <div className="flex bg-slate-50">
        <Sidebar active="Interns" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar title="Intern Profile" />
          <main className="flex-1 space-y-6 p-4 sm:p-6 lg:p-8 animate-pulse">
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
      <div className="flex bg-slate-50">
        <Sidebar active="Interns" />
        <div className="flex flex-1 flex-col overflow-hidden">
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
  const skillList = intern.skills && intern.skills.length > 0
    ? intern.skills.slice(0, 5).map((s) => ({ label: s, pct: 70 + (Math.abs(s.length * 7) % 26) }))
    : SKILLS;

  return (
    <div className="flex bg-slate-50">
      <Sidebar active="Interns" />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title="Intern Profile" />

        <main className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/company/admin/interns" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <ArrowLeft size={15} /> Back to Interns
              </Link>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                Intern ID: {intern._id.slice(-6).toUpperCase()}
              </span>
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">Active</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                <Share2 size={15} /> Share
              </button>
              <button className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50">
                <MoreVertical size={16} />
              </button>
              <button className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600">
                Evaluate Intern
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-blue-700 text-2xl font-semibold text-white">
                  {initials || '?'}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">{name || 'â€”'}</h3>
                <p className="text-sm text-slate-400">{intern.headline || 'Intern'}</p>
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
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900">Personal Information</h3>
                <dl className="mt-4 space-y-4 text-sm">
                  {[
                    { icon: GraduationCap, label: 'SKILLS', value: (intern.skills || []).join(', ') || 'â€”' },
                    { icon: Mail, label: 'EMAIL ADDRESS', value: email },
                    { icon: Phone, label: 'PHONE NUMBER', value: phone || 'â€”' },
                    { icon: MapPin, label: 'LOCATION', value: 'â€”' },
                    { icon: Building2, label: 'HEADLINE', value: intern.headline || 'â€”' },
                    { icon: CalendarRange, label: 'INTERNSHIP PERIOD', value: `${formatDate(intern.internshipStartDate)} â€” ${formatDate(intern.internshipEndDate)}` },
                  ].map((f) => (
                    <div key={f.label} className="flex items-start gap-3">
                      <f.icon size={16} className="mt-0.5 text-slate-400" />
                      <div className="min-w-0">
                        <dt className="text-xs text-slate-400">{f.label}</dt>
                        <dd className="font-medium text-slate-900 break-words">{f.value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="rounded-2xl bg-slate-900 p-6 text-white">
                <h3 className="font-semibold">Supervisor Notes</h3>
                <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm italic text-slate-300">
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
                  <p className="mt-2 text-2xl font-bold text-slate-900">{intern.totalPoints}</p>
                  <p className="text-xs text-emerald-600">Points earned</p>
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
                <div className="flex gap-6 overflow-x-auto border-b border-slate-100 text-sm">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`-mb-px border-b-2 pb-3 font-medium transition-colors ${
                        activeTab === tab
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-slate-400 hover:text-slate-600'
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
                        <h4 className="font-medium text-slate-900">Skill Distribution</h4>
                        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">Real</span>
                      </div>
                      <div className="mt-4 space-y-3">
                        {skillList.map((s) => (
                          <div key={s.label}>
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-600">{s.label}</span>
                              <span className="font-medium text-slate-900">{s.pct}%</span>
                            </div>
                            <div className="mt-1 h-1.5 rounded-full bg-slate-100">
                              <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${s.pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700">
                        <Info size={14} className="mt-0.5 shrink-0" />
                        <p><span className="font-semibold">Insight:</span> Fast-moving intern with growing points across completed tasks.</p>
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
                  <h3 className="font-semibold text-slate-900">Badges & Achievements</h3>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {BADGES.map((b) => (
                      <div key={b.label} className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 py-4 text-center">
                        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${b.color}`}>
                          <b.icon size={18} />
                        </span>
                        <span className="text-xs font-medium text-slate-600">{b.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold text-slate-900">Upcoming Requirements</h3>
                  <div className="mt-4 space-y-3">
                    {REQUIREMENTS.map((r) => (
                      <div key={r.title} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{r.title}</p>
                          <p className="text-xs text-slate-400">Due: {r.due}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.color}`}>{r.status}</span>
                      </div>
                    ))}
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