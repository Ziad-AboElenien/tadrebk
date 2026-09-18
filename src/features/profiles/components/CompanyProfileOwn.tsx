'use client';

import Link from 'next/link';
import {
  AlertCircle,
  Briefcase,
  Building2,
  Camera,
  CheckCircle2,
  Eye,
  Globe,
  Mail,
  MapPin,
  Pencil,
  Plus,
  TrendingUp,
  Users,
} from 'lucide-react';
import { getCompanyImgUrl, type Company } from '@/features/company/types';
import { getInternshipTracks, type Internship } from '@/features/internship/types';
import { CATEGORY_LABELS } from '@/features/student/types';
import {
  MetaRow,
  ProfileEmptyState,
  RatingStars,
  SectionCard,
  formatDate,
  formatMonthYear,
} from '@/features/profiles/components/ProfilePrimitives';

// TODO(BACKEND): replace with a real aggregate company-rating endpoint.
const SAMPLE_RATING_SUM = 170;
const SAMPLE_RATING_COUNT = 37;
const SAMPLE_HISTOGRAM = [
  { stars: 5, pct: 72 },
  { stars: 4, pct: 19 },
  { stars: 3, pct: 6 },
  { stars: 2, pct: 2 },
  { stars: 1, pct: 1 },
];

export interface PostingWithApplicants extends Internship {
  applicantsCount: number;
}

interface CompanyProfileOwnProps {
  company: Company;
  postings: PostingWithApplicants[];
  totalApplicants: number;
}

function companyCompleteness(c: Company, postings: Internship[]) {
  const checks = [
    { label: 'Upload a company logo', done: !!getCompanyImgUrl(c.logo) },
    { label: 'Add a cover image', done: !!getCompanyImgUrl(c.coverPicture) },
    { label: 'Write your About section', done: (c.description?.length || 0) > 80 },
    { label: 'Add your industry', done: !!c.industry },
    { label: 'Publish at least one internship', done: postings.some((p) => !p.closed) },
    { label: 'Get approved by admin', done: !!c.approvedByAdmin },
  ];
  const done = checks.filter((x) => x.done).length;
  return { pct: Math.round((done / checks.length) * 100), checks };
}

export default function CompanyProfileOwn({ company, postings, totalApplicants }: CompanyProfileOwnProps) {
  const { pct, checks } = companyCompleteness(company, postings);
  const pending = checks.filter((c) => !c.done);
  const logoUrl = getCompanyImgUrl(company.logo);
  const coverUrl = getCompanyImgUrl(company.coverPicture);
  const openCount = postings.filter((p) => !p.closed).length;
  const hiringTracks = [...new Set(postings.flatMap((p) => getInternshipTracks(p)))].slice(0, 12);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6 lg:p-8">
      {!company.approvedByAdmin && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <AlertCircle size={18} className="shrink-0 text-amber-600" />
          <p className="flex-1 text-sm text-amber-800">
            Your company isn&apos;t approved yet. Approved companies appear higher in student search.
          </p>
          <Link
            href="/company/settings"
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Complete profile
          </Link>
        </div>
      )}

      {/* ---------- cover + identity ---------- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="relative h-44 bg-gradient-to-r from-slate-900 to-slate-700">
          {coverUrl && <img src={coverUrl} alt="" className="h-full w-full object-cover" />}
          <Link
            href="/company/settings"
            className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur hover:bg-white"
          >
            <Camera size={14} /> Change cover
          </Link>
        </div>

        <div className="px-5 pb-6 sm:px-6">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
            <div className="relative">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={company.name}
                  className="h-28 w-28 rounded-2xl border-4 border-white bg-white object-contain shadow-lg"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-emerald-500 text-3xl font-bold text-white shadow-lg">
                  {company.name?.[0]?.toUpperCase()}
                </div>
              )}
              <Link
                href="/company/settings"
                aria-label="Change logo"
                className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-2 text-white shadow hover:bg-emerald-600"
              >
                <Camera size={13} />
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-2 pb-1 sm:gap-3">
              <Link
                href="/company/profile?preview=student"
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye size={15} /> View as student
              </Link>
              <Link
                href="/company/settings"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                <Pencil size={15} /> Edit profile
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-bold text-slate-900">{company.name}</h1>
              {company.approvedByAdmin && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 size={12} /> Verified company
                </span>
              )}
            </div>
            {company.industry && <p className="mt-0.5 break-words text-slate-600">{company.industry}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
              <RatingStars ratingSum={SAMPLE_RATING_SUM} ratingCount={SAMPLE_RATING_COUNT} />
              {company.numberOfEmployees && (
                <span className="flex items-center gap-1.5">
                  <Users size={14} /> {company.numberOfEmployees} employees
                </span>
              )}
              {company.address && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} /> {company.address}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- internal metrics strip (own side only) ---------- */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Open postings', value: String(openCount), icon: Briefcase },
          { label: 'Total applicants', value: String(totalApplicants), icon: Users },
          { label: 'Avg. intern rating', value: `${(SAMPLE_RATING_SUM / SAMPLE_RATING_COUNT).toFixed(1)}/5`, icon: TrendingUp },
          { label: 'Total postings', value: String(postings.length), icon: Building2 },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <s.icon size={18} />
            </span>
            <p className="mt-3 text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        {/* ================= main column ================= */}
        <div className="min-w-0 space-y-6">
          <SectionCard title="About the company">
            {company.description ? (
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-600">{company.description}</p>
            ) : (
              <ProfileEmptyState
                message="Tell students who you are."
                actionLabel="Write your About section"
              />
            )}
            <div className="mt-4 text-right">
              <Link href="/company/settings" className="text-xs font-semibold text-slate-400 hover:text-emerald-600">
                Edit in settings →
              </Link>
            </div>
          </SectionCard>

          {hiringTracks.length > 0 && (
            <SectionCard title="Internship tracks" subtitle="The categories students can find you under">
              <div className="flex flex-wrap gap-2">
                {hiringTracks.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
                  >
                    {CATEGORY_LABELS[t as keyof typeof CATEGORY_LABELS] || t}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard
            title="Internship postings"
            action={
              <Link
                href="/company/post-internship"
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                <Plus size={15} /> New posting
              </Link>
            }
          >
            {postings.length ? (
              <div className="divide-y divide-slate-100">
                {postings.map((p) => (
                  <div key={p._id} className="flex flex-wrap items-center gap-3 py-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Briefcase size={18} />
                    </span>
                    <div className="min-w-0 flex-1 basis-40">
                      <p className="truncate font-semibold text-slate-900">{p.title}</p>
                      <p className="truncate text-xs text-slate-400">
                        {getInternshipTracks(p)[0] || p.workingTime || p.location}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        !p.closed ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {!p.closed ? 'Open' : 'Closed'}
                    </span>
                    <span className="w-24 shrink-0 text-right text-sm text-slate-500">
                      {p.applicantsCount} applicant{p.applicantsCount !== 1 ? 's' : ''}
                    </span>
                    <Link
                      href={`/company/admin/internships/${p._id}`}
                      className="shrink-0 text-sm font-semibold text-emerald-600 hover:underline"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <ProfileEmptyState
                message="You haven't posted an internship yet."
                actionLabel="Create your first posting"
              />
            )}
          </SectionCard>

          <SectionCard
            title="What interns say"
            subtitle={`${SAMPLE_RATING_COUNT} reviews from students who completed an internship here`}
          >
            <div className="flex flex-wrap items-center gap-6 rounded-xl bg-slate-50 p-5">
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  {(SAMPLE_RATING_SUM / SAMPLE_RATING_COUNT).toFixed(1)}
                </p>
                <RatingStars ratingSum={SAMPLE_RATING_SUM} ratingCount={SAMPLE_RATING_COUNT} showCount={false} />
              </div>
              <div className="min-w-[180px] flex-1 space-y-1.5">
                {SAMPLE_HISTOGRAM.map((r) => (
                  <div key={r.stars} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-slate-400">{r.stars}</span>
                    <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                      <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span className="w-8 text-right text-slate-400">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ================= sidebar ================= */}
        <div className="space-y-6">
          <SectionCard title="Profile strength">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">{pct}% complete</span>
              <span className="font-semibold text-slate-900">
                {checks.length - pending.length}/{checks.length}
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
            </div>
            {pending.length > 0 && (
              <ul className="mt-4 space-y-2">
                {pending.map((c) => (
                  <li key={c.label} className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title="Contact & details" subtitle="Only visible to your team">
            <div className="space-y-4">
              <MetaRow icon={Mail} label="Email" value={company.companyEmail} />
              <MetaRow icon={Building2} label="Industry" value={company.industry} />
              <MetaRow icon={Users} label="Size" value={company.numberOfEmployees} />
              <MetaRow icon={MapPin} label="Address" value={company.address} />
              <MetaRow icon={Globe} label="Map" value={company.googleMapsUrl} />
            </div>
            <div className="mt-4 text-right">
              <Link href="/company/settings" className="text-xs font-semibold text-slate-400 hover:text-emerald-600">
                Edit in settings →
              </Link>
            </div>
          </SectionCard>

          <SectionCard title="Account">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Admin approval</dt>
                <dd className={`font-medium ${company.approvedByAdmin ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {company.approvedByAdmin ? 'Approved' : 'Pending'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">On Tadrebk since</dt>
                <dd className="font-medium text-slate-900">{formatMonthYear(company.createdAt) || '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Last updated</dt>
                <dd className="font-medium text-slate-900">{formatDate(company.updatedAt) || '—'}</dd>
              </div>
            </dl>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
