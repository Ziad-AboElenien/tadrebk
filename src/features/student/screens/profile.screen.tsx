'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logout } from '@/store/authSlice';
import { setUser, updateUser, clearUser } from '@/store/userSlice';
import { getUserImgUrl } from '@/features/student/types';
import { CATEGORY_LABELS, type Category } from '@/features/student/types';
import { getFileProxyUrl } from '@/lib/file-proxy';
import { profileSchema, type ProfileFormData } from '@/features/auth/schemas/auth.schemas';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { userService } from '@/features/student/services/user.service';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';
import ImageLightbox from '@/features/student/components/ImageLightbox';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function StudentProfileScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.currentUser);
  const userId = useAppSelector((s) => s.auth.userId);

  const [editing, setEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(getUserImgUrl((user as any)?.resume));
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const {
    register, handleSubmit, reset, control, watch, setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phoneNumber || '',
        bio: user.bio || '',
        headline: user.headline || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
        gender: (user.gender as 'male' | 'female' | '') || '',
        skills: user.skills?.join(', ') || '',
        categories: (user.categories as string[]) || [],
        experience: user.experience || [],
        education: user.education || [],
      });
    }
  }, [user, reset]);

  async function onSubmit(data: ProfileFormData) {
    if (!userId) return;
    setSaving(true);
    try {
      const updated = await userService.updateProfile(userId, {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone || undefined,
        bio: data.bio || undefined,
        headline: data.headline || undefined,
        address: data.address || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender || undefined,
        skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        categories: data.categories?.length ? data.categories as Category[] : undefined,
        experience: data.experience?.filter((e) => e.company && e.title) || undefined,
        education: data.education?.filter((e) => e.institution) || undefined,
      });
      dispatch(setUser(updated));
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) { toast.error(getErrorMessage(err)); } finally { setSaving(false); }
  }

  async function handleProfileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingProfile(true);
    try {
      const url = await userService.uploadProfilePicture(file);
      await userService.updateProfile(userId!, { profilePicture: url });
      dispatch(updateUser({ profilePicture: url }));
      toast.success('Profile picture updated!');
    }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setUploadingProfile(false); if (profileRef.current) profileRef.current.value = ''; }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await userService.uploadCoverPicture(file);
      await userService.updateProfile(userId!, { coverPicture: url });
      dispatch(updateUser({ coverPicture: url }));
      toast.success('Cover picture updated!');
    }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setUploadingCover(false); if (coverRef.current) coverRef.current.value = ''; }
  }

  async function handleResumeUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingResume(true);
    try {
      const url = await userService.uploadResume(file);
      await userService.updateProfile(userId!, { resume: url });
      dispatch(updateUser({ resume: url }));
      setResumeUrl(url);
      toast.success('Resume uploaded!');
    }
    catch (err) { toast.error(getErrorMessage(err)); } finally { setUploadingResume(false); if (resumeRef.current) resumeRef.current.value = ''; }
  }

  async function handleDeleteAccount() {
    if (!userId) return;
    setDeletingAccount(true);
    try {
      await userService.deleteAccount(userId);
      dispatch(clearUser());
      dispatch(logout());
      router.push('/');
      toast.success('Account deleted');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeletingAccount(false);
      setConfirmDelete(false);
    }
  }

  const handleSignOut = useCallback(() => {
    dispatch(logout());
    router.push('/');
    toast.success('Signed out');
  }, [dispatch, router]);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Student';

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Please sign in to view your profile.</p>
        <Link href="/login/student"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 sm:px-8 py-8">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500 hover:underline">
          <i className="fas fa-arrow-left text-xs" /> Back to Dashboard
        </Link>

        {/* Cover */}
        <div className="relative h-48 sm:h-56 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20">
          {getUserImgUrl(user.coverPicture) ? (
            <button onClick={() => setLightbox(getUserImgUrl(user.coverPicture)!)} className="absolute inset-0 w-full h-full">
              <img src={getUserImgUrl(user.coverPicture)!} alt="Cover" className="w-full h-full object-cover" />
            </button>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
          )}
          <div className="absolute top-4 right-4 z-10">
            <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <button onClick={() => coverRef.current?.click()} disabled={uploadingCover} className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5">
              {uploadingCover ? <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <i className="fas fa-camera text-xs" />}
              {uploadingCover ? 'Uploading...' : 'Change cover'}
            </button>
          </div>
        </div>

        {/* Avatar + header */}
        <div className="relative px-4 sm:px-6 -mt-14 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                {getUserImgUrl(user.profilePicture) ? (
                  <button onClick={() => setLightbox(getUserImgUrl(user.profilePicture)!)} className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl cursor-pointer">
                    <img src={getUserImgUrl(user.profilePicture)!} alt={displayName} className="w-full h-full object-cover" />
                  </button>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center ring-4 ring-white shadow-xl">
                    <span className="text-4xl font-bold text-white select-none">{displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</span>
                  </div>
                )}
                <input ref={profileRef} type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
                <button onClick={() => profileRef.current?.click()} disabled={uploadingProfile} className="absolute -bottom-1 -right-1 bg-white hover:bg-gray-50 text-gray-600 w-8 h-8 rounded-full shadow-md border border-gray-200 flex items-center justify-center transition-all text-xs" title="Change photo">
                  {uploadingProfile ? <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : <i className="fas fa-camera" />}
                </button>
              </div>
              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-dark">{displayName}</h1>
                <p className="text-gray-500 flex items-center gap-1.5 mt-0.5"><i className="fas fa-envelope text-xs" />{user.email}</p>
              </div>
            </div>
            {!editing && <Button variant="outline" size="sm" leftIcon={<i className="fas fa-pen text-xs" />} onClick={() => setEditing(true)}>Edit profile</Button>}
          </div>

          {user.headline && !editing && <p className="text-gray-600 mt-3 flex items-center gap-2"><i className="fas fa-briefcase text-gray-300 text-xs" />{user.headline}</p>}

          {!editing && (
            <div className="flex flex-wrap gap-5 mt-5 text-sm text-gray-500">
              {user.dateOfBirth && <span className="flex items-center gap-1.5"><i className="fas fa-cake-candles text-gray-300 text-xs" />{formatDate(user.dateOfBirth)}</span>}
              {user.address && <span className="flex items-center gap-1.5"><i className="fas fa-location-dot text-gray-300 text-xs" />{user.address}</span>}
              {user.createdAt && <span className="flex items-center gap-1.5"><i className="fas fa-calendar text-gray-300 text-xs" />Joined {formatDate(user.createdAt)}</span>}
              {user.provider && <span className="flex items-center gap-1.5"><i className="fas fa-shield-halved text-gray-300 text-xs" />{user.provider === 'google' ? 'Google account' : 'Email account'}</span>}
            </div>
          )}
        </div>

        {/* Edit form / Profile display */}
        {editing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <h2 className="font-bold text-dark text-lg">Edit details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="First name" error={errors.firstName?.message} {...register('firstName')} />
              <Input label="Last name" error={errors.lastName?.message} {...register('lastName')} />
            </div>
            <Input label="Headline" error={errors.headline?.message} {...register('headline')} placeholder="e.g. Computer Science Student at Cairo University" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Bio</label>
              <textarea {...register('bio')} rows={4} className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200 resize-y border-gray-200" placeholder="Tell us about yourself..." />
              {errors.bio && <p className="text-red-500 text-xs font-medium">{errors.bio.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
              <Select label="Gender" error={errors.gender?.message} {...register('gender')}><option value="">Prefer not to say</option><option value="male">Male</option><option value="female">Female</option></Select>
              <Input label="Address" error={errors.address?.message} {...register('address')} />
              <Input label="Date of birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
            </div>
            <Input label="Skills (comma-separated)" error={errors.skills?.message} {...register('skills')} placeholder="e.g. JavaScript, Python, Public Speaking" />

            {/* Categories */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-dark text-sm flex items-center gap-2 mb-1"><i className="fas fa-tags text-primary" />Categories <span className="text-gray-400 font-normal text-xs">(max 4)</span></h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([value, label]) => {
                  const selected = (watch('categories') || []).includes(value);
                  const atLimit = (watch('categories') || []).length >= 4;
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!selected && atLimit}
                      onClick={() => {
                        const current = (watch('categories') || []) as string[];
                        if (selected) {
                          setValue('categories', current.filter((c) => c !== value) as any, { shouldValidate: true });
                        } else if (current.length < 4) {
                          setValue('categories', [...current, value] as any, { shouldValidate: true });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        selected
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : atLimit
                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary cursor-pointer'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {errors.categories && <p className="text-red-500 text-xs font-medium mt-1">{errors.categories.message}</p>}
            </div>

            {/* Experience */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-dark text-sm flex items-center gap-2"><i className="fas fa-briefcase text-primary" />Experience</h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => appendExp({ company: '', title: '', description: '', startDate: '', endDate: '' })}>
                  <i className="fas fa-plus text-xs" /> Add
                </Button>
              </div>
              {expFields.map((field, i) => (
                <div key={field.id} className="mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 relative">
                  <button type="button" onClick={() => removeExp(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"><i className="fas fa-times" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input {...register(`experience.${i}.company`)} placeholder="Company name" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                    <input {...register(`experience.${i}.title`)} placeholder="Job title" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                  </div>
                  <textarea {...register(`experience.${i}.description`)} rows={2} placeholder="Brief description..." className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200 resize-y" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input {...register(`experience.${i}.startDate`)} type="date" placeholder="Start date" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                    <input {...register(`experience.${i}.endDate`)} type="date" placeholder="End date" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                  </div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-dark text-sm flex items-center gap-2"><i className="fas fa-graduation-cap text-primary" />Education</h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => appendEdu({ institution: '', degree: '', field: '', grade: '', startDate: '', endDate: '' })}>
                  <i className="fas fa-plus text-xs" /> Add
                </Button>
              </div>
              {eduFields.map((field, i) => (
                <div key={field.id} className="mb-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-3 relative">
                  <button type="button" onClick={() => removeEdu(i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-sm"><i className="fas fa-times" /></button>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input {...register(`education.${i}.institution`)} placeholder="Institution name" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                    <input {...register(`education.${i}.degree`)} placeholder="Degree (e.g. Bachelor's)" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                  </div>
                   <input {...register(`education.${i}.field`)} placeholder="Field of study (e.g. Computer Science)" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                     <input {...register(`education.${i}.grade`)} placeholder="Grade / GPA (e.g. 3.5)" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                     <input {...register(`education.${i}.startDate`)} type="date" placeholder="Start date" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                     <input {...register(`education.${i}.endDate`)} type="date" placeholder="End date" className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary border-gray-200" />
                   </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <Button loading={saving} type="submit">Save changes</Button>
              <Button variant="outline" type="button" onClick={() => { setEditing(false); reset(); }}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            {user.bio && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bold text-dark text-lg mb-3 flex items-center gap-2"><i className="fas fa-user-pen text-primary text-base" />About</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{user.bio}</p>
              </div>
            )}
            {user.skills && user.skills.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-star text-primary text-base" />Skills</h2>
                <div className="flex flex-wrap gap-2">{user.skills.map((skill) => <span key={skill} className="px-4 py-1.5 bg-emerald-50 text-primary text-sm font-semibold rounded-full border border-emerald-100">{skill}</span>)}</div>
              </div>
            )}
            {user.categories && user.categories.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-tags text-primary text-base" />Categories</h2>
                <div className="flex flex-wrap gap-2">{user.categories.map((cat) => <span key={cat} className="px-4 py-1.5 bg-blue-50 text-blue-700 text-sm font-semibold rounded-full border border-blue-100">{CATEGORY_LABELS[cat as Category] || cat}</span>)}</div>
              </div>
            )}
            {user.experience && user.experience.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-briefcase text-primary text-base" />Experience</h2>
                <div className="space-y-5">{user.experience.map((exp, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">{exp.company[0]?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-dark">{exp.title}</p><p className="text-sm text-gray-500">{exp.company}</p>{(exp.startDate || exp.endDate) && <p className="text-xs text-gray-400 mt-0.5">{formatDate(exp.startDate)} - {exp.endDate ? formatDate(exp.endDate) : 'Present'}</p>}{exp.description && <p className="text-sm text-gray-600 mt-1">{exp.description}</p>}</div>
                  </div>
                ))}</div>
              </div>
            )}
            {user.education && user.education.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-graduation-cap text-primary text-base" />Education</h2>
                <div className="space-y-5">{user.education.map((edu, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">{edu.institution[0]?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-dark">{edu.institution}</p>{edu.degree && <p className="text-sm text-gray-500">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>}{edu.grade && <p className="text-xs text-gray-400 mt-0.5">Grade: {edu.grade}</p>}{(edu.startDate || edu.endDate) && <p className="text-xs text-gray-400 mt-0.5">{formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}</p>}</div>
                  </div>
                ))}</div>
              </div>
            )}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
              <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-address-card text-primary text-base" />Contact info</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Email</p><p className="text-gray-700 mt-0.5">{user.email}</p></div>
                {user.phoneNumber && <div><p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Phone</p><p className="text-gray-700 mt-0.5">{user.phoneNumber}</p></div>}
                {user.address && <div><p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Address</p><p className="text-gray-700 mt-0.5">{user.address}</p></div>}
                {user.gender && <div><p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Gender</p><p className="text-gray-700 mt-0.5 capitalize">{user.gender}</p></div>}
                {user.dateOfBirth && <div><p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Date of birth</p><p className="text-gray-700 mt-0.5">{formatDate(user.dateOfBirth)}</p></div>}
                {user.createdAt && <div><p className="text-gray-400 text-xs uppercase tracking-wide font-semibold">Member since</p><p className="text-gray-700 mt-0.5">{formatDate(user.createdAt)}</p></div>}
              </div>
            </div>
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
              <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-cloud-arrow-up text-primary text-base" />Media</h2>
              <div className="flex flex-wrap gap-3">
                <input ref={profileRef} type="file" accept="image/*" onChange={handleProfileUpload} className="hidden" />
                <Button variant="outline" size="sm" loading={uploadingProfile} onClick={() => profileRef.current?.click()}><i className="fas fa-image text-xs" /> Change photo</Button>
                <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                <Button variant="outline" size="sm" loading={uploadingCover} onClick={() => coverRef.current?.click()}><i className="fas fa-image text-xs" /> Change cover</Button>
                <input ref={resumeRef} type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                <Button variant="outline" size="sm" loading={uploadingResume} onClick={() => resumeRef.current?.click()}><i className="fas fa-file-pdf text-xs" /> {resumeUrl ? 'Replace resume' : 'Upload resume'}</Button>
              </div>
              {resumeUrl && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500"><i className="fas fa-file-pdf" /></span>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-gray-900 truncate">Resume uploaded</p><p className="text-xs text-gray-400">Ready for employers</p></div>
                   <a href={getFileProxyUrl(resumeUrl) ?? ''} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-600"><i className="fas fa-external-link-alt" /></a>
                </div>
              )}
            </div>
          </>
        )}

        {lightbox && <ImageLightbox src={lightbox} alt="Profile image" onClose={() => setLightbox(null)} />}

        {/* Settings button */}
        <div className="mt-8 text-center">
          <button onClick={() => setShowSettings(!showSettings)} className="text-sm font-semibold text-gray-500 hover:text-gray-700 flex items-center gap-1.5 mx-auto">
            <i className="fas fa-cog" /> Account Settings
          </button>
        </div>

        {showSettings && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
              <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-lock text-primary text-base" />Security</h2>
              <div className="flex flex-wrap gap-3">
                <Link href="/change-password"><Button variant="outline" size="sm"><i className="fas fa-key text-xs" /> Change password</Button></Link>
                <Link href="/change-email"><Button variant="outline" size="sm"><i className="fas fa-envelope text-xs" /> Change email</Button></Link>
              </div>
              <div className="border-t border-gray-100 pt-4 mt-4">
                {confirmDelete ? (
                  <div className="flex items-center gap-3">
                    <Button variant="danger" size="sm" loading={deletingAccount} onClick={handleDeleteAccount}>
                      <i className="fas fa-trash text-xs" /> Confirm Delete
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setConfirmDelete(true)} className="border-red-200 text-red-500 hover:bg-red-50">
                    <i className="fas fa-trash text-xs" /> Delete Account
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="border-t border-gray-100 bg-white mt-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-4 flex justify-between items-center">
          <p className="text-sm text-gray-400">&copy; 2026 Tadrebk</p>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600">
            <i className="fas fa-sign-out-alt" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
