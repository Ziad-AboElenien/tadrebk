'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { logout } from '@/store/authSlice';
import { setUser, updateUser, clearUser } from '@/store/userSlice';
import { getUserImgUrl } from '@/features/student/types';
import { CATEGORY_LABELS, type Category } from '@/features/student/types';
import { openFileProxy } from '@/lib/file-proxy';
import { profileSchema, type ProfileFormData } from '@/features/auth/schemas/auth.schemas';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ChipInput from '@/components/ui/ChipInput';
import Select from '@/components/ui/Select';
import ImageMenu from '@/components/ui/ImageMenu';
import dynamic from 'next/dynamic';
const ImageCropperModal = dynamic(() => import('@/components/ui/ImageCropperModal'), { ssr: false });
import CourseModal from '@/components/ui/CourseModal';
import { userService } from '@/features/student/services/user.service';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';
import ImageLightbox from '@/features/student/components/ImageLightbox';
import { useBlankImage } from '@/lib/use-blank-image';

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
  const [cropTarget, setCropTarget] = useState<'profile' | 'cover' | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseAdding, setCourseAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const profileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  // Open the file pickers. The menu items and the Media section buttons both
  // go through these, so there is exactly one hidden input per target and no
  // shared ref / native-label forwarding issues.
  const openProfilePicker = useCallback(() => {
    document.getElementById('profile-photo-input')?.click();
  }, []);
  const openCoverPicker = useCallback(() => {
    document.getElementById('cover-photo-input')?.click();
  }, []);

  const {
    register, handleSubmit, reset, watch, setValue, setError,
    formState: { errors },
  } = useForm<ProfileFormData>({ resolver: zodResolver(profileSchema) });

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
        skills: user.skills || [],
        categories: (user.categories as string[]) || [],
        courses: (user.courses || []).filter((c: any) => c.name && c.name.trim()).map((c: any) => ({ name: c.name })),
      });
    }
  }, [user, reset]);

  async function onSubmit(data: ProfileFormData) {
    if (!userId) return;
    setSaving(true);
    setFormError(null);
    try {
      await userService.updateProfile(userId, {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone || undefined,
        headline: data.headline || undefined,
        bio: data.bio || undefined,
        address: data.address || undefined,
        dateOfBirth: data.dateOfBirth ? `${data.dateOfBirth}T00:00:00.000Z` : undefined,
        gender: data.gender || undefined,
        skills: data.skills?.length ? data.skills : undefined,
        categories: data.categories as Category[] | undefined,
        courses: data.courses?.length ? data.courses : undefined,
      });
      const fresh = await userService.getUserProfile(userId);
      dispatch(setUser(fresh));
      setEditing(false);
      toastHelper.success('Profile updated!');
    } catch (err) {
      const msg = getErrorMessage(err);
      const fieldMap: Record<string, string> = {
        firstName: 'firstName', lastName: 'lastName', phone: 'phone',
        email: 'headline', bio: 'bio', address: 'address',
        dateOfBirth: 'dateOfBirth', gender: 'gender', skills: 'skills',
      };
      const matched = Object.keys(fieldMap).find((k) => msg.toLowerCase().includes(k));
      if (matched) {
        setError(fieldMap[matched] as any, { message: msg });
      } else {
        setFormError(msg);
      }
    } finally { setSaving(false); }
  }

  async function handleAddCourse(name: string, file?: File) {
    if (!userId) return;
    setCourseAdding(true);
    try {
      await userService.addCourse(name, file);
      const fresh = await userService.getUserProfile(userId);
      dispatch(setUser(fresh));
      setCourseModalOpen(false);
      toastHelper.success('Course added!');
    } catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setCourseAdding(false); }
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>, target: 'profile' | 'cover') {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setCropTarget(target);
    e.target.value = '';
  }

  async function uploadCroppedBlob(blob: Blob, target: 'profile' | 'cover') {
    const file = new File([blob], `${target}.jpg`, { type: 'image/jpeg' });
    if (target === 'profile') {
      setUploadingProfile(true);
      try {
        // The upload endpoint persists the picture on the user server-side;
        // PATCH /user/{id} does NOT accept profilePicture, so we refetch the
        // canonical profile instead of trying to set the field.
        const url = await userService.uploadProfilePicture(file);
        if (url) dispatch(updateUser({ profilePicture: url }));
        const fresh = await userService.getUserProfile(userId!);
        dispatch(setUser(fresh));
        toastHelper.success('Profile picture updated!');
      } catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setUploadingProfile(false); }
    } else {
      setUploadingCover(true);
      try {
        const url = await userService.uploadCoverPicture(file);
        if (url) dispatch(updateUser({ coverPicture: url }));
        const fresh = await userService.getUserProfile(userId!);
        dispatch(setUser(fresh));
        toastHelper.success('Cover picture updated!');
      } catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setUploadingCover(false); }
    }
  }

  async function handleRemoveImage(target: 'profile' | 'cover') {
    if (!userId) return;
    if (target === 'profile') {
      setUploadingProfile(true);
      try {
        await userService.clearProfilePicture();
        const fresh = await userService.getUserProfile(userId);
        dispatch(setUser(fresh));
        toastHelper.success('Profile picture removed');
      } catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setUploadingProfile(false); }
    } else {
      setUploadingCover(true);
      try {
        await userService.clearCoverPicture();
        const fresh = await userService.getUserProfile(userId);
        dispatch(setUser(fresh));
        toastHelper.success('Cover picture removed');
      } catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setUploadingCover(false); }
    }
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
      toastHelper.success('Resume uploaded!');
    }
    catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setUploadingResume(false); if (resumeRef.current) resumeRef.current.value = ''; }
  }

  async function handleDeleteAccount() {
    if (!userId) return;
    setDeletingAccount(true);
    try {
      await userService.deleteAccount(userId);
      dispatch(clearUser());
      dispatch(logout());
      router.push('/');
      toastHelper.success('Account deleted');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setDeletingAccount(false);
      setConfirmDelete(false);
    }
  }

  const handleSignOut = useCallback(() => {
    dispatch(logout());
    router.push('/');
    toastHelper.success('Signed out');
  }, [dispatch, router]);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Student';
  const profileUrl = getUserImgUrl(user?.profilePicture);
  const coverUrl = getUserImgUrl(user?.coverPicture);
  const profileBlank = useBlankImage(profileUrl);
  const coverBlank = useBlankImage(coverUrl);

  const authStatus = useAppSelector((s) => s.auth.status);
  const hydrating = authStatus === 'idle' || authStatus === 'loading';

  if (hydrating) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="mx-auto max-w-4xl px-4 sm:px-8 py-8">
          <div className="mb-6"><div className="h-4 w-40 bg-gray-200 rounded-full animate-pulse" /></div>
          <div className="relative h-48 sm:h-56 md:h-64 rounded-3xl bg-gray-100 animate-pulse" />
          <div className="relative px-4 sm:px-6 -mt-14 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="w-32 h-32 rounded-full bg-gray-200 ring-4 ring-white shadow-xl animate-pulse" />
                <div className="pb-1 space-y-2">
                  <div className="h-7 w-48 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-64 bg-gray-100 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            {[0,1,2].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="h-5 w-32 bg-gray-200 rounded-full animate-pulse mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-100 rounded-full" />
                  <div className="h-4 w-2/3 bg-gray-100 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

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
          {coverBlank.showImage ? (
            <button onClick={() => setLightbox(coverUrl!)} className="absolute inset-0 w-full h-full">
              <img src={coverUrl!} alt="Cover" className="w-full h-full object-cover" onLoad={coverBlank.onImgLoad} />
            </button>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10" />
          )}
          <div className="absolute top-4 right-4 z-10">
            <input ref={coverRef} id="cover-photo-input" type="file" accept="image/*" onChange={(e) => onFileSelect(e, 'cover')} className="hidden" />
            <ImageMenu
              onEdit={openCoverPicker}
              onDelete={coverUrl ? () => handleRemoveImage('cover') : undefined}
              loading={uploadingCover}
            />
          </div>
        </div>

        {/* Avatar + header */}
        <div className="relative px-4 sm:px-6 -mt-14 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                {profileBlank.showImage ? (
                  <button onClick={() => setLightbox(profileUrl!)} className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-white shadow-xl cursor-pointer">
                    <img src={profileUrl!} alt={displayName} className="w-full h-full object-cover" onLoad={profileBlank.onImgLoad} />
                  </button>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center ring-4 ring-white shadow-xl">
                    <i className="fas fa-user text-6xl text-gray-300" />
                  </div>
                )}
                <input ref={profileRef} id="profile-photo-input" type="file" accept="image/*" onChange={(e) => onFileSelect(e, 'profile')} className="hidden" />
                <div className="absolute -bottom-1 -right-1">
                  <ImageMenu
                    onEdit={openProfilePicker}
                    onDelete={profileUrl ? () => handleRemoveImage('profile') : undefined}
                    loading={uploadingProfile}
                  />
                </div>
              </div>
              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-dark">{displayName}</h1>
                <p className="text-gray-500 flex items-center gap-1.5 mt-0.5"><i className="fas fa-envelope text-xs" />{user.email}</p>
              </div>
            </div>
            {!editing && <Button variant="outline" size="sm" leftIcon={<i className="fas fa-pen text-xs" />} onClick={() => { setEditing(true); setFormError(null); }}>Edit profile</Button>}
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
            <Input label="Bio" error={errors.headline?.message} {...register('headline')} placeholder="e.g. Computer Science Student at Cairo University" />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">About</label>
              <textarea {...register('bio')} rows={4} className="w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200 resize-y border-gray-200" placeholder="Tell us about yourself..." />
              {errors.bio && <p className="text-red-500 text-xs font-medium">{errors.bio.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
              <Select
                label="Gender"
                error={errors.gender?.message}
                value={watch('gender') ?? ''}
                onChange={(e) => setValue('gender', e.target.value, { shouldValidate: true })}
              >
                <option value="">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </Select>
              <Input label="Address" error={errors.address?.message} {...register('address')} />
              <Input label="Date of birth" type="date" error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
            </div>
            <ChipInput label="Skills" error={errors.skills?.message} value={watch('skills') || []} onChange={(items) => setValue('skills', items, { shouldValidate: true })} placeholder="e.g. JavaScript, Python, Public Speaking" />

            {/* Categories */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-dark text-sm flex items-center gap-2 mb-1"><i className="fas fa-tags text-primary" />Categories <span className="text-gray-400 font-normal text-xs">(max 4)</span></h3>

              {/* Selected categories */}
              <div className="flex flex-wrap gap-2 mt-2">
                {(watch('categories') || []).map((cat) => (
                  <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-primary text-white border border-primary shadow-sm">
                    {CATEGORY_LABELS[cat as Category] || cat}
                    <button
                      type="button"
                      onClick={() => {
                        const current = (watch('categories') || []) as string[];
                        setValue('categories', current.filter((c) => c !== cat) as any, { shouldValidate: true });
                      }}
                      className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors"
                    >
                      <i className="fas fa-xmark text-[10px]" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2 mt-3">
                {(Object.entries(CATEGORY_LABELS) as [Category, string][]).map(([value, label]) => {
                  const selected = (watch('categories') || []).includes(value) || (watch('categories') || []).includes(label);
                  const atLimit = (watch('categories') || []).length >= 4;
                  const isOther = value === 'other';
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={selected || (atLimit && !isOther)}
                      onClick={() => {
                        if (isOther) {
                          setShowOtherInput(true);
                          return;
                        }
                        const current = (watch('categories') || []) as string[];
                        if (current.length < 4 && !selected) {
                          setValue('categories', [...current, value] as any, { shouldValidate: true });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isOther
                          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 cursor-pointer'
                          : selected
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default'
                            : atLimit
                              ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary cursor-pointer'
                      }`}
                    >
                      {selected && !isOther ? <><i className="fas fa-check text-[10px] mr-1" />{label}</> : isOther ? <><i className="fas fa-pen text-[10px] mr-1" />{label}</> : label}
                    </button>
                  );
                })}
              </div>

              {/* Custom category input */}
              {showOtherInput && (
                <div className="flex items-center gap-2 mt-3 animate-slide-up">
                  <input
                    type="text"
                    value={otherText}
                    onChange={(e) => setOtherText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = otherText.trim();
                        if (!val) return;
                        const current = (watch('categories') || []) as string[];
                        if (!current.includes(val) && current.length < 4) {
                          setValue('categories', [...current, val] as any, { shouldValidate: true });
                        }
                        setOtherText('');
                        setShowOtherInput(false);
                      }
                    }}
                    placeholder="Type your category..."
                    className="flex-1 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = otherText.trim();
                      if (!val) return;
                      const current = (watch('categories') || []) as string[];
                      if (!current.includes(val) && current.length < 4) {
                        setValue('categories', [...current, val] as any, { shouldValidate: true });
                      }
                      setOtherText('');
                      setShowOtherInput(false);
                    }}
                    className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors shrink-0"
                  >
                    <i className="fas fa-plus text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowOtherInput(false); setOtherText(''); }}
                    className="w-8 h-8 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
                  >
                    <i className="fas fa-xmark text-xs" />
                  </button>
                </div>
              )}

              {errors.categories && <p className="text-red-500 text-xs font-medium mt-1">{errors.categories.message}</p>}
            </div>

            {/* Courses */}
            <div className="border-t border-gray-100 pt-4">
              <h3 className="font-bold text-dark text-sm flex items-center gap-2 mb-3"><i className="fas fa-certificate text-primary" />Courses</h3>
              <div className="space-y-4">
                {(watch('courses') || []).map((_, i) => (
                  <div key={i} className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <input
                        {...register(`courses.${i}.name`)}
                        placeholder="Course name..."
                        className="flex-1 border border-gray-200 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const current = (watch('courses') || []) as { name: string }[];
                          setValue('courses', current.filter((_, idx) => idx !== i) as any, { shouldValidate: true });
                        }}
                        className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors shrink-0"
                      >
                        <i className="fas fa-trash text-xs" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-400">To add a new course, close editing and use the &quot;Add course&quot; button.</p>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              {formError && <p className="text-red-500 text-xs font-medium">{formError}</p>}
              <div className="flex gap-4">
                <Button loading={saving} type="submit">Save changes</Button>
                <Button variant="outline" type="button" onClick={() => { setEditing(false); setFormError(null); reset(); }}>Cancel</Button>
              </div>
            </div>
          </form>
        ) : (
          <>
            {/* Contact info — first */}
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
            {user.bio && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bold text-dark text-lg mb-3 flex items-center gap-2"><i className="fas fa-user-pen text-primary text-base" />About</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{user.bio}</p>
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
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white font-bold shrink-0">{(exp.companyName || '?')[0]?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark">{exp.internshipTitle}</p>
                      <p className="text-sm text-gray-500">{exp.companyName}</p>
                      {exp.completedAt && <p className="text-xs text-gray-400 mt-0.5">Completed {formatDate(exp.completedAt)}</p>}
                      {exp.rating != null && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: 5 }, (_, s) => (
                            <i key={s} className={`fas fa-star text-xs ${s < exp.rating! ? 'text-amber-400' : 'text-gray-200'}`} />
                          ))}
                          <span className="text-xs text-gray-400 ml-1">{exp.rating}/5</span>
                        </div>
                      )}
                      {exp.feedback && <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{exp.feedback}&rdquo;</p>}
                    </div>
                  </div>
                ))}</div>
              </div>
            )}
            {user.education && user.education.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
                <h2 className="font-bold text-dark text-lg mb-4 flex items-center gap-2"><i className="fas fa-graduation-cap text-primary text-base" />Education</h2>
                <div className="space-y-5">{user.education.map((edu, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold shrink-0">{(edu.institution || '?')[0]?.toUpperCase()}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold text-dark">{edu.institution}</p>{edu.degree && <p className="text-sm text-gray-500">{edu.degree}{edu.field ? `, ${edu.field}` : ''}</p>}{edu.grade && <p className="text-xs text-gray-400 mt-0.5">Grade: {edu.grade}</p>}{(edu.startDate || edu.endDate) && <p className="text-xs text-gray-400 mt-0.5">{formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Present'}</p>}</div>
                  </div>
                ))}</div>
              </div>
            )}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-dark text-lg flex items-center gap-2"><i className="fas fa-certificate text-primary text-base" />Courses</h2>
                <Button size="sm" onClick={() => setCourseModalOpen(true)}><i className="fas fa-plus text-xs" /> Add course</Button>
              </div>
              {user.courses && user.courses.length > 0 ? (
                <div className="space-y-3">{user.courses.map((course: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center text-white shrink-0">
                        <i className="fas fa-graduation-cap text-xs" />
                      </div>
                      <p className="font-medium text-dark text-sm truncate">{course.name}</p>
                    </div>
                    {course.certificate?.secure_url && (
                      <button onClick={() => {
                        const url = course.certificate?.certificateUrl || course.certificate?.secure_url;
                        if (!url) return;
                        const isImage = /\.(png|jpe?g|gif|webp|svg)$/i.test(url);
                        if (isImage) { window.open(url, '_blank'); return; }
                        openFileProxy(url);
                      }} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 shrink-0 cursor-pointer">
                        <i className="fas fa-eye text-xs" /> View certificate
                      </button>
                    )}
                  </div>
                ))}</div>
              ) : (
                <p className="text-sm text-gray-400">No courses yet. Add your first course to show it on your profile.</p>
              )}
            </div>

          </>
        )}

        {cropSrc && cropTarget && (
          <ImageCropperModal
            src={cropSrc}
            aspect={cropTarget === 'profile' ? 1 : 16 / 9}
            title={cropTarget === 'profile' ? 'Crop profile photo' : 'Crop cover photo'}
            onCrop={(blob) => { uploadCroppedBlob(blob, cropTarget); setCropSrc(null); setCropTarget(null); }}
            onCancel={() => { setCropSrc(null); setCropTarget(null); }}
          />
        )}

        {lightbox && <ImageLightbox src={lightbox} alt="Profile image" onClose={() => setLightbox(null)} />}

        {courseModalOpen && (
          <CourseModal
            open={courseModalOpen}
            adding={courseAdding}
            onAdd={handleAddCourse}
            onClose={() => setCourseModalOpen(false)}
          />
        )}

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
