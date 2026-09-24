'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Award,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Download,
  FileText,
  Flag,
  GraduationCap,
  Link2,
  MapPin,
  MessageSquare,
  Send,
  Share2,
} from 'lucide-react';
import { CATEGORY_LABELS, getUserImgUrl, skillName, type User } from '@/features/student/types';
import { openFileProxy } from '@/lib/file-proxy';
import api, { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import ReportModal from '@/components/ui/ReportModal';
import { getProfileMeta } from '@/features/profiles/services/profile-meta.store';
import {
  Pill,
  ProfileEmptyState,
  RatingStars,
  SectionCard,
  formatDate,
  formatMonthYear,
} from '@/features/profiles/components/ProfilePrimitives';

export interface ApplicationContext {
  internshipTitle: string;
  status: string;
}

interface StudentProfileViewerProps {
  user: User;
  /** Shown when the candidate reached this profile from an application. */
  application?: ApplicationContext | null;
  backHref?: string;
  backLabel?: string;
  onBack?: () => void;
  /** Called when "Invite to internship" is pressed. Falls back to a toast when omitted. */
  onInvite?: () => void;
  inviteLabel?: string;
}

/**
 * How a company sees a student's profile (admin shell).
 * No edit controls, no completeness meter, private fields never render.
 */
export default function StudentProfileViewer({
  user,
  application = null,
  backHref,
  backLabel = 'Back to candidates',
  onBack,
  onInvite,
  inviteLabel,
}: StudentProfileViewerProps) {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const [saved, setSaved] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const avatarUrl = getUserImgUrl(user.profilePicture);
  const coverUrl = getUserImgUrl(user.coverPicture);
  const resumeUrl = getUserImgUrl(user.resume);
  const rated = (user.experience || []).filter((x) => typeof x.rating === 'number' && (x.rating as number) > 0);
  const avgRating = rated.length ? (rated.reduce((a, x) => a + (x.rating as number), 0) / rated.length).toFixed(1) : null;
  // Backend links win; fall back to pre-migration locally stored links.
  const socials = user.socials?.length ? user.socials : getProfileMeta(user._id).socials;

  async function handleShare() {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: fullName, url });
      } else {
        await navigator.clipboard.writeText(url);
        toastHelper.success('Profile link copied');
      }
    } catch {
      // user dismissed the share sheet — nothing to do
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-[2.5%] py-4 sm:p-6 lg:p-8">
      {onBack || backHref ? (
        backHref ? (
          <a href={backHref} className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft size={15} /> {backLabel}
          </a>
        ) : (
          <button
            type="button"
            onClick={onBack}
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={15} /> {backLabel}
          </button>
        )
      ) : null}

      {/* ---------- cover + identity ---------- */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="h-40 bg-gradient-to-r from-emerald-500 to-emerald-400">
          {coverUrl && <img src={coverUrl} alt="" className="h-full w-full object-cover" />}
        </div>

        <div className="px-5 pb-6 sm:px-6">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-4 border-white bg-slate-200 text-3xl font-bold text-slate-400 shadow-lg">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pb-1">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share profile"
                className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
              >
                <Share2 size={16} />
              </button>
              <button
                type="button"
                onClick={() => setSaved((s) => !s)}
                className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  saved
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark size={15} className={saved ? 'fill-emerald-600' : ''} /> {saved ? 'Saved' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => toastHelper.info('Messaging is coming soon')}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <MessageSquare size={15} /> Message
              </button>
              <button
                type="button"
                onClick={() => (onInvite ? onInvite() : toastHelper.info('Invites are coming soon'))}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                <Send size={15} /> {inviteLabel || 'Invite to internship'}
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="break-words text-2xl font-bold text-slate-900">{fullName}</h1>
              {user.isConfirmed && (
                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
                  <CheckCircle2 size={12} /> Verified
                </span>
              )}
            </div>
            {user.headline && <p className="mt-0.5 break-words text-slate-600">{user.headline}</p>}
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
              <RatingStars
                ratingSum={rated.reduce((a, x) => a + (x.rating as number), 0)}
                ratingCount={rated.length}
              />
              {user.address && (
                <span className="flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPin size={14} /> {user.address}
                </span>
              )}
              <span className="text-sm text-slate-400">On Tadrebk since {formatMonthYear(user.createdAt) || '—'}</span>
            </div>
          </div>
        </div>

        {application && (
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 bg-emerald-50/60 px-5 py-3 sm:px-6">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <p className="flex-1 text-sm text-emerald-800">
              Applied to <span className="font-semibold">{application.internshipTitle}</span> · status{' '}
              <span className="font-semibold capitalize">{application.status}</span>
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        {/* ================= main column ================= */}
        <div className="min-w-0 space-y-6">
          <SectionCard title="About">
            {user.bio ? (
              <p className="break-words text-sm leading-relaxed text-slate-600">{user.bio}</p>
            ) : (
              <p className="text-sm text-slate-400">This candidate hasn&apos;t added a bio.</p>
            )}
          </SectionCard>

          <SectionCard title="Skills">
            {user.skills?.length ? (
              <div className="flex flex-wrap gap-2">
                {user.skills.map((s) => (
                  <Pill key={skillName(s)}>{skillName(s)}</Pill>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No skills listed.</p>
            )}
            {user.categories && user.categories.length > 0 && (
              <>
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Categories</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.categories.map((c) => (
                    <Pill key={c} tone="slate">
                      {CATEGORY_LABELS[c] || c}
                    </Pill>
                  ))}
                </div>
              </>
            )}
          </SectionCard>

          <SectionCard title="Education">
            {user.education?.length ? (
              <div className="space-y-5">
                {user.education.map((e, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <GraduationCap size={20} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{e.institution}</p>
                      <p className="text-sm text-slate-600">
                        {e.degree}
                        {e.field ? ` · ${e.field}` : ''}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatMonthYear(e.startDate)} – {formatMonthYear(e.endDate)}
                        {e.grade ? ` · Grade: ${e.grade}` : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProfileEmptyState message="No education on this profile." />
            )}
          </SectionCard>

          <SectionCard title="Internship Experience" subtitle="Verified feedback from previous host companies">
            {user.experience?.length ? (
              <div className="space-y-4">
                {user.experience.map((x, i) => (
                  <div key={`${x.applicationId}-${i}`} className="rounded-xl border border-slate-100 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                          <Briefcase size={19} />
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{x.internshipTitle}</p>
                          <p className="text-sm text-slate-600">{x.companyName}</p>
                          <p className="mt-0.5 text-xs text-slate-400">Completed {formatDate(x.completedAt)}</p>
                        </div>
                      </div>
                      {!!x.rating && x.rating > 0 && (
                        <RatingStars ratingSum={x.rating} ratingCount={1} showCount={false} />
                      )}
                    </div>
                    {x.feedback && (
                      <blockquote className="mt-4 break-words rounded-xl bg-slate-50 p-4 text-sm italic text-slate-600">
                        &ldquo;{x.feedback}&rdquo;
                        <footer className="mt-2 text-xs not-italic text-slate-400">
                          {x.companyName}
                          {x.feedbackCreatedAt ? ` · ${formatDate(x.feedbackCreatedAt)}` : ''}
                        </footer>
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <ProfileEmptyState message="No completed internships on record yet." />
            )}
          </SectionCard>

          <SectionCard title="Courses & Certificates">
            {user.courses?.length ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {user.courses.map((c, i) => {
                  const certUrl =
                    c.certificate?.secure_url || c.certificate?.certificateUrl || c.attachmentUrl || c.link;
                  return (
                    <div key={c._id || i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <Award size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                        {certUrl && (
                          <button
                            type="button"
                            onClick={() => openFileProxy(certUrl)}
                            className="text-xs font-medium text-emerald-600 hover:underline"
                          >
                            View certificate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <ProfileEmptyState message="No certificates on this profile." />
            )}
          </SectionCard>
        </div>

        {/* ================= sidebar ================= */}
        <div className="space-y-6">
          <SectionCard title="At a glance">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Internships completed</dt>
                <dd className="font-semibold text-slate-900">{user.experience?.length || 0}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Avg. company rating</dt>
                <dd className="font-semibold text-slate-900">{avgRating ? `${avgRating}/5` : '—'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Skills listed</dt>
                <dd className="font-semibold text-slate-900">{user.skills?.length || 0}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">Certificates</dt>
                <dd className="font-semibold text-slate-900">{user.courses?.length || 0}</dd>
              </div>
            </dl>
          </SectionCard>

          {resumeUrl && (
            <SectionCard title="Resume">
              <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                <FileText size={20} className="shrink-0 text-rose-500" />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{fullName} — Resume.pdf</p>
              </div>
              <button
                type="button"
                onClick={() => openFileProxy(resumeUrl)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <Download size={15} /> Download resume
              </button>
            </SectionCard>
          )}

          {socials.length > 0 && (
            <SectionCard title="Social links">
              <div className="space-y-2">
                {socials.map((s, i) => (
                  <a
                    key={`${s.platform}-${s.url}-${i}`}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-3.5 py-2.5 text-sm transition hover:border-emerald-200 hover:bg-emerald-50/40"
                  >
                    <Link2 size={14} className="shrink-0 text-slate-400" />
                    <span className="w-24 shrink-0 truncate text-xs font-semibold text-slate-600">{s.platform}</span>
                    <span className="min-w-0 flex-1 truncate text-xs text-emerald-600">{s.url}</span>
                  </a>
                ))}
              </div>
            </SectionCard>
          )}

          <SectionCard title="Actions">
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => (onInvite ? onInvite() : toastHelper.info('Invites are coming soon'))}
                className="w-full rounded-lg bg-emerald-500 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
              >
                {inviteLabel || 'Invite to internship'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSaved((s) => !s);
                  toastHelper.success(saved ? 'Removed from shortlist' : 'Added to shortlist');
                }}
                className="w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {saved ? 'Shortlisted ✓' : 'Add to shortlist'}
              </button>
              <button
                type="button"
                onClick={() => setReportOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 py-2 text-sm text-slate-400 hover:text-rose-500"
              >
                <Flag size={14} /> Report profile
              </button>
              <ReportModal
                open={reportOpen}
                title={`Report ${fullName || 'this profile'}`}
                onClose={() => setReportOpen(false)}
                onConfirm={async (reason) => {
                  try {
                    await api.post('/reports', { targetType: 'user', targetId: user._id, reason });
                    toastHelper.success('Report received. Our team will review it.');
                  } catch (err) {
                    toastHelper.error(getErrorMessage(err));
                    throw err;
                  }
                }}
              />
            </div>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}
