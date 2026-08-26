'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import { getUserImgUrl } from '@/features/student/types';
import { applicationService } from '@/features/student/services/application.service';
import { internshipService } from '@/features/internship/services/internship.service';
import type { Internship } from '@/features/internship/types';

interface RecentApp {
  _id: string;
  status: string;
  internshipId: { title?: string } | string;
  companyId: { name?: string } | string;
}

const dashboardFeatures = [
  { icon: 'fa-table-columns', title: 'Stay Organized', desc: 'All your applications and updates in one central, easy-to-use dashboard.' },
  { icon: 'fa-chart-line', title: 'Find Better Matches', desc: 'Personalised recommendations based on your student profile and skills.' },
  { icon: 'fa-bell', title: 'Never Miss a Deadline', desc: 'Get timely reminders and stay ahead of every single opportunity.' },
];

function DashboardCard({ currentUser, stats, recentApps, recommended }: {
  currentUser: any;
  stats: { total: number; interviews: number };
  recentApps: RecentApp[];
  recommended: Internship[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-gray-50 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-gray-900">Good morning, {currentUser.firstName} <i className="fas fa-hand-wave text-amber-400 text-sm" /></p>
          <p className="text-xs text-gray-400">You have {stats.total} pending update{stats.total !== 1 ? 's' : ''} today.</p>
        </div>
        {getUserImgUrl(currentUser.profilePicture) ? (
          <img src={getUserImgUrl(currentUser.profilePicture) || ''} alt="" className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
            {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 border-b border-gray-100 px-5 py-4">
        {[{ label: 'Applications Sent', value: String(stats.total).padStart(2, '0') }, { label: 'Active Interviews', value: String(stats.interviews).padStart(2, '0') }].map((s) => (
          <div key={s.label} className="rounded-xl bg-gray-50 p-3 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-700">Recent Applications</p>
          <Link href="/my-applications" className="text-xs text-emerald-500 hover:underline">View All</Link>
        </div>
        {recentApps.length > 0 ? (
          <div className="space-y-3">
            {recentApps.map((a) => {
              const title = typeof a.internshipId === 'object' && a.internshipId?.title ? a.internshipId.title : 'Internship';
              const company = typeof a.companyId === 'object' ? a.companyId?.name || 'Company' : 'Company';
              const statusColor = a.status === 'accepted' ? 'text-emerald-600 bg-emerald-50' : a.status === 'rejected' ? 'text-red-600 bg-red-50' : 'text-gray-600 bg-gray-100';
              return (
                <div key={a._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-pink-100 to-sky-100" />
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{title}</p>
                      <p className="text-[10px] text-gray-400">{company}</p>
                    </div>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusColor}`}>{a.status.charAt(0).toUpperCase() + a.status.slice(1)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-gray-400 text-center py-3">No applications yet. Start exploring!</p>
        )}
      </div>
      {recommended.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700">Recommended for you</p>
            <Link href="/internships" className="text-xs text-emerald-500 hover:underline">Browse All</Link>
          </div>
          <div className="flex gap-2">
            {recommended.map((intern, idx) => {
              const gradients = [
                'from-emerald-500 to-teal-400',
                'from-blue-500 to-indigo-400',
                'from-amber-400 to-orange-400',
              ];
              return (
                <Link key={intern._id} href={`/internships/${intern._id}`} className="group flex-1 overflow-hidden rounded-xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                  <div className={`h-9 bg-gradient-to-br ${gradients[idx % 3]} flex items-center justify-center relative overflow-hidden`}>
                    <i className="fas fa-briefcase text-white/80 text-xs" />
                    <div className="absolute -bottom-3 -right-3 w-8 h-8 bg-white/10 rounded-full blur-xl" />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] font-bold text-gray-900 leading-snug truncate group-hover:text-emerald-600 transition-colors">{intern.title}</p>
                    <p className="text-[8px] text-gray-400 mt-0.5 flex items-center gap-0.5">
                      <i className="fas fa-location-dot text-[7px]" /> {intern.location || 'Remote'}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FallbackCard() {
  return (
    <div className="w-full max-w-[760px] mx-auto overflow-hidden rounded-[28px] bg-white shadow-[0_20px_50px_-12px_rgba(16,24,17,0.15)]">
      {/* Header */}
      <div className="px-8 pt-7 pb-6 bg-gradient-to-r from-[#E9F7F1] to-[#F6FBF9] flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-[#16241D]">Welcome 👋</h1>
          <p className="text-[13.5px] text-[#6B7C74] mt-1">Sign in to see your applications and interviews here.</p>
        </div>
        <span className="shrink-0 mt-1 bg-[#16A667] text-white text-[13.5px] font-semibold px-4 py-2 rounded-full shadow-sm">
          Sign in
        </span>
      </div>

      {/* Locked stats */}
      <div className="px-8 pt-6 grid grid-cols-2 gap-4">
        <div className="relative rounded-2xl bg-[#F5F7F6] p-5 overflow-hidden" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #CBD6D1, #CBD6D1 6px, transparent 6px, transparent 12px), repeating-linear-gradient(90deg, #CBD6D1, #CBD6D1 6px, transparent 6px, transparent 12px), repeating-linear-gradient(180deg, #CBD6D1, #CBD6D1 6px, transparent 6px, transparent 12px), repeating-linear-gradient(270deg, #CBD6D1, #CBD6D1 6px, transparent 6px, transparent 12px)', backgroundSize: '2px 100%, 100% 2px, 2px 100%, 100% 2px', backgroundPosition: '0 0, 0 0, 100% 0, 0 100%', backgroundRepeat: 'no-repeat' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#9AA69E] bg-white px-2 py-0.5 rounded-full">🔒 Locked</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A667] animate-pulse" />
          </div>
          <div className="text-[26px] font-extrabold text-[#C6CFC9] tracking-wide mt-2">—</div>
          <div className="text-[13px] text-[#8B978F] mt-0.5">Applications sent</div>
        </div>
        <div className="relative rounded-2xl bg-[#F5F7F6] p-5 overflow-hidden" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #CBD6D1, #CBD6D1 6px, transparent 6px, transparent 12px), repeating-linear-gradient(90deg, #CBD6D1, #CBD6D1 6px, transparent 6px, transparent 12px), repeating-linear-gradient(180deg, #CBD6D1, #CBD6D1 6px, transparent 6px, transparent 12px), repeating-linear-gradient(270deg, #CBD6D1, #CBD6D1 6px, transparent 6px, transparent 12px)', backgroundSize: '2px 100%, 100% 2px, 2px 100%, 100% 2px', backgroundPosition: '0 0, 0 0, 100% 0, 0 100%', backgroundRepeat: 'no-repeat' }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold text-[#9AA69E] bg-white px-2 py-0.5 rounded-full">🔒 Locked</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#16A667] animate-pulse" />
          </div>
          <div className="text-[26px] font-extrabold text-[#C6CFC9] tracking-wide mt-2">—</div>
          <div className="text-[13px] text-[#8B978F] mt-0.5">Active interviews</div>
        </div>
      </div>

      {/* Empty recent applications */}
      <div className="px-8 pt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[#16241D]">Recent Applications</h2>
          <span className="text-[13px] text-[#B7C0BB] font-medium">Nothing yet</span>
        </div>
        <div className="rounded-2xl border border-[#EDF1EF] p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EFF6F3] flex items-center justify-center text-[20px] shrink-0">📄</div>
          <div className="flex-1">
            <p className="text-[13.5px] font-semibold text-[#16241D]">Every job you apply to will show up here</p>
            <p className="text-[12.5px] text-[#8B978F] mt-0.5">Sign in and apply to your first job</p>
          </div>
          <span className="shrink-0 text-[12.5px] font-semibold text-[#16A667]">Sign in now</span>
        </div>
      </div>

      {/* Recommended */}
      <div className="px-8 pt-7 pb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-bold text-[#16241D]">Recommended for you</h2>
          <span className="text-[13px] text-[#16A667] font-semibold">Browse all</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#1EC08C] to-[#0F9C6C] p-4 h-[110px] flex flex-col justify-between text-white">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-[15px]">💼</div>
            <div>
              <p className="text-[12.5px] font-bold leading-tight">UI/UX Designer</p>
              <p className="text-[10.5px] text-white/80 mt-0.5">📍 Remote</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#6C8CF5] to-[#4C6AE0] p-4 h-[110px] flex flex-col justify-between text-white">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-[15px]">💼</div>
            <div>
              <p className="text-[12.5px] font-bold leading-tight">Front-End Developer</p>
              <p className="text-[10.5px] text-white/80 mt-0.5">📍 On-site</p>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#F5A623] to-[#E08900] p-4 h-[110px] flex flex-col justify-between text-white">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-[15px]">💼</div>
            <div>
              <p className="text-[12.5px] font-bold leading-tight">Marketing Specialist</p>
              <p className="text-[10.5px] text-white/80 mt-0.5">📍 On-site</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA strip */}
      <div className="bg-[#16241D] px-8 py-4 flex items-center justify-between">
        <p className="text-[13px] text-white/80">Waiting for what? Your data will be saved once you sign up.</p>
        <span className="bg-[#16A667] text-white text-[13px] font-semibold px-5 py-2 rounded-full">
          Create account
        </span>
      </div>
    </div>
  );
}

export default function StudentMiniDashboard() {
  const currentUser = useAppSelector((s) => s.user.currentUser);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const userId = useAppSelector((s) => s.auth.userId);

  const [recentApps, setRecentApps] = useState<RecentApp[]>([]);
  const [stats, setStats] = useState({ total: 0, interviews: 0 });
  const [recommended, setRecommended] = useState<Internship[]>([]);

  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    (async () => {
      try {
        const { applications, pagination } = await applicationService.getUserApplications(userId, { limit: 3 });
        setRecentApps(applications);
        setStats({ total: pagination.total, interviews: applications.filter((a: any) => a.status === 'accepted').length });
      } catch { /* silently fail */ }
    })();
  }, [isAuthenticated, userId]);

  useEffect(() => {
    (async () => {
      try {
        const result = await internshipService.listInternships({ limit: 20 });
        const cats = currentUser?.categories;
        if (cats && cats.length > 0) {
          const matched = result.internships.filter((i) => {
            const rawTracks = i.track || i.categories;
            const tracks = (Array.isArray(rawTracks) ? rawTracks : rawTracks ? [rawTracks] : []).map((t) => t.toLowerCase());
            return cats.some((c) => tracks.includes(c.toLowerCase()));
          });
          setRecommended(matched.length >= 3 ? matched.slice(0, 3) : result.internships.slice(0, 3));
        } else {
          setRecommended(result.internships.slice(0, 3));
        }
      } catch { /* silently fail */ }
    })();
  }, [currentUser?.categories]);

  const isLoggedIn = isAuthenticated && currentUser;

  return (
    <section className="bg-gray-900 px-6 sm:px-10 py-16 relative">
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center relative z-10">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
            Manage your <span className="text-emerald-400">internship journey</span> in one place
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-400">
            Discover opportunities, track applications and never miss an important update. Join thousands of students launching their careers today.
          </p>
          <div className="mt-8 space-y-5">
            {dashboardFeatures.map((item) => (
              <div key={item.title} className="group flex items-start gap-4 rounded-xl p-3 -ml-3 hover:bg-white/5 transition-colors duration-300">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-900/60 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  <i className={`fas ${item.icon} text-sm`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex gap-3 flex-wrap">
            <Link href="/get-started" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300">
              Start Your Journey <i className="fas fa-arrow-right text-xs" />
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 transition-all duration-300 hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-white/5">
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-12 lg:mt-0">
          {isLoggedIn ? (
            <DashboardCard currentUser={currentUser} stats={stats} recentApps={recentApps} recommended={recommended} />
          ) : (
            <FallbackCard />
          )}
        </div>
      </div>
    </section>
  );
}
