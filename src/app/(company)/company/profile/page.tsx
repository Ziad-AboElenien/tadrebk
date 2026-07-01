'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/store';
import { getImgUrl } from '@/types/company';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { companyService } from '@/services/company.service';
import { internshipService } from '@/services/internship.service';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function CompanyProfilePage() {
  const c = useAppSelector((s) => s.company.currentCompany);
  const [totalInternships, setTotalInternships] = useState(0);

  useEffect(() => {
    if (c?._id) {
      internshipService.listInternships({ companyId: c._id, limit: 1 }).then((r) => {
        setTotalInternships(r.pagination.total);
      }).catch(() => {});
    }
  }, [c]);

  if (!c) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <Spinner />
      </div>
    );
  }

  const logoUrl = getImgUrl(c.logo);
  const coverUrl = getImgUrl(c.coverPicture);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 sm:px-8 py-8">
        {/* Cover */}
        <div className="relative h-48 sm:h-56 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-emerald-500/20 to-teal-500/20">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-emerald-500/10 to-teal-500/10" />
          )}
          <div className="absolute top-4 right-4">
            <Link href="/company/settings">
              <span className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all">
                <i className="fas fa-camera text-xs" /> Change cover
              </span>
            </Link>
          </div>
        </div>

        {/* Avatar + header */}
        <div className="relative px-4 sm:px-6 -mt-14 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              {logoUrl ? (
                <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl shrink-0 bg-white">
                  <img src={logoUrl} alt={c.name} className="w-full h-full object-contain p-2" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center ring-4 ring-white shadow-xl shrink-0">
                  <span className="text-4xl font-bold text-white select-none">
                    {c.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              )}
              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-dark">{c.name}</h1>
                {c.industry && (
                  <span className="inline-block mt-1 px-3 py-1 bg-emerald-50 text-primary text-sm font-semibold rounded-full border border-emerald-100">
                    {c.industry}
                  </span>
                )}
              </div>
            </div>
            <Link href="/company/settings">
              <Button variant="outline" size="sm" leftIcon={<i className="fas fa-pen text-xs" />}>
                Edit profile
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-5 mt-5 text-sm text-gray-500">
            {c.companyEmail && (
              <span className="flex items-center gap-1.5">
                <i className="fas fa-envelope text-gray-300 text-xs" /> {c.companyEmail}
              </span>
            )}
            {c.address && (
              <span className="flex items-center gap-1.5">
                <i className="fas fa-location-dot text-gray-300 text-xs" /> {c.address}
              </span>
            )}
            {c.numberOfEmployees && (
              <span className="flex items-center gap-1.5">
                <i className="fas fa-users text-gray-300 text-xs" /> {c.numberOfEmployees} employees
              </span>
            )}
            {c.createdAt && (
              <span className="flex items-center gap-1.5">
                <i className="fas fa-calendar text-gray-300 text-xs" /> Joined {formatDate(c.createdAt)}
              </span>
            )}
          </div>
        </div>

        {/* About */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-dark text-lg flex items-center gap-2">
              <i className="fas fa-building text-primary text-base" /> About
            </h2>
            <Link href="/company/settings" className="text-xs font-semibold text-primary hover:underline">Edit</Link>
          </div>
          {c.description ? (
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{c.description}</p>
          ) : (
            <p className="text-gray-400 italic">No description yet. <Link href="/company/settings" className="text-primary hover:underline">Add one</Link></p>
          )}
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-black text-dark">{totalInternships}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Active Positions</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-black text-dark">{c.numberOfEmployees || '—'}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Employees</p>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
            <p className="text-2xl font-black text-dark">{c.industry || '—'}</p>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mt-1">Industry</p>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/company/dashboard" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30">
            <i className="fas fa-chart-simple text-primary text-xl mb-2 block" />
            <p className="font-semibold text-dark">Dashboard</p>
            <p className="text-xs text-gray-500 mt-0.5">View your stats</p>
          </Link>
          <Link href="/company/post-internship" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30">
            <i className="fas fa-plus-circle text-primary text-xl mb-2 block" />
            <p className="font-semibold text-dark">Post Internship</p>
            <p className="text-xs text-gray-500 mt-0.5">Create new opportunity</p>
          </Link>
          <Link href="/company/settings" className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:border-primary/30">
            <i className="fas fa-gear text-primary text-xl mb-2 block" />
            <p className="font-semibold text-dark">Settings</p>
            <p className="text-xs text-gray-500 mt-0.5">Manage company details</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
