'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Award,
  Briefcase,
  Camera,
  FileText,
  GraduationCap,
  Link2,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  Upload,
  User as UserIcon,
} from 'lucide-react';
import { useAppDispatch } from '@/store/store';
import { setUser } from '@/store/userSlice';
import {
  CATEGORY_LABELS,
  getUserImgUrl,
  skillName,
  skillProvenance,
  type Category,
  type Course,
  type Education,
  type SkillObject,
  type User,
} from '@/features/student/types';
import { userService } from '@/features/student/services/user.service';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import { openFileProxy } from '@/lib/file-proxy';
import { useBlankImage } from '@/lib/use-blank-image';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ImageMenu from '@/components/ui/ImageMenu';
import ConfirmModal from '@/components/ui/ConfirmModal';
import SkillModal, { type SkillFormValue } from '@/features/profiles/components/SkillModal';
import CourseModal, { type CourseFormValue } from '@/features/profiles/components/CourseModal';
import EducationModal, { type EducationFormValue } from '@/features/profiles/components/EducationModal';
import {
  SKILL_SOURCE_LABELS,
  SOCIAL_PLATFORMS,
  educationKey,
  getProfileMeta,
  removeCourseMeta,
  removeSkillMeta,
  setCourseMeta,
  setEducationMeta,
  setSkillMeta,
  useProfileMeta,
} from '@/features/profiles/services/profile-meta.store';
import { Pill, formatMonthYear } from '@/features/profiles/components/ProfilePrimitives';

const ImageCropperModal = dynamic(() => import('@/components/ui/ImageCropperModal'), { ssr: false });

interface StudentEditProfileProps {
  user: User;
}

export default function StudentEditProfile({ user: initialUser }: StudentEditProfileProps) {
  const dispatch = useAppDispatch();
  const userId = initialUser._id;
  const [user, setLocalUser] = useState<User>(initialUser);
  const { meta, refresh: refreshMeta } = useProfileMeta(userId);

  // ---------- basic info form ----------
  const [firstName, setFirstName] = useState(initialUser.firstName || '');
  const [lastName, setLastName] = useState(initialUser.lastName || '');
  const [headline, setHeadline] = useState(initialUser.headline || '');
  const [bio, setBio] = useState(initialUser.bio || '');
  const [phone, setPhone] = useState(initialUser.phoneNumber || '');
  const [address, setAddress] = useState(initialUser.address || '');
  const [dob, setDob] = useState((initialUser.dateOfBirth || '').slice(0, 10));
  const [gender, setGender] = useState(initialUser.gender || '');
  const [savingBasic, setSavingBasic] = useState(false);

  // ---------- photos ----------
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [cropTarget, setCropTarget] = useState<'profile' | 'cover' | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  // ---------- modals ----------
  const [skillModal, setSkillModal] = useState<{ open: boolean; name?: string }>({ open: false });
  const [courseModal, setCourseModal] = useState<{ open: boolean; name?: string }>({ open: false });
  const [eduModal, setEduModal] = useState<{ open: boolean; index?: number }>({ open: false });
  const [modalSaving, setModalSaving] = useState(false);
  const [deleteSkill, setDeleteSkill] = useState<string | null>(null);
  const [deleteEdu, setDeleteEdu] = useState<number | null>(null);
  const [deleteCourseName, setDeleteCourseName] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ---------- socials ----------
  const [platform, setPlatform] = useState(SOCIAL_PLATFORMS[0]);
  const [socialUrl, setSocialUrl] = useState('');
  const [socialError, setSocialError] = useState<string | null>(null);
  const [savingSocials, setSavingSocials] = useState(false);

  const profileBlank = useBlankImage(getUserImgUrl(user.profilePicture));
  const coverBlank = useBlankImage(getUserImgUrl(user.coverPicture));

  async function refreshUser() {
    const fresh = await userService.getUserProfile(userId);
    dispatch(setUser(fresh));
    setLocalUser(fresh);
    return fresh;
  }

  // ================= photos =================
  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'cover') {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    setCropTarget(target);
    e.target.value = '';
  }

  async function uploadCroppedBlob(blob: Blob, target: 'profile' | 'cover') {
    const file = new File([blob], `${target}.jpg`, { type: 'image/jpeg' });
    if (target === 'profile') {
      setUploadingProfile(true);
      try {
        await userService.uploadProfilePicture(file);
        await refreshUser();
        toastHelper.success('Profile picture updated!');
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setUploadingProfile(false);
        setCropTarget(null);
        setCropSrc(null);
      }
    } else {
      setUploadingCover(true);
      try {
        await userService.uploadCoverPicture(file);
        await refreshUser();
        toastHelper.success('Cover picture updated!');
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setUploadingCover(false);
        setCropTarget(null);
        setCropSrc(null);
      }
    }
  }

  async function handleRemoveImage(target: 'profile' | 'cover') {
    if (target === 'profile') {
      setUploadingProfile(true);
      try {
        await userService.clearProfilePicture();
        await refreshUser();
        toastHelper.success('Profile picture removed');
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setUploadingProfile(false);
      }
    } else {
      setUploadingCover(true);
      try {
        await userService.clearCoverPicture();
        await refreshUser();
        toastHelper.success('Cover picture removed');
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setUploadingCover(false);
      }
    }
  }

  async function handleResumeSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploadingResume(true);
    try {
      const url = await userService.uploadResume(file);
      await userService.updateProfile(userId, { resume: url });
      await refreshUser();
      toastHelper.success('Resume uploaded!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setUploadingResume(false);
    }
  }

  // ================= basic info =================
  async function saveBasicInfo() {
    if (!firstName.trim() || !lastName.trim()) {
      toastHelper.error('First and last name are required.');
      return;
    }
    setSavingBasic(true);
    try {
      await userService.updateProfile(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        headline: headline.trim() || undefined,
        bio: bio.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        dateOfBirth: dob ? `${dob}T00:00:00.000Z` : undefined,
        gender: (gender as 'male' | 'female') || undefined,
      });
      await refreshUser();
      toastHelper.success('Profile updated!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingBasic(false);
    }
  }

  // ================= categories =================
  async function toggleCategory(cat: Category) {
    const current = user.categories || [];
    const next = current.includes(cat) ? current.filter((c) => c !== cat) : [...current, cat];
    try {
      await userService.updateProfile(userId, { categories: next });
      const fresh = await refreshUser();
      setLocalUser({ ...fresh, categories: next });
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    }
  }

  // ================= skills =================
  const educationOptions = (user.education || [])
    .map((e) => [e.institution, e.field].filter(Boolean).join(' — '))
    .filter(Boolean);
  const internshipOptions = (user.experience || []).map((x) =>
    [x.internshipTitle, x.companyName].filter(Boolean).join(' @ '),
  );

  async function saveSkill({ name, meta: skillMeta }: SkillFormValue) {
    setModalSaving(true);
    try {
      // Backend requires sourceRef on skill objects — default it for self-study.
      const obj: SkillObject = {
        name,
        source: skillMeta.source,
        sourceRef: skillMeta.ref || (skillMeta.source === 'self' ? 'Self-study' : '—'),
        description: skillMeta.description,
      };
      const current = user.skills || [];
      const skills = skillModal.name
        ? current.map((s) => (skillName(s) === skillModal.name ? obj : s))
        : [...current, obj];
      await userService.updateProfile(userId, { skills });
      setSkillMeta(userId, name, skillMeta);
      await refreshUser();
      refreshMeta();
      setSkillModal({ open: false });
      toastHelper.success(skillModal.name ? 'Skill updated!' : 'Skill added!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setModalSaving(false);
    }
  }

  async function confirmDeleteSkill() {
    if (!deleteSkill) return;
    setDeleting(true);
    try {
      await userService.updateProfile(
        userId,
        { skills: (user.skills || []).filter((s) => skillName(s) !== deleteSkill) },
      );
      removeSkillMeta(userId, deleteSkill);
      await refreshUser();
      refreshMeta();
      toastHelper.success('Skill removed');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteSkill(null);
    }
  }

  // ================= education =================
  async function saveEducation({ entry, description }: EducationFormValue) {
    setModalSaving(true);
    try {
      const full: Education = { ...entry, description };
      const list = [...(user.education || [])];
      if (eduModal.index !== undefined) {
        list[eduModal.index] = full;
      } else {
        list.push(full);
      }
      await userService.updateProfile(userId, { education: list });
      await refreshUser();
      refreshMeta();
      setEduModal({ open: false });
      toastHelper.success(eduModal.index !== undefined ? 'Education updated!' : 'Education added!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setModalSaving(false);
    }
  }

  async function confirmDeleteEducation() {
    if (deleteEdu === null) return;
    setDeleting(true);
    try {
      await userService.updateProfile(userId, {
        education: (user.education || []).filter((_, i) => i !== deleteEdu),
      });
      await refreshUser();
      refreshMeta();
      setEduModal({ open: false });
      toastHelper.success('Education removed');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteEdu(null);
    }
  }

  // ================= courses =================
  async function saveCourse({ name, meta: courseMeta, certificate }: CourseFormValue) {
    setModalSaving(true);
    try {
      const fields = {
        startDate: courseMeta.startDate,
        endDate: courseMeta.present ? undefined : courseMeta.endDate,
        present: courseMeta.present,
        description: courseMeta.description,
      };
      if (courseModal.name) {
        // Backend has no delete/replace-course endpoint: update name/file in place by index.
        const idx = (user.courses || []).findIndex((c) => c.name === courseModal.name);
        if (idx >= 0) {
          await userService.updateCourse(idx, name, certificate ?? undefined, fields);
        }
      } else {
        await userService.addCourse(name, certificate ?? undefined, fields);
      }
      setCourseMeta(userId, name, courseMeta);
      if (courseModal.name && courseModal.name !== name) removeCourseMeta(userId, courseModal.name);
      await refreshUser();
      refreshMeta();
      setCourseModal({ open: false });
      toastHelper.success(courseModal.name ? 'Course updated!' : 'Course added!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setModalSaving(false);
    }
  }

  async function confirmDeleteCourse() {
    if (deleteCourseName === null) return;
    setDeleting(true);
    try {
      const idx = (user.courses || []).findIndex((c) => c.name === deleteCourseName);
      if (idx < 0) throw new Error('Course not found');
      await userService.deleteCourse(idx);
      removeCourseMeta(userId, deleteCourseName);
      await refreshUser();
      refreshMeta();
      toastHelper.success('Course removed');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
      setDeleteCourseName(null);
    }
  }

  // ================= socials (backend) =================
  const socials = user.socials ?? [];

  async function persistSocials(next: { platform: string; url: string }[]) {
    setSavingSocials(true);
    try {
      await userService.updateProfile(userId, { socials: next });
      await refreshUser();
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSavingSocials(false);
    }
  }

  async function addSocial() {
    const url = socialUrl.trim();
    if (!url) {
      setSocialError('Paste your profile link.');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      setSocialError('Link must start with http(s)://');
      return;
    }
    if (socials.length >= 10) {
      setSocialError('You can add up to 10 links.');
      return;
    }
    setSocialError(null);
    await persistSocials([...socials, { platform, url }]);
    setSocialUrl('');
    toastHelper.success('Social link added!');
  }

  async function removeSocial(index: number) {
    await persistSocials(socials.filter((_, i) => i !== index));
    toastHelper.success('Social link removed');
  }

  const avatarUrl = getUserImgUrl(user.profilePicture);
  const coverUrl = getUserImgUrl(user.coverPicture);
  const resumeUrl = getUserImgUrl(user.resume);
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const editingSkillMeta = skillModal.name ? getProfileMeta(userId).skills[skillModal.name] : undefined;
  const editingCourse = courseModal.name
    ? (user.courses || []).find((c) => c.name === courseModal.name)
    : undefined;
  const editingCourseMeta = editingCourse
    ? {
        startDate: editingCourse.startDate ?? getProfileMeta(userId).courses[editingCourse.name]?.startDate,
        endDate: editingCourse.endDate ?? getProfileMeta(userId).courses[editingCourse.name]?.endDate,
        present: editingCourse.present ?? getProfileMeta(userId).courses[editingCourse.name]?.present,
        description:
          editingCourse.description ?? getProfileMeta(userId).courses[editingCourse.name]?.description,
      }
    : undefined;
  const editingEdu =
    eduModal.index !== undefined
      ? {
          entry: user.education?.[eduModal.index] as Education,
          description:
            user.education?.[eduModal.index]?.description ??
            getProfileMeta(userId).education[
              educationKey(eduModal.index, user.education?.[eduModal.index]?.institution)
            ]?.description,
        }
      : null;

  return (
    <div className="space-y-6">
      {/* ============ photos ============ */}
      <section>
        <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
          <Camera size={16} className="text-emerald-500" /> Photos & resume
        </h3>
        <p className="mb-4 text-sm text-slate-400">What companies see first.</p>

        <div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 sm:h-36">
          {coverBlank.showImage && coverUrl ? (
            <img src={coverUrl} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" onLoad={coverBlank.onImgLoad} />
          ) : null}
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFileSelect(e, 'cover')}
          />
          <div className="absolute right-3 top-3">
            <ImageMenu
              onEdit={() => coverRef.current?.click()}
              onDelete={coverUrl ? () => handleRemoveImage('cover') : undefined}
              loading={uploadingCover}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-2xl font-bold text-slate-400 ring-4 ring-white">
              {profileBlank.showImage && avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="h-full w-full object-cover" onLoad={profileBlank.onImgLoad} />
              ) : (
                <>
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </>
              )}
            </div>
            <input
              ref={profileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFileSelect(e, 'profile')}
            />
            <div className="absolute -bottom-1 -right-1">
              <ImageMenu
                onEdit={() => profileRef.current?.click()}
                onDelete={avatarUrl ? () => handleRemoveImage('profile') : undefined}
                loading={uploadingProfile}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{fullName}</p>
            <p className="truncate text-xs text-slate-400">{user.headline || user.email}</p>
          </div>

          <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeSelect} />
          <div className="flex gap-2">
            {resumeUrl && (
              <Button variant="outline" size="sm" onClick={() => openFileProxy(resumeUrl)}>
                <FileText size={14} /> View CV
              </Button>
            )}
            <Button size="sm" loading={uploadingResume} onClick={() => resumeRef.current?.click()}>
              <Upload size={14} /> {resumeUrl ? 'Replace CV' : 'Upload CV'}
            </Button>
          </div>
        </div>
      </section>

      {/* ============ basic info ============ */}
      <section className="border-t border-slate-100 pt-6">
        <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
          <UserIcon size={16} className="text-emerald-500" /> Basic info
        </h3>
        <p className="mb-4 text-sm text-slate-400">Your name, headline and contact details.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <div className="mt-4">
          <Input
            label="Headline"
            placeholder="e.g. Frontend Developer | CS student"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
        </div>
        <div className="mt-4 flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-slate-700">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell companies who you are..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+20 ..." />
          <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="City, Country" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">Date of birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
          <Select
            label="Gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
            placeholder="Select..."
          />
        </div>
        <div className="mt-5">
          <Button loading={savingBasic} onClick={saveBasicInfo}>
            Save basic info
          </Button>
        </div>
      </section>

      {/* ============ skills ============ */}
      <section className="border-t border-slate-100 pt-6">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <Sparkles size={16} className="text-emerald-500" /> Skills
          </h3>
          <button
            type="button"
            onClick={() => setSkillModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Plus size={14} /> Add skill
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-400">Each skill records where you learned it.</p>
        {(user.skills || []).length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">
            No skills yet — add your first one.
          </p>
        ) : (
          <div className="space-y-2">
            {(user.skills || []).map((skill) => {
              const name = skillName(skill);
              // Backend provenance wins; localStorage is a legacy fallback.
              const prov = skillProvenance(skill);
              const sm = prov
                ? { source: prov.source, ref: prov.ref }
                : meta.skills[name]
                  ? { source: meta.skills[name].source, ref: meta.skills[name].ref }
                  : undefined;
              return (
                <div
                  key={name}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 px-4 py-2.5"
                >
                  <Pill>{name}</Pill>
                  <span className="min-w-0 flex-1 truncate text-xs text-slate-400">
                    {sm ? (
                      <>
                        {SKILL_SOURCE_LABELS[sm.source]}
                        {sm.ref ? ` · ${sm.ref}` : ''}
                      </>
                    ) : (
                      'No source recorded'
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSkillModal({ open: true, name })}
                    aria-label={`Edit ${name}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteSkill(name)}
                    aria-label={`Remove ${name}`}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ tracks ============ */}
      <section className="border-t border-slate-100 pt-6">
        <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
          <Briefcase size={16} className="text-emerald-500" /> Tracks
        </h3>
        <p className="mb-4 text-sm text-slate-400">Fields you want internships in.</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([value, label]) => {
            const on = (user.categories || []).includes(value);
            if (value === 'other') return null;
            return (
              <button
                key={value}
                type="button"
                onClick={() => toggleCategory(value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
                  on
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:text-emerald-600'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ============ education ============ */}
      <section className="border-t border-slate-100 pt-6">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <GraduationCap size={16} className="text-emerald-500" /> Education
          </h3>
          <button
            type="button"
            onClick={() => setEduModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Plus size={14} /> Add education
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-400">Schools and degrees — reusable as skill sources.</p>
        {(user.education || []).length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">No education added yet.</p>
        ) : (
          <div className="space-y-3">
            {(user.education || []).map((e, i) => {
              const desc = e.description ?? meta.education[educationKey(i, e.institution)]?.description;
              return (
                <div key={i} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900">{e.institution}</p>
                      <p className="text-sm text-slate-500">
                        {[e.degree, e.field].filter(Boolean).join(' · ') || '—'}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {formatMonthYear(e.startDate)} – {formatMonthYear(e.endDate)}
                        {e.grade ? ` · ${e.grade}` : ''}
                      </p>
                      {desc && <p className="mt-2 break-words text-sm text-slate-500">{desc}</p>}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setEduModal({ open: true, index: i })}
                        aria-label="Edit education"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteEdu(i)}
                        aria-label="Remove education"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ courses ============ */}
      <section className="border-t border-slate-100 pt-6">
        <div className="mb-1 flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <Award size={16} className="text-emerald-500" /> Courses
          </h3>
          <button
            type="button"
            onClick={() => setCourseModal({ open: true })}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <Plus size={14} /> Add course
          </button>
        </div>
        <p className="mb-4 text-sm text-slate-400">With dates, status and certificates.</p>
        {(user.courses || []).length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400">No courses yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(user.courses || []).map((c: Course, i: number) => {
              // Backend fields win; localStorage is a legacy fallback.
              const legacy = meta.courses[c.name] || {};
              const cm = {
                startDate: c.startDate ?? legacy.startDate,
                endDate: c.endDate ?? legacy.endDate,
                present: c.present ?? legacy.present,
                description: c.description ?? legacy.description,
              };
              const certUrl = c.certificate?.secure_url || c.certificate?.certificateUrl || c.attachmentUrl || c.link;
              return (
                <div key={c._id || `${c.name}-${i}`} className="rounded-xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">{c.name}</p>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setCourseModal({ open: true, name: c.name })}
                        aria-label={`Edit ${c.name}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteCourseName(c.name)}
                        aria-label={`Remove ${c.name}`}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {(cm?.startDate || cm?.endDate || cm?.present) && (
                    <p className="mt-1 text-xs text-slate-400">
                      {formatMonthYear(cm?.startDate) || '?'} –{' '}
                      {cm?.present ? <span className="font-semibold text-emerald-600">Present</span> : formatMonthYear(cm?.endDate) || '?'}
                    </p>
                  )}
                  {cm?.description && <p className="mt-1.5 line-clamp-2 break-words text-xs text-slate-500">{cm.description}</p>}
                  {certUrl && (
                    <button
                      type="button"
                      onClick={() => openFileProxy(certUrl)}
                      className="mt-2 text-xs font-semibold text-emerald-600 hover:underline"
                    >
                      View certificate
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============ socials ============ */}
      <section className="border-t border-slate-100 pt-6">
        <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
          <Share2 size={16} className="text-emerald-500" /> Social links
        </h3>
        <p className="mb-4 text-sm text-slate-400">Shown on your public profile.</p>
        {socials.length > 0 && (
          <div className="mb-3 space-y-2">
            {socials.map((s, i) => (
              <div key={`${s.platform}-${s.url}-${i}`} className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-2.5">
                <Link2 size={14} className="shrink-0 text-slate-400" />
                <span className="w-28 shrink-0 truncate text-xs font-semibold text-slate-600">{s.platform}</span>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="min-w-0 flex-1 truncate text-xs text-emerald-600 hover:underline"
                >
                  {s.url}
                </a>
                <button
                  type="button"
                  onClick={() => removeSocial(i)}
                  aria-label="Remove link"
                  disabled={savingSocials}
                  className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            options={SOCIAL_PLATFORMS.map((p) => ({ value: p, label: p }))}
            className="sm:w-44"
          />
          <Input
            placeholder="https://linkedin.com/in/you"
            value={socialUrl}
            onChange={(e) => setSocialUrl(e.target.value)}
            error={socialError || undefined}
          />
          <Button onClick={addSocial} loading={savingSocials} className="shrink-0">
            <Plus size={14} /> Add
          </Button>
        </div>
      </section>

      {/* ============ modals (fresh mount per open) ============ */}
      {skillModal.open && (
        <SkillModal
          open
          saving={modalSaving}
          initial={skillModal.name ? { name: skillModal.name, meta: editingSkillMeta } : null}
          existingNames={(user.skills || []).map((s) => skillName(s))}
          educationOptions={educationOptions}
          internshipOptions={internshipOptions}
          onClose={() => setSkillModal({ open: false })}
          onSave={saveSkill}
        />
      )}
      {courseModal.open && (
        <CourseModal
          open
          saving={modalSaving}
          initial={courseModal.name ? { name: courseModal.name, meta: editingCourseMeta } : null}
          existingNames={(user.courses || []).map((c) => c.name)}
          onClose={() => setCourseModal({ open: false })}
          onSave={saveCourse}
        />
      )}
      {eduModal.open && (
        <EducationModal
          open
          saving={modalSaving}
          initial={editingEdu ? { index: eduModal.index as number, ...editingEdu } : null}
          onClose={() => setEduModal({ open: false })}
          onSave={saveEducation}
        />
      )}

      <ConfirmModal
        open={deleteSkill !== null}
        title="Remove skill?"
        message={`"${deleteSkill}" will be removed from your profile.`}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={confirmDeleteSkill}
        onCancel={() => setDeleteSkill(null)}
      />
      <ConfirmModal
        open={deleteEdu !== null}
        title="Remove education?"
        message="This entry will be removed from your profile."
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={confirmDeleteEducation}
        onCancel={() => setDeleteEdu(null)}
      />
      <ConfirmModal
        open={deleteCourseName !== null}
        title="Remove course?"
        message={`"${deleteCourseName}" will be removed from your profile.`}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={confirmDeleteCourse}
        onCancel={() => setDeleteCourseName(null)}
      />

      {cropSrc && (
        <ImageCropperModal
          src={cropSrc}
          aspect={cropTarget === 'profile' ? 1 : 16 / 6}
          title={cropTarget === 'profile' ? 'Crop profile picture' : 'Crop cover picture'}
          onCrop={(blob) => uploadCroppedBlob(blob, cropTarget as 'profile' | 'cover')}
          onCancel={() => {
            setCropTarget(null);
            setCropSrc(null);
          }}
        />
      )}
    </div>
  );
}

