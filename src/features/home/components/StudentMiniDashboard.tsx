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
    <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between bg-gray-50 px-5 py-4">
        <div>
          <p className="text-sm font-bold text-gray-900">Your career starts here <i className="fas fa-rocket text-emerald-500 text-sm" /></p>
          <p className="text-xs text-gray-400">Join thousands of students landing their dream internships.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white text-xs font-bold">
          <i className="fas fa-user-graduate text-sm" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 border-b border-gray-100 px-5 py-4">
        {[
          { icon: 'fa-briefcase', label: 'Browse Internships', desc: 'Explore openings from top companies' },
          { icon: 'fa-paper-plane', label: 'Apply in Seconds', desc: 'One-click applications with your profile' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-gray-50 p-3 text-center">
            <i className={`fas ${s.icon} text-lg text-emerald-500 mb-1`} />
            <p className="text-xs font-bold text-gray-900">{s.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{s.desc}</p>
          </div>
        ))}
      </div>
      <div className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-700">Why Tadrebk?</p>
        </div>
        <div className="space-y-3">
          {[
            { icon: 'fa-check-circle', text: 'Track all your applications in one dashboard' },
            { icon: 'fa-star', text: 'Get matched with internships that fit your skills' },
            { icon: 'fa-bell', text: 'Never miss a deadline or new opportunity' },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <i className={`fas ${item.icon} text-[10px] text-emerald-500`} />
              </div>
              <p className="text-xs text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-5 pb-5 pt-1">
        <Link href="/get-started" className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25">
          <i className="fas fa-rocket text-[10px]" /> Create Your Free Account
        </Link>
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
