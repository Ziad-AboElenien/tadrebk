'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/store';
import { applicationService, Application } from '@/features/student/services/application.service';
import { internshipService } from '@/features/internship/services/internship.service';
import { Internship, getInternshipTracks, getCompanyIdFromInternship } from '@/features/internship/types';
import { getCompanyImgUrl, CloudinaryResource } from '@/features/company/types';
import { CATEGORY_LABELS } from '@/features/student/types';
import MediaImage from '@/components/ui/MediaImage';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const statusMeta: Record<string, { label: string; dot: string; badge: 'success' | 'danger' | 'warning'; icon: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-500', badge: 'warning', icon: 'fa-clock' },
  accepted: { label: 'Accepted', dot: 'bg-emerald-500', badge: 'success', icon: 'fa-circle-check' },
  rejected: { label: 'Rejected', dot: 'bg-red-500', badge: 'danger', icon: 'fa-circle-xmark' },
};

const locationLabels: Record<string, string> = { 'on-site': 'On-site', remote: 'Remote', hybrid: 'Hybrid' };

const locationIcon: Record<string, string> = {
  'on-site': 'fas fa-map-marker-alt',
  remote: 'fas fa-globe',
  hybrid: 'fas fa-code-branch',
};

function appInternshipId(app: Application): string | null {
  if (typeof app.internshipId === 'string') return app.internshipId;
  if (app.internshipId && typeof app.internshipId === 'object') return app.internshipId._id;
  return null;
}

function appInternshipTitle(app: Application): string {
  if (typeof app.internshipId === 'object' && app.internshipId?.title) return app.internshipId.title;
  return 'Internship';
}

function appCompanyName(app: Application): string | null {
  const c = app.companyId as { name?: string } | string | null;
  if (c && typeof c === 'object' && c.name) return c.name;
  return null;
}

function companyFromInternship(internship: Internship): { _id: string; name: string; logo?: string | CloudinaryResource } | null {
  if (internship.company) return internship.company;
  if (internship.companyId && typeof internship.companyId === 'object') return internship.companyId;
  return null;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

/* ───────────────────────── STUDENT VIEW ───────────────────────── */

type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

function StudentActivity() {
  const user = useAppSelector((s) => s.user.currentUser);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const fetchApplications = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await applicationService.getUserApplications(user._id, { limit: 100 });
      setApplications(res.applications);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const filtered =
    filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    accepted: applications.filter((a) => a.status === 'accepted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-dark">Your Activity</h1>
        <p className="text-sm text-gray-500 mt-1">Every application you sent — what you applied for and how it went.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {(['all', 'pending', 'accepted', 'rejected'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              filter === key
                ? key === 'accepted'
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
                  : key === 'rejected'
                  ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-200'
                  : key === 'pending'
                  ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200'
                  : 'bg-[#1a2e35] border-[#1a2e35] text-white shadow-md'
                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-800'
            }`}
          >
            <span className="capitalize">{key === 'all' ? 'All' : key}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : applications.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <i className="fas fa-chart-line text-3xl text-gray-300" />
          </div>
          <p className="font-bold text-gray-600">No activity yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            {filter === 'all' ? 'Start applying and your whole journey will show up here.' : `No ${filter} applications.`}
          </p>
          <Link href="/internships" className="inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition">
            Browse Internships
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
          <p className="font-bold text-gray-500">No {filter} applications</p>
          <p className="text-sm text-gray-400 mt-1">Try another filter.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-emerald-100 via-gray-100 to-transparent" />

          <div className="space-y-5">
            {filtered.map((app) => {
              const meta = statusMeta[app.status] || statusMeta.pending;
              const internId = appInternshipId(app);
              const intern = app.internshipId as { title?: string; location?: string; workingTime?: string } | string | null;
              const companyName = appCompanyName(app);
              return (
                <div key={app._id} className="relative pl-12">
                  {/* Status dot */}
                  <span className={`absolute left-[7px] top-7 w-[18px] h-[18px] rounded-full ${meta.dot} ring-4 ring-white shadow`} />

                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold rounded-full px-2.5 py-1 ${
                            app.status === 'accepted' ? 'bg-emerald-50 text-emerald-600'
                            : app.status === 'rejected' ? 'bg-red-50 text-red-500'
                            : 'bg-amber-50 text-amber-600'
                          }`}>
                            <i className={`fas ${meta.icon} text-[10px]`} />
                            {meta.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(app.createdAt)}
                          </span>
                        </div>
                        <Link
                          href={internId ? `/internships/${internId}` : '#'}
                          className="block font-bold text-dark text-lg hover:text-primary transition-colors mt-2 truncate"
                        >
                          {appInternshipTitle(app)}
                        </Link>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-gray-400">
                          {companyName && <span className="flex items-center gap-1.5"><i className="fas fa-building text-[10px]" />{companyName}</span>}
                          {intern && typeof intern === 'object' && intern.location && (
                            <span className="flex items-center gap-1.5">
                              <i className={`${locationIcon[intern.location] || 'fas fa-map-marker-alt'} text-[10px]`} />
                              {locationLabels[intern.location] || intern.location}
                            </span>
                          )}
                          {intern && typeof intern === 'object' && intern.workingTime && (
                            <span className="flex items-center gap-1.5">
                              <i className="fas fa-clock text-[10px]" />
                              {intern.workingTime === 'full-time' ? 'Full-time' : 'Part-time'}
                            </span>
                          )}
                        </div>
                      </div>
                      {internId && (
                        <Link href={`/internships/${internId}`} className="shrink-0 text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5">
                          View post <i className="fas fa-arrow-right text-[10px]" />
                        </Link>
                      )}
                    </div>

                    {app.coverLetter && (
                      <div className="mt-3 bg-gray-50 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Cover letter</p>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap line-clamp-2">{app.coverLetter}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── COMPANY VIEW ───────────────────────── */

function CompanyActivity() {
  const company = useAppSelector((s) => s.company.currentCompany);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');

  const fetchInternships = useCallback(async () => {
    if (!company?._id) return;
    setLoading(true);
    try {
      const res = await internshipService.listInternships({ companyId: company._id, limit: 100 });
      setInternships(res.internships);
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [company?._id]);

  useEffect(() => { fetchInternships(); }, [fetchInternships]);

  const filtered =
    filter === 'all' ? internships : internships.filter((i) => (filter === 'closed' ? i.closed : !i.closed));

  const logoUrl = company ? getCompanyImgUrl(company.logo) : null;
  const counts = {
    all: internships.length,
    active: internships.filter((i) => !i.closed).length,
    closed: internships.filter((i) => i.closed).length,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-dark">Your Activity</h1>
        <p className="text-sm text-gray-500 mt-1">Everything you&apos;ve posted — each internship as a post.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {(['all', 'active', 'closed'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
              filter === key
                ? key === 'closed'
                  ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-200'
                  : 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200 hover:text-gray-800'
            }`}
          >
            <span className="capitalize">{key}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${filter === key ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner /></div>
      ) : internships.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-5">
            <i className="fas fa-chart-line text-3xl text-gray-300" />
          </div>
          <p className="font-bold text-gray-600">No internships yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Post your first internship and it will show up here as a post.</p>
          <Link href="/company/post-internship" className="inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-600 transition">
            Post an Internship
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
          <p className="font-bold text-gray-500">No {filter} internships</p>
          <p className="text-sm text-gray-400 mt-1">Try another filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filtered.map((internship) => {
            const tracks = getInternshipTracks(internship);
            const skills = Array.isArray(internship.technicalSkills) ? internship.technicalSkills : [];
            const questions = Array.isArray(internship.questions) ? internship.questions : [];
            const companyInfo = companyFromInternship(internship) || company;
            const displayLogo = companyInfo?.logo ? getCompanyImgUrl(companyInfo.logo) : logoUrl;
            return (
              <article key={internship._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-shadow">
                {/* Post header */}
                <div className="p-5 sm:p-6 pb-0 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <MediaImage
                      src={displayLogo}
                      alt=""
                      boxClassName="h-12 w-12 flex-shrink-0 rounded-2xl overflow-hidden ring-2 ring-gray-50"
                      imgClassName="w-full h-full object-cover"
                      iconClassName="fas fa-building text-lg text-gray-300"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[#1a2e35] truncate">{companyInfo?.name || 'Your Company'}</p>
                      <p className="text-xs text-gray-400">
                        <i className="fas fa-clock text-[10px] mr-1" />Posted {formatDate(internship.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={internship.closed ? 'neutral' : 'success'}>
                    {internship.closed ? 'Closed' : 'Active'}
                  </Badge>
                </div>

                {/* Post body */}
                <div className="p-5 sm:p-6">
                  <Link href={`/internships/${internship._id}`} className="block group">
                    <h2 className="text-xl font-black text-[#1a2e35] group-hover:text-emerald-600 transition-colors leading-snug mb-2">
                      {internship.title}
                    </h2>
                  </Link>
                  <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                    {internship.description}
                  </p>

                  {/* Meta badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                      internship.location === 'remote' ? 'bg-violet-50 text-violet-600'
                      : internship.location === 'hybrid' ? 'bg-blue-50 text-blue-600'
                      : 'bg-amber-50 text-amber-600'
                    }`}>
                      <i className={`${locationIcon[internship.location] || 'fas fa-map-marker-alt'} text-[10px]`} />
                      {locationLabels[internship.location] || internship.location}
                    </span>
                    {internship.workingTime && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold bg-gray-100 text-gray-600">
                        <i className="fas fa-clock text-[10px]" />
                        {internship.workingTime === 'full-time' ? 'Full-time' : 'Part-time'}
                      </span>
                    )}
                    {skills.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-600">
                        <i className="fas fa-code text-[10px]" />
                        {skills.length} skill{skills.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {questions.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold bg-sky-50 text-sky-600">
                        <i className="fas fa-question text-[10px]" />
                        {questions.length} assessment {questions.length !== 1 ? 'questions' : 'question'}
                      </span>
                    )}
                  </div>

                  {/* Tracks */}
                  {tracks.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {tracks.slice(0, 4).map((track) => (
                        <span key={track} className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-100">
                          {CATEGORY_LABELS[track as keyof typeof CATEGORY_LABELS] || track}
                        </span>
                      ))}
                      {tracks.length > 4 && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-semibold text-gray-500">
                          +{tracks.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Post footer / actions */}
                <div className="px-5 sm:px-6 py-4 bg-gray-50/70 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <Link href={`/company/internships/${internship._id}/applications`} className="flex items-center gap-1.5 hover:text-emerald-600 font-semibold transition-colors">
                      <i className="fas fa-users text-[11px]" /> Applicants
                    </Link>
                    <span className="w-px h-3 bg-gray-200" />
                    <Link href={`/internships/${internship._id}`} className="flex items-center gap-1.5 hover:text-emerald-600 font-semibold transition-colors">
                      <i className="fas fa-eye text-[11px]" /> View post
                    </Link>
                  </div>
                  <Link
                    href={`/company/internships/${internship._id}/edit`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition"
                  >
                    <i className="fas fa-pen text-[10px]" /> Edit Post
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────── ROUTER ────────────────────────── */

export default function ActivityScreen() {
  const { role, isAuthenticated } = useAppSelector((s) => s.auth);

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500">Please log in to view your activity.</p>
      </div>
    );
  }

  return role === 'company' ? <CompanyActivity /> : <StudentActivity />;
}
