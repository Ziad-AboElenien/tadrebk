'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { companyService } from '@/features/company/services/company.service';
import { getCompanyImgUrl } from '@/features/company/types';
import type { Company } from '@/features/company/types';
import MediaImage from '@/components/ui/MediaImage';
import Select from '@/components/ui/Select';

export default function CompaniesListingScreen() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const result = await companyService.listCompanies({ limit: 50 });
        setCompanies(result.companies.filter((c) => c.name));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = companies;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.industry || '').toLowerCase().includes(q) ||
          (c.address || '').toLowerCase().includes(q),
      );
    }
    if (industryFilter) {
      list = list.filter((c) => c.industry === industryFilter);
    }
    return list;
  }, [companies, search, industryFilter]);

  const industries = useMemo(() => {
    const set = new Set<string>();
    companies.forEach((c) => { if (c.industry) set.add(c.industry); });
    return Array.from(set).sort();
  }, [companies]);

  return (
    <div className="min-h-screen">
      {/* ─── HERO ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#f0fdf4] via-white to-[#ecfdf5] pt-20 md:pt-24 pb-14">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[42rem] h-[42rem] bg-teal-100/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-6">
            Our Partners
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1a2e35] tracking-tight mb-5">
            Trusted Companies
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            Verified organizations hiring interns through Tadrebk.
          </p>

          {/* Stats strip */}
          <div className="inline-flex items-center gap-8 sm:gap-12 bg-white/80 backdrop-blur border border-slate-100 rounded-3xl px-8 sm:px-12 py-5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#1a2e35]">{loading ? '…' : companies.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">Companies</p>
            </div>
            <div className="w-px self-stretch bg-slate-100" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#1a2e35]">{loading ? '…' : industries.length}</p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">Industries</p>
            </div>
            <div className="w-px self-stretch bg-slate-100" />
            <div className="text-center">
              <p className="flex items-center justify-center gap-1.5 text-3xl font-bold text-emerald-600">
                <i className="fas fa-circle-check text-2xl" />
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">Verified</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* ─── FILTERS ──────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-50 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-3xl mx-auto mb-10">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
            <input
              type="text"
              placeholder="Search by name, industry, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/60 text-sm text-slate-600 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 focus:bg-white transition-all placeholder:text-slate-300"
            />
          </div>
          <div className="sm:w-52 shrink-0">
            <Select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              options={[
                { value: '', label: 'All Industries' },
                ...industries.map((ind) => ({ value: ind, label: ind })),
              ]}
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-full bg-slate-100" />
                    <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                  </div>
                </div>
                <div className="mt-5 pt-5 border-t border-gray-50 space-y-2">
                  <div className="h-3 w-2/3 rounded-full bg-slate-100" />
                  <div className="h-3 w-1/2 rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
              <i className="fas fa-building text-3xl text-emerald-300" />
            </div>
            <p className="font-bold text-[#1a2e35]">{companies.length === 0 ? 'No companies yet.' : 'No companies match your search.'}</p>
            <p className="text-sm mt-1">Try a different name, industry or location.</p>
            {(search || industryFilter) && (
              <button
                onClick={() => { setSearch(''); setIndustryFilter(''); }}
                className="mt-5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-400 mb-6 text-center">
              <span className="font-bold text-[#1a2e35]">{filtered.length}</span> compan{filtered.length !== 1 ? 'ies' : 'y'} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((company) => {
                const logoUrl = getCompanyImgUrl(company.logo);
                return (
                  <Link
                    key={company._id}
                    href={`/companies/${company._id}`}
                    className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-4">
                      <MediaImage
                        src={logoUrl}
                        alt={company.name}
                        boxClassName="w-16 h-16 rounded-2xl shrink-0 overflow-hidden ring-1 ring-slate-100"
                        imgClassName="w-full h-full object-cover"
                        iconClassName="fas fa-building text-2xl text-slate-300"
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#1a2e35] group-hover:text-emerald-600 transition-colors truncate">
                          {company.name}
                        </h3>
                        {company.industry && (
                          <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full mt-1.5 inline-block">
                            {company.industry}
                          </span>
                        )}
                      </div>
                      <span className="w-9 h-9 shrink-0 rounded-full bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <i className="fas fa-arrow-right text-xs" />
                      </span>
                    </div>
                    {(company.address || company.companyEmail) && (
                      <div className="mt-5 pt-5 border-t border-gray-50 space-y-2">
                        {company.address && (
                          <p className="text-xs text-slate-400 flex items-center gap-2 truncate">
                            <i className="fas fa-location-dot text-[10px] text-emerald-400 shrink-0" />
                            <span className="truncate">{company.address}</span>
                          </p>
                        )}
                        {company.companyEmail && (
                          <p className="text-xs text-slate-400 flex items-center gap-2 truncate">
                            <i className="fas fa-envelope text-[10px] text-emerald-400 shrink-0" />
                            <span className="truncate">{company.companyEmail}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
