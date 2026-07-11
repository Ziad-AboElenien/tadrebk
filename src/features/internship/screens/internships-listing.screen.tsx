'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Internship } from '@/features/internship/types';
import type { Company } from '@/features/company/types';
import { getImgUrl } from '@/features/company/types';
import Spinner from '@/components/ui/Spinner';
import { internshipService } from '@/features/internship/services/internship.service';
import { companyService } from '@/features/company/services/company.service';
import { useAppSelector } from '@/store/store';
import { toast } from 'react-toastify';

const LS_SAVED = 'tadrebk_saved_internships';

function isSaved(id: string): boolean {
  if (typeof window === 'undefined') return false;
  try { return JSON.parse(localStorage.getItem(LS_SAVED) || '[]').includes(id); }
  catch { return false; }
}

function toggleSaved(id: string): boolean {
  try {
    const saved: string[] = JSON.parse(localStorage.getItem(LS_SAVED) || '[]');
    const idx = saved.indexOf(id);
    if (idx > -1) { saved.splice(idx, 1); localStorage.setItem(LS_SAVED, JSON.stringify(saved)); return false; }
    else { saved.push(id); localStorage.setItem(LS_SAVED, JSON.stringify(saved)); return true; }
  } catch { return false; }
}

const locationLabels: Record<string, string> = { 'on-site': 'On-site', remote: 'Remote', hybrid: 'Hybrid' };

export default function InternshipsListingScreen() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
      <InternshipsContent />
    </Suspense>
  );
}

function InternshipsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = useAppSelector((s) => s.auth.role);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const canApply = role !== 'company' && role !== 'admin';
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState(searchParams.get('title') || '');
  const [locationInput, setLocationInput] = useState(searchParams.get('location') || '');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Company cache
  const [companyMap, setCompanyMap] = useState<Record<string, Company>>({});

  useEffect(() => {
    companyService.listCompanies({ limit: 100 })
      .then((res) => {
        const map: Record<string, Company> = {};
        res.companies.forEach((c) => { map[c._id] = c; });
        setCompanyMap(map);
      })
      .catch(() => {});
  }, []);

  // Fetch real category counts
  const CATEGORIES = ['Software', 'Design', 'Marketing', 'Finance', 'Data', 'HR'];
  useEffect(() => {
    Promise.all(
      CATEGORIES.map((cat) =>
        internshipService.listInternships({ title: cat, limit: 1 }).catch(() => null)
      )
    ).then((results) => {
      const counts: Record<string, number> = {};
      results.forEach((res, i) => {
        if (res) counts[CATEGORIES[i]] = res.pagination.total;
      });
      setCategoryCounts(counts);
    });
  }, []);

  const [cityFilter, setCityFilter] = useState('');
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [filters, setFilters] = useState({
    title: searchParams.get('title') || '',
    type: (searchParams.get('type') || '') as '' | 'full-time' | 'part-time',
    location: (searchParams.get('location') || '') as string,
  });

  // Load saved state
  useEffect(() => {
    try {
      const ids: string[] = JSON.parse(localStorage.getItem(LS_SAVED) || '[]');
      setSavedIds(new Set(ids));
    } catch { /* ignore */ }
  }, []);

  const fetchInternships = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: cityFilter ? 100 : 12 };
      if (filters.title) params.title = filters.title;
      if (filters.type) params.type = filters.type;
      if (filters.location) params.location = filters.location;
      const result = await internshipService.listInternships(params);

      let filtered = result.internships;
      if (cityFilter) {
        const matchingIds = new Set(
          Object.values(companyMap)
            .filter((c) => c.address?.toLowerCase().includes(cityFilter))
            .map((c) => c._id)
        );
        if (matchingIds.size > 0) {
          filtered = result.internships.filter((internship) => {
            const cid = typeof internship.companyId === 'string'
              ? internship.companyId
              : (internship.companyId as any)?._id;
            return cid && matchingIds.has(cid);
          });
        }
        const perPage = 12;
        const totalFiltered = filtered.length;
        setTotalPages(Math.ceil(totalFiltered / perPage) || 1);
        setTotal(totalFiltered);
        const start = (page - 1) * perPage;
        filtered = filtered.slice(start, start + perPage);
      } else {
        setTotalPages(result.pagination.pages);
        setTotal(result.pagination.total);
      }

      setInternships(filtered);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load internships', { position: 'bottom-right' });
    } finally {
      setLoading(false);
    }
  }, [filters, page, cityFilter, companyMap]);

  useEffect(() => { fetchInternships(); }, [fetchInternships]);

  // Close filter drawer on Escape
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [filterOpen]);

  // Auto-search on type (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const validLocations = ['on-site', 'remote', 'hybrid'] as const;
      const loc = locationInput.toLowerCase().trim();
      const isLocationType = validLocations.includes(loc as any);
      if (loc && !isLocationType) {
        setCityFilter(loc);
        setFilters((prev) => ({ ...prev, title: query, location: '' }));
      } else {
        setCityFilter('');
        setFilters((prev) => ({ ...prev, title: query, location: isLocationType ? loc : '' }));
      }
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, locationInput]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const clearAll = useCallback(() => {
    setCityFilter('');
    setFilters({ title: '', type: '', location: '' });
    setQuery('');
    setLocationInput('');
    setPage(1);
  }, []);

  const handleSave = useCallback((id: string) => {
    const now = toggleSaved(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (now) next.add(id); else next.delete(id);
      return next;
    });
    toast.success(now ? 'Saved!' : 'Removed from saved');
  }, []);

  const hasActiveFilters = filters.title || filters.type || filters.location;

  // Collapsible filter sections
  function FilterGroup({ title, options, value, onChange }: {
    title: string;
    options: { label: string; value: string }[];
    value: string;
    onChange: (v: string) => void;
  }) {
    const [open, setOpen] = useState(true);
    return (
      <div className="border-b border-gray-100 py-4">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between text-sm font-bold text-gray-900"
        >
          {title}
          <i className={`fas fa-chevron-down h-4 w-4 text-gray-400 transition-transform ${open ? '' : '-rotate-90'}`} />
        </button>
        {open && (
          <div className="mt-3 space-y-2.5">
            {options.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={value === opt.value}
                  onChange={() => onChange(value === opt.value ? '' : opt.value)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400"
                />
                {opt.label}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  }

  function companyFromInternship(internship: Internship): Company | null {
    if (internship.company) return internship.company as Company;
    if (typeof internship.companyId === 'object' && internship.companyId) return internship.companyId as Company;
    if (typeof internship.companyId === 'string' && companyMap[internship.companyId]) return companyMap[internship.companyId];
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Search bar ─────────────────────────────────────── */}
      <div className="border-b border-gray-100 bg-gray-100 px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <i className="fas fa-search h-4 w-4 flex-shrink-0 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by role, company, or skill..."
              className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
              style={{ outline: 'none', boxShadow: 'none' }}
            />
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm sm:w-64">
            <i className="fas fa-map-marker-alt h-4 w-4 flex-shrink-0 text-emerald-500" />
            <input
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Search by city (e.g. Cairo)"
              className="w-full bg-transparent text-sm text-gray-700 outline-none"
              style={{ outline: 'none', boxShadow: 'none' }}
            />
          </div>
          <button
            type="button"
            className="rounded-2xl bg-emerald-500 px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600"
          >
            Search
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Results header ─────────────────────────────── */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900">All Internships</h1>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-500">
              {total} results
            </span>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-grid-2 text-xs" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-list text-xs" />
              List
            </button>
          </div>
        </div>

        {/* ── Mobile filter button ────────────────────────── */}
        <div className="lg:hidden mb-4 flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-gray-700 shadow-sm border border-gray-200"
          >
            <i className="fas fa-sliders-h text-emerald-500" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                {(filters.type ? 1 : 0) + (filters.location ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
          {/* ── Sidebar filters (desktop) ──────────────────── */}
          <aside className="hidden lg:block h-fit rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-900">Filters</h2>
              {hasActiveFilters && (
                <button onClick={clearAll} className="text-sm font-semibold text-emerald-500 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <FilterGroup
              title="Working Time"
              options={[
                { label: 'Full-time', value: 'full-time' },
                { label: 'Part-time', value: 'part-time' },
              ]}
              value={filters.type}
              onChange={(v) => handleFilterChange('type', v)}
            />

            <FilterGroup
              title="Location"
              options={[
                { label: 'On-site', value: 'on-site' },
                { label: 'Remote', value: 'remote' },
                { label: 'Hybrid', value: 'hybrid' },
              ]}
              value={filters.location}
              onChange={(v) => handleFilterChange('location', v)}
            />

            {/* Fast Track CTA */}
            <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                <i className="fas fa-bolt h-4 w-4" />
                Fast Track
              </p>
              <p className="mb-3 text-xs leading-relaxed text-emerald-700/80">
                Create a student profile to get personalized recommendations and apply in one click.
              </p>
              <Link href={mounted && isAuthenticated ? '/profile' : '/signup/student'}>
                <button className="w-full rounded-xl bg-white py-2 text-sm font-bold text-emerald-600 shadow-sm transition hover:bg-emerald-50">
                  Create Profile
                </button>
              </Link>
            </div>
          </aside>

          {/* ── Cards grid ─────────────────────────────────── */}
          <div className="min-w-0">
            {loading ? (
              <div className="flex justify-center py-12"><Spinner /></div>
            ) : internships.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No internships found matching your filters</p>
              </div>
            ) : (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                <div className="grid grid-cols-1 gap-x-3 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {internships.map((internship) => {
                    const company = companyFromInternship(internship);
                    const logoUrl = company ? getImgUrl(company.logo) : null;
                    const saved = savedIds.has(internship._id);

                    return (
                      <div
                        key={internship._id}
                        className="group flex flex-col rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                      >
                        <Link href={`/internships/${internship._id}`} className="flex flex-col flex-1">
                          <div className="p-5 pb-0 flex-1">
                            {/* Logo + badges row */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-pink-200 via-yellow-100 to-sky-200 flex items-center justify-center text-gray-700 font-bold ring-2 ring-gray-50 group-hover:ring-emerald-200 transition-all">
                                {logoUrl ? (
                                  <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                                ) : company ? (
                                  company.name.substring(0, 2).toUpperCase()
                                ) : (
                                  <i className="fas fa-building text-gray-400" />
                                )}
                              </div>
                              <div className="flex gap-1.5 flex-wrap justify-end">
                                {internship.location && (
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                    internship.location === 'remote' ? 'bg-violet-50 text-violet-600' :
                                    internship.location === 'hybrid' ? 'bg-blue-50 text-blue-600' :
                                    'bg-amber-50 text-amber-600'
                                  }`}>
                                    <i className={`fas fa-${
                                      internship.location === 'remote' ? 'globe' :
                                      internship.location === 'hybrid' ? 'code-branch' : 'map-marker-alt'
                                    } text-[9px]`} />
                                    {locationLabels[internship.location] || internship.location}
                                  </span>
                                )}
                                {internship.workingTime && (
                                  <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold bg-gray-100 text-gray-600">
                                    <i className="fas fa-clock text-[9px]" />
                                    {internship.workingTime === 'full-time' ? 'Full-time' : 'Part-time'}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Company name */}
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                                {company?.name || 'Unknown Company'}
                              </span>
                              {internship.closed && (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600 leading-none">
                                  Closed
                                </span>
                              )}
                            </div>

                            {/* Title */}
                            <h3 className="text-base font-bold leading-snug text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                              {internship.title}
                            </h3>

                            {/* Details */}
                            <div className="mt-3 space-y-2 text-sm text-gray-500">
                              <p className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 shrink-0">
                                  <i className="fas fa-map-marker-alt text-[10px]" />
                                </span>
                                {company?.address || locationLabels[internship.location] || internship.location}
                              </p>
                              {internship.technicalSkills && internship.technicalSkills.length > 0 && (
                                <p className="flex items-center gap-2">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500 shrink-0">
                                    <i className="fas fa-code text-[10px]" />
                                  </span>
                                  <span className="truncate">
                                    {internship.technicalSkills.slice(0, 2).join(', ')}
                                    {internship.technicalSkills.length > 2 && ` +${internship.technicalSkills.length - 2}`}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>

                        {/* Actions */}
                        <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-100 mt-auto">
                          <Link
                            href={canApply ? `/internships/${internship._id}` : '#'}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-center transition-all ${
                              canApply
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98]'
                                : 'bg-gray-200 text-gray-400 cursor-default'
                            }`}
                          >
                            Apply Now
                          </Link>
                          <button
                            onClick={() => handleSave(internship._id)}
                            aria-label="Save internship"
                            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
                              saved
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-500'
                                : 'border-gray-100 text-gray-400 hover:border-emerald-200 hover:text-emerald-500 hover:bg-emerald-50'
                            }`}
                          >
                            <i className="fas fa-bookmark" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {internships.map((internship) => {
                      const company = companyFromInternship(internship);
                      const logoUrl = company ? getImgUrl(company.logo) : null;
                      const saved = savedIds.has(internship._id);
                      return (
                        <div
                          key={internship._id}
                          className="group flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 sm:px-6 sm:py-5 w-full max-w-full"
                        >
                          {/* Logo */}
                          <Link href={`/internships/${internship._id}`} className="shrink-0">
                            <div className="h-14 w-14 rounded-xl overflow-hidden bg-gradient-to-br from-pink-200 via-yellow-100 to-sky-200 flex items-center justify-center text-gray-700 font-bold ring-2 ring-gray-50">
                              {logoUrl ? (
                                <img src={logoUrl} alt="" className="w-full h-full object-cover" />
                              ) : company ? (
                                company.name.substring(0, 2).toUpperCase()
                              ) : (
                                <i className="fas fa-building text-gray-400" />
                              )}
                            </div>
                          </Link>

                          {/* Info */}
                          <Link href={`/internships/${internship._id}`} className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-semibold text-emerald-600">{company?.name || 'Unknown Company'}</span>
                              {internship.closed && (
                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">Closed</span>
                              )}
                            </div>
                            <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                              {internship.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <i className="fas fa-map-marker-alt text-emerald-400 text-[10px]" />
                                {company?.address || locationLabels[internship.location] || internship.location}
                              </span>
                              <span className="flex items-center gap-1">
                                <i className="fas fa-clock text-emerald-400 text-[10px]" />
                                {internship.workingTime === 'full-time' ? 'Full-time' : 'Part-time'}
                              </span>
                              {internship.technicalSkills && internship.technicalSkills.length > 0 && (
                                <span className="flex items-center gap-1 truncate">
                                  <i className="fas fa-code text-emerald-400 text-[10px]" />
                                  {internship.technicalSkills.slice(0, 2).join(', ')}
                                  {internship.technicalSkills.length > 2 && ` +${internship.technicalSkills.length - 2}`}
                                </span>
                              )}
                            </div>
                          </Link>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <Link
                              href={canApply ? `/internships/${internship._id}` : '#'}
                              className={`rounded-xl px-5 py-2.5 text-sm font-bold text-center transition-all ${
                                canApply
                                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm hover:shadow-md hover:from-emerald-600 hover:to-emerald-700 active:scale-[0.98]'
                                  : 'bg-gray-200 text-gray-400 cursor-default'
                              }`}
                            >
                              Apply Now
                            </Link>
                            <button
                              onClick={() => handleSave(internship._id)}
                              aria-label="Save internship"
                              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
                                saved
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-500'
                                  : 'border-gray-100 text-gray-400 hover:border-emerald-200 hover:text-emerald-500 hover:bg-emerald-50'
                              }`}
                            >
                              <i className="fas fa-bookmark" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <i className="fas fa-chevron-left text-xs" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          if (totalPages <= 7) return true;
                          if (p === 1 || p === totalPages) return true;
                          if (Math.abs(p - page) <= 1) return true;
                          return false;
                        })
                        .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                          if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, i) =>
                          item === '...' ? (
                            <span key={`e${i}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">...</span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => setPage(item)}
                              className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${item === page ? 'bg-emerald-500 text-white shadow-md' : 'border border-gray-200 text-gray-600 hover:border-emerald-500 hover:text-emerald-500'}`}
                            >
                              {item}
                            </button>
                          )
                        )}
                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <i className="fas fa-chevron-right text-xs" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400">
                      Page {page} of {totalPages}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Mobile filter drawer ────────────────────────── */}
        {filterOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setFilterOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl lg:hidden overflow-y-auto">
              <div className="flex items-center justify-between px-5 py-5 border-b border-gray-100">
                <h2 className="text-base font-extrabold text-gray-900">Filters</h2>
                <button onClick={() => setFilterOpen(false)} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100">
                  <i className="fas fa-xmark text-lg text-gray-500" />
                </button>
              </div>
              <div className="px-5 py-4">
                {hasActiveFilters && (
                  <button onClick={() => { clearAll(); setFilterOpen(false); }} className="mb-4 text-sm font-semibold text-emerald-500 hover:underline">
                    Clear all
                  </button>
                )}
                <FilterGroup
                  title="Working Time"
                  options={[
                    { label: 'Full-time', value: 'full-time' },
                    { label: 'Part-time', value: 'part-time' },
                  ]}
                  value={filters.type}
                  onChange={(v) => handleFilterChange('type', v)}
                />
                <FilterGroup
                  title="Location"
                  options={[
                    { label: 'On-site', value: 'on-site' },
                    { label: 'Remote', value: 'remote' },
                    { label: 'Hybrid', value: 'hybrid' },
                  ]}
                  value={filters.location}
                  onChange={(v) => handleFilterChange('location', v)}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Popular categories ──────────────────────────── */}
        <section className="mt-14">
          <h2 className="mb-5 text-xl font-extrabold text-gray-900">Popular Categories</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Software', icon: 'fa-briefcase' },
              { label: 'Design', icon: 'fa-paint-brush' },
              { label: 'Marketing', icon: 'fa-bullhorn' },
              { label: 'Finance', icon: 'fa-dollar-sign' },
              { label: 'Data', icon: 'fa-chart-bar' },
              { label: 'HR', icon: 'fa-users' },
            ].map((cat) => (
              <button key={cat.label} onClick={() => { setFilters((prev) => ({ ...prev, title: cat.label })); setPage(1); setQuery(cat.label); }}>
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-white p-5 text-center shadow-sm transition hover:shadow-md cursor-pointer">
                  <span className="text-emerald-500"><i className={`fas ${cat.icon} text-2xl`} /></span>
                  <span className="text-sm font-bold text-gray-900">{cat.label}</span>
                  <span className="text-xs text-gray-400">{categoryCounts[cat.label] ?? '-'} Roles</span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
