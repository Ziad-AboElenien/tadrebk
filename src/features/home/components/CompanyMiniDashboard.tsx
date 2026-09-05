'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import { getCompanyImgUrl } from '@/features/company/types';
import { internshipService } from '@/features/internship/services/internship.service';
import type { Internship } from '@/features/internship/types';

const companyFeatures = [
  { icon: 'fa-rocket', title: 'Post in Minutes', desc: 'Create and publish internship listings quickly and easily.' },
  { icon: 'fa-users', title: 'Access Top Talent', desc: 'Reach thousands of qualified students and recent graduates.' },
  { icon: 'fa-chart-line', title: 'Track Applicants', desc: 'Review applications, track status, and hire the best fit.' },
];

function CompanyCard({ currentCompany, stats, internships }: {
  currentCompany: any;
  stats: { posted: number; active: number };
  internships: Internship[];
}) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/50">
        <div className="flex items-center gap-3">
          {getCompanyImgUrl(currentCompany.logo) ? (
            <img src={getCompanyImgUrl(currentCompany.logo) || ''} alt="" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 text-white text-sm font-bold shadow-sm">{currentCompany.name?.[0]}</div>
          )}
          <div>
            <p className="text-sm font-bold text-gray-900">{currentCompany.name}</p>
            <p className="text-[11px] text-gray-400">{currentCompany.industry || 'Your company'}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-px bg-white/30">
        {[{ label: 'Posted', value: String(stats.posted).padStart(2, '0'), icon: 'fa-layer-group' }, { label: 'Active', value: String(stats.active).padStart(2, '0'), icon: 'fa-circle-check' }].map((s) => (
          <div key={s.label} className="bg-white/50 backdrop-blur-sm px-4 py-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <i className={`fas ${s.icon} text-[10px] text-emerald-500`} />
              <p className="text-xl font-black text-gray-900">{s.value}</p>
            </div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Internships */}
      <div className="px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-700">Recent Internships</p>
          <Link href="/company/admin" className="text-[10px] font-semibold text-emerald-500 hover:text-emerald-600 hover:underline transition-colors">View All</Link>
        </div>
        {internships.length > 0 ? (
          <div className="space-y-2.5">
            {internships.map((intern) => {
              const rawCats = intern.track || intern.categories;
              const cats = (Array.isArray(rawCats) ? rawCats : rawCats ? [rawCats] : []).slice(0, 2);
              const desc = intern.description?.slice(0, 80);
              return (
                <Link key={intern._id} href={`/company/internships/${intern._id}/applications`} className="block rounded-xl bg-white/60 backdrop-blur-sm border border-white/50 p-3 hover:bg-white/90 hover:shadow-sm transition-all duration-200 group">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">{intern.title}</p>
                        <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-bold ${intern.closed ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>{intern.closed ? 'Closed' : 'Active'}</span>
                      </div>
                      {desc && <p className="text-[10px] text-gray-400 mt-1 leading-relaxed line-clamp-2">{desc}...</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                          <i className="fas fa-location-dot text-[7px]" /> {intern.location || 'Remote'}
                        </span>
                        {intern.workingTime && (
                          <span className="flex items-center gap-0.5 text-[9px] text-gray-400">
                            <i className="fas fa-clock text-[7px]" /> {intern.workingTime}
                          </span>
                        )}
                      </div>
                      {cats.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {cats.map((c) => (
                            <span key={c} className="px-1.5 py-0.5 rounded text-[8px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100/50">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-gray-400 text-center py-3">No internships posted yet.</p>
        )}
      </div>

      {/* Post Internship CTA */}
      <div className="px-5 pb-5 pt-1">
        <Link href="/company/post-internship" className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/25">
          <i className="fas fa-plus text-[10px]" /> Post an Internship
        </Link>
      </div>
    </div>
  );
}

function CompanyFallbackCard() {
  return (
    <div className="rounded-3xl bg-white shadow-2xl p-8 relative overflow-hidden group cursor-default">
      <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900/60 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
        <i className="fas fa-building text-lg" />
      </div>
      <h3 className="text-2xl font-black text-gray-900">For Companies</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-500">
        Post internships, attract top talent, and manage your hiring pipeline â€” all in one platform.
      </p>
      <div className="mt-5 space-y-3">
        {companyFeatures.map((f) => (
          <div key={f.title} className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
              <i className={`fas ${f.icon} text-[10px]`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{f.title}</p>
              <p className="text-[10px] text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <Link href="/get-started" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.03]">
        Start Your Journey <i className="fas fa-arrow-right text-xs" />
      </Link>
    </div>
  );
}

export default function CompanyMiniDashboard() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const role = useAppSelector((s) => s.auth.role);
  const currentCompany = useAppSelector((s) => s.company?.currentCompany);

  const [internships, setInternships] = useState<Internship[]>([]);
  const [stats, setStats] = useState({ posted: 0, active: 0 });

  useEffect(() => {
    if (!isAuthenticated || role !== 'company' || !currentCompany?._id) return;
    (async () => {
      try {
        const { internships: list, pagination } = await internshipService.listInternships({
          companyId: currentCompany._id,
          limit: 3,
        });
        setInternships(list);
        setStats({ posted: pagination.total, active: list.filter((i) => !i.closed).length });
      } catch {
        // silently fail
      }
    })();
  }, [isAuthenticated, role, currentCompany?._id]);

  const isCompany = isAuthenticated && role === 'company' && currentCompany;

  return (
    <section className="bg-gray-900 px-6 sm:px-10 py-16 relative">
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center relative z-10">
        <div>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight text-white">
            Post, manage, and <span className="text-emerald-400">hire smarter</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-400">
            Find the right interns for your team, manage applications seamlessly, and build your future workforce â€” all from one dashboard.
          </p>
          <div className="mt-8 space-y-5">
            {companyFeatures.map((item) => (
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
            <Link href="/company/post-internship" className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/30 transition-all duration-300">
              Post an Internship <i className="fas fa-arrow-right text-xs" />
            </Link>
            <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-6 py-3 text-sm font-semibold text-gray-300 transition-all duration-300 hover:border-emerald-500/50 hover:text-emerald-300 hover:bg-white/5">
              Learn More
            </Link>
          </div>
        </div>

        <div className="mt-12 lg:mt-0">
          {isCompany ? (
            <CompanyCard currentCompany={currentCompany} stats={stats} internships={internships} />
          ) : (
            <CompanyFallbackCard />
          )}
        </div>
      </div>
    </section>
  );
}
