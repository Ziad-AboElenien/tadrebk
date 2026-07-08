'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { companyService } from '@/services/company.service';
import { getImgUrl } from '@/features/company/types';
import type { Company } from '@/features/company/types';
import Spinner from '@/components/ui/Spinner';
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
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="inline-block bg-green-50 text-green-600 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider border border-green-200 mb-4">
          Our Partners
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-[#1a2e35] tracking-tight mb-4">
          Trusted Companies
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {companies.length} organizations hiring interns through Tadrebk.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-2xl mx-auto mb-10">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
          <input
            type="text"
            placeholder="Search by name, industry, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-600 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all placeholder:text-gray-300"
          />
        </div>
        <div className="min-w-[160px]">
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
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 animate-fade-in">
          <i className="fas fa-building text-4xl mb-4 block" />
          <p className="font-semibold">{companies.length === 0 ? 'No companies yet.' : 'No companies match your search.'}</p>
          {(search || industryFilter) && (
            <button
              onClick={() => { setSearch(''); setIndustryFilter(''); }}
              className="mt-4 text-sm text-emerald-500 hover:text-emerald-600 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-400 mb-6">{filtered.length} company{filtered.length !== 1 ? 'ies' : 'y'} found</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((company) => {
              const logoUrl = getImgUrl(company.logo);
              return (
                <Link
                  key={company._id}
                  href={`/companies/${company._id}`}
                  className="group bg-white p-6 rounded-2xl border border-gray-50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {logoUrl ? (
                        <img src={logoUrl} alt={company.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-emerald-500">
                          {company.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-[#1a2e35] group-hover:text-emerald-600 transition-colors truncate">
                        {company.name}
                      </h3>
                      {company.industry && (
                        <span className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full mt-1 inline-block">
                          {company.industry}
                        </span>
                      )}
                    </div>
                  </div>
                  {(company.address || company.companyEmail) && (
                    <div className="mt-4 pt-4 border-t border-gray-50 space-y-1.5">
                      {company.address && (
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          <i className="fas fa-location-dot text-[10px]" /> {company.address}
                        </p>
                      )}
                      {company.companyEmail && (
                        <p className="text-xs text-gray-400 flex items-center gap-2">
                          <i className="fas fa-envelope text-[10px]" /> {company.companyEmail}
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
  );
}
