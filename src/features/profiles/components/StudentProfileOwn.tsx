'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Award,
  Briefcase,
  Cake,
  Camera,
  CheckCircle2,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Upload,
  User as UserIcon,
} from 'lucide-react';
import { useAppDispatch } from '@/store/store';
import { setUser } from '@/store/userSlice';
import { CATEGORY_LABELS, getUserImgUrl, skillName, type User } from '@/features/student/types';
import { userService } from '@/features/student/services/user.service';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import { openFileProxy } from '@/lib/file-proxy';
import SkillModal, { type SkillFormValue } from '@/features/profiles/components/SkillModal';
import CourseModal, { type CourseFormValue } from '@/features/profiles/components/CourseModal';
import EducationModal, { type EducationFormValue } from '@/features/profiles/components/EducationModal';
import {
  educationKey,
  setCourseMeta,
  setEducationMeta,
  setSkillMeta,
  useProfileMeta,
} from '@/features/profiles/services/profile-meta.store';
import {
  Pill,
  MetaRow,
  ProfileEmptyState,
  RatingStars,
  SectionCard,
  formatDate,
  formatMonthYear,
} from '@/features/profiles/components/ProfilePrimitives';

function profileCompleteness(u: User) {
  const checks = [
    { label: 'Add a profile picture', done: !!getUserImgUrl(u.profilePicture) },
    { label: 'Add a headline', done: !!u.headline?.trim() },
    { label: 'Write your bio', done: !!u.bio?.trim() },
    { label: 'Add at least 3 skills', done: (u.skills?.length || 0) >= 3 },
    { label: 'Add your education', done: (u.education?.length || 0) > 0 },
    { label: 'Upload your resume', done: !!getUserImgUrl(u.resume) },
    { label: 'Confirm your email', done: !!u.isConfirmed },
  ];
  const done = checks.filter((c) => c.done).length;
  return { pct: Math.round((done / checks.length) * 100), checks };
}

/** Average of verified company ratings from completed internships. */
function experienceRating(u: User): { sum: number; count: number } {
  const ratings = (u.experience || []).map((x) => x.rating).filter((r): r is number => typeof r === 'number' && r > 0);
  return { sum: ratings.reduce((a, b) => a + b, 0), count: ratings.length };
}

export default function StudentProfileOwn({ user }: { user: User }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const userId = user._id;
  const { meta, refresh: refreshMeta } = useProfileMeta(userId);
  const [skillOpen, setSkillOpen] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [eduOpen, setEduOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const { pct, checks } = profileCompleteness(user);
  const pending = checks.filter((c) => !c.done);
  const { sum, count } = experienceRating(user);
  const avatarUrl = getUserImgUrl(user.profilePicture);
  const coverUrl = getUserImgUrl(user.coverPicture);
  const resumeUrl = getUserImgUrl(user.resume);
  const goSettings = () => router.push('/settings?tab=edit-profile');

  const educationOptions = (user.education || [])
    .map((e) => [e.institution, e.field].filter(Boolean).join(' — '))
    .filter(Boolean);
  const internshipOptions = (user.experience || []).map((x) =>
    [x.internshipTitle, x.companyName].filter(Boolean).join(' @ '),
  );

  async function refreshUser() {
    const fresh = await userService.getUserProfile(userId);
    dispatch(setUser(fresh));
    return fresh;
  }

  async function handleAddSkill({ name, meta: skillMeta }: SkillFormValue) {
    setModalSaving(true);
    try {
      await userService.updateProfile(userId, {
        skills: [
          ...(user.skills || []),
          {
            name,
            source: skillMeta.source,
            sourceRef: skillMeta.ref || (skillMeta.source === 'self' ? 'Self-study' : '—'),
            description: skillMeta.description,
          },
        ],
      });
      setSkillMeta(userId, name, skillMeta);
      await refreshUser();
      refreshMeta();
      setSkillOpen(false);
      toastHelper.success('Skill added!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setModalSaving(false);
    }
  }

  async function handleAddCourse({ name, meta: courseMeta, certificate }: CourseFormValue) {
    setModalSaving(true);
    try {
      await userService.addCourse(name, certificate ?? undefined, {
        startDate: courseMeta.startDate,
        endDate: courseMeta.present ? undefined : courseMeta.endDate,
        present: courseMeta.present,
        description: courseMeta.description,
      });
      setCourseMeta(userId, name, courseMeta);
      await refreshUser();
      refreshMeta();
      setCourseOpen(false);
      toastHelper.success('Course added!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setModalSaving(false);
    }
  }

  async function handleAddEducation({ entry, description }: EducationFormValue) {
    setModalSaving(true);
    try {
      const list = [...(user.education || []), { ...entry, description }];
      await userService.updateProfile(userId, { education: list });
      const fresh = await refreshUser();
      const idx = list.length - 1;
      const saved = fresh.education?.[idx] || entry;
      setEducationMeta(userId, educationKey(idx, saved.institution), { description });
      refreshMeta();
      setEduOpen(false);
      toastHelper.success('Education added!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setModalSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-6xl flex-1 px-[2.5%] py-4 sm:px-6 sm:py-8">
        {!user.isConfirmed && (
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
            <AlertCircle size={18} className="shrink-0 text-amber-600" />
            <p className="flex-1 text-sm text-amber-800">
              Your email isn&apos;t confirmed yet. Companies can&apos;t shortlist you until it is.
            </p>
            <Link
              href="/confirm-email?resend=true"
              className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              Resend confirmation
            </Link>
          </div>
        )}

        {/* ---------- cover + identity ---------- */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="relative h-40 bg-gradient-to-r from-emerald-500 to-emerald-400 sm:h-44">
            {coverUrl && <img src={coverUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}
            <button
              type="button"
              onClick={goSettings}
              className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 backdrop-blur hover:bg-white"
            >
              <Camera size={14} /> Change cover
            </button>
          </div>

          <div className="px-5 pb-6 sm:px-6">
            <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
              <div className="relative">
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
                <button
                  type="button"
                  onClick={goSettings}
                  aria-label="Change profile picture"
                  className="absolute -bottom-1 -right-1 rounded-full bg-emerald-500 p-2 text-white shadow hover:bg-emerald-600"
                >
                  <Camera size={13} />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 pb-1 sm:gap-3">
                <Link
                  href="/profile?preview=company"
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Eye size={15} /> View as company
                </Link>
                <button
                  type="button"
                  onClick={goSettings}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
                >
                  <Pencil size={15} /> Edit profile
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="break-words text-2xl font-bold text-slate-900">{fullName}</h1>
                {user.isConfirmed && <CheckCircle2 size={18} className="text-emerald-500" />}
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-500">
                  Student
                </span>
              </div>
              {user.headline && <p className="mt-0.5 break-words text-slate-600">{user.headline}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
                <RatingStars ratingSum={sum} ratingCount={count} />
                {user.address && (
                  <span className="flex items-center gap-1.5 text-sm text-slate-400">
                    <MapPin size={14} /> {user.address}
                  </span>
                )}
                <span className="text-sm text-slate-400">Member since {formatMonthYear(user.createdAt) || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
          {/* ================= main column ================= */}
          <div className="min-w-0 space-y-6">
            <SectionCard title="About" editable onEdit={goSettings}>
              {user.bio ? (
                <p className="break-words text-sm leading-relaxed text-slate-600">{user.bio}</p>
              ) : (
                <ProfileEmptyState message="Tell companies who you are." actionLabel="Write your bio" onAction={goSettings} />
              )}
            </SectionCard>

            <SectionCard title="Skills" subtitle="What you can do" editable addLabel="Add skill" onEdit={goSettings} onAdd={() => setSkillOpen(true)}>
              {user.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((s) => (
                    <Pill key={skillName(s)}>{skillName(s)}</Pill>
                  ))}
                </div>
              ) : (
                <ProfileEmptyState message="No skills added yet." actionLabel="Add your first skill" onAction={() => setSkillOpen(true)} />
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

            <SectionCard title="Education" editable addLabel="Add education" onEdit={goSettings} onAdd={() => setEduOpen(true)}>
              {user.education?.length ? (
                <div className="space-y-5">
                  {user.education.map((e, i) => (
                    <div key={i} className="flex gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <GraduationCap size={20} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900">{e.institution}</p>
                        <p className="text-sm text-slate-600">
                          {e.degree}
                          {e.field ? ` · ${e.field}` : ''}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatMonthYear(e.startDate)} – {formatMonthYear(e.endDate)}
                          {e.grade ? ` · Grade: ${e.grade}` : ''}
                        </p>
                        {(e.description ?? meta.education[educationKey(i, e.institution)]?.description) && (
                          <p className="mt-1.5 break-words text-sm text-slate-500">
                            {e.description ?? meta.education[educationKey(i, e.institution)]?.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ProfileEmptyState message="No education added yet." actionLabel="Add your degree" onAction={() => setEduOpen(true)} />
              )}
            </SectionCard>

            <SectionCard title="Internship Experience" subtitle="Completed internships and the feedback you received">
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
                <ProfileEmptyState message="No completed internships yet — apply to your first one." />
              )}
            </SectionCard>

            <SectionCard title="Courses & Certificates" editable addLabel="Add certificate" onEdit={goSettings} onAdd={() => setCourseOpen(true)}>
              {user.courses?.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {user.courses.map((c, i) => {
                    const certUrl =
                      c.certificate?.secure_url || c.certificate?.certificateUrl || c.attachmentUrl || c.link;
                    // Backend fields win; localStorage is a legacy fallback.
                    const legacy = meta.courses[c.name] || {};
                    const cm = {
                      startDate: c.startDate ?? legacy.startDate,
                      endDate: c.endDate ?? legacy.endDate,
                      present: c.present ?? legacy.present,
                      description: c.description ?? legacy.description,
                    };
                    return (
                      <div key={c._id || i} className="rounded-xl border border-slate-100 p-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                            <Award size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                            {(cm?.startDate || cm?.endDate || cm?.present) && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {formatMonthYear(cm?.startDate) || '?'} –{' '}
                                {cm?.present ? (
                                  <span className="font-semibold text-emerald-600">Present</span>
                                ) : (
                                  formatMonthYear(cm?.endDate) || '?'
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        {cm?.description && (
                          <p className="mt-2 line-clamp-2 break-words text-xs leading-relaxed text-slate-500">{cm.description}</p>
                        )}
                        {certUrl && (
                          <button
                            type="button"
                            onClick={() => openFileProxy(certUrl)}
                            className="mt-2 text-xs font-medium text-emerald-600 hover:underline"
                          >
                            View certificate
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ProfileEmptyState message="No certificates uploaded yet." actionLabel="Upload one" onAction={() => setCourseOpen(true)} />
              )}
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
                  {pending.slice(0, 4).map((c) => (
                    <li key={c.label} className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {c.label}
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>

            <SectionCard title="Contact & personal" subtitle="Only visible to you" editable onEdit={goSettings}>
              <div className="space-y-4">
                <MetaRow icon={Mail} label="Email" value={user.email} />
                <MetaRow icon={Phone} label="Phone" value={user.phoneNumber} />
                <MetaRow icon={MapPin} label="Address" value={user.address} />
                <MetaRow icon={Cake} label="Date of birth" value={formatDate(user.dateOfBirth)} />
                <MetaRow icon={UserIcon} label="Gender" value={user.gender} />
              </div>
            </SectionCard>

            <SectionCard title="Resume">
              {resumeUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <FileText size={20} className="shrink-0 text-rose-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{fullName} — Resume.pdf</p>
                      <p className="text-xs text-slate-400">Shared with companies you apply to</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openFileProxy(resumeUrl)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Download size={14} /> Download
                    </button>
                    <button
                      type="button"
                      onClick={goSettings}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Upload size={14} /> Replace
                    </button>
                  </div>
                </div>
              ) : (
                <ProfileEmptyState message="No resume uploaded." actionLabel="Upload resume" onAction={goSettings} />
              )}
            </SectionCard>

            <SectionCard title="Account">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Sign-in method</dt>
                  <dd className="font-medium capitalize text-slate-900">{user.provider}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Email confirmed</dt>
                  <dd className={`font-medium ${user.isConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {user.isConfirmed ? 'Yes' : 'Pending'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">Last updated</dt>
                  <dd className="font-medium text-slate-900">{formatDate(user.updatedAt || user.createdAt) || '—'}</dd>
                </div>
              </dl>
              <Link
                href="/settings"
                className="mt-4 block text-center text-xs font-semibold text-slate-400 hover:text-emerald-600"
              >
                Open settings →
              </Link>
            </SectionCard>

            {(user.socials?.length ? user.socials : meta.socials).length > 0 && (
              <SectionCard title="Social links">
                <div className="space-y-2">
                  {(user.socials?.length ? user.socials : meta.socials).map((s, i) => (
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
          </div>
        </div>
      </main>

      {skillOpen && (
        <SkillModal
          open
          saving={modalSaving}
          initial={null}
          existingNames={(user.skills || []).map((s) => skillName(s))}
          educationOptions={educationOptions}
          internshipOptions={internshipOptions}
          onClose={() => setSkillOpen(false)}
          onSave={handleAddSkill}
        />
      )}
      {courseOpen && (
        <CourseModal
          open
          saving={modalSaving}
          initial={null}
          existingNames={(user.courses || []).map((c) => c.name)}
          onClose={() => setCourseOpen(false)}
          onSave={handleAddCourse}
        />
      )}
      {eduOpen && (
        <EducationModal
          open
          saving={modalSaving}
          initial={null}
          onClose={() => setEduOpen(false)}
          onSave={handleAddEducation}
        />
      )}
    </div>
  );
}

