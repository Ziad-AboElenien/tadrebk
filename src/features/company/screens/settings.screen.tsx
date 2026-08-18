'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector, useAppDispatch } from '@/store/store';
import { setCompany } from '@/store/companySlice';
import {
  companySettingsSchema,
  type CompanySettingsFormData,
} from '@/features/auth/schemas/auth.schemas';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ImageMenu from '@/components/ui/ImageMenu';
import dynamic from 'next/dynamic';
const ImageCropperModal = dynamic(() => import('@/components/ui/ImageCropperModal'), { ssr: false });
import LocationPickerField from '@/components/ui/LocationPickerField';
import { companyService } from '@/features/company/services/company.service';
import { COMPANY_INDUSTRIES } from '@/lib/constants';
import { useBlankImage } from '@/lib/use-blank-image';
import { getCompanyImgUrl, parseLocation } from '@/features/company/types';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

export default function CompanySettingsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const company = useAppSelector((s) => s.company.currentCompany);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [cropTarget, setCropTarget] = useState<'logo' | 'cover' | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const coverBlank = useBlankImage(company ? getCompanyImgUrl(company.coverPicture) : null);
  const logoBlank = useBlankImage(company ? getCompanyImgUrl(company.logo) : null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
  });

  const wIndustry = watch('industry');
  const wLocLat = watch('location.lat');
  const wLocLng = watch('location.lng');

  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        description: company.description || '',
        industry: company.industry || '',
        address: company.address || '',
        location: {
          lat: company.location?.lat != null ? String(company.location.lat) : '',
          lng: company.location?.lng != null ? String(company.location.lng) : '',
        },
        companyEmail: company.companyEmail || '',
        numberOfEmployees: company.numberOfEmployees || '',
      });
    }
  }, [company, reset]);

  async function onSubmit(data: CompanySettingsFormData) {
    if (!company) return;
    const industry = data.industry === 'Other' ? data.customIndustry?.trim() : data.industry;
    if (data.industry === 'Other' && !industry) {
      toastHelper.error('Please specify your industry');
      return;
    }
    setSaving(true);
    try {
      const updated = await companyService.updateCompany(company._id, {
        name: data.name,
        description: data.description,
        industry: industry || data.industry,
        address: data.address,
        location: parseLocation(data.location?.lat, data.location?.lng),
        companyEmail: data.companyEmail,
        numberOfEmployees: data.numberOfEmployees,
      });
      dispatch(setCompany(updated));
      toastHelper.success('Company settings saved!');
      router.push('/company/profile');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'cover') {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropSrc(url);
    setCropTarget(target);
    e.target.value = '';
  }

  async function uploadCroppedBlob(blob: Blob, target: 'logo' | 'cover') {
    if (!company) return;
    const file = new File([blob], `${target}.jpg`, { type: 'image/jpeg' });
    if (target === 'logo') {
      setUploadingLogo(true);
      try {
        const url = await companyService.uploadLogo(company._id, file);
        dispatch(setCompany({ ...company, logo: url }));
        toastHelper.success('Logo uploaded!');
      } catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setUploadingLogo(false); }
    } else {
      setUploadingCover(true);
      try {
        const url = await companyService.uploadCoverPicture(company._id, file);
        dispatch(setCompany({ ...company, coverPicture: url }));
        toastHelper.success('Cover image uploaded!');
      } catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setUploadingCover(false); }
    }
  }

  async function handleRemoveImage(target: 'logo' | 'cover') {
    if (!company) return;
    if (target === 'logo') {
      setUploadingLogo(true);
      try {
        const url = await companyService.clearLogo(company._id);
        dispatch(setCompany({ ...company, logo: url }));
        const fresh = await companyService.getCompanyById(company._id);
        dispatch(setCompany(fresh));
        toastHelper.success('Logo removed');
      } catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setUploadingLogo(false); }
    } else {
      setUploadingCover(true);
      try {
        const url = await companyService.clearCoverPicture(company._id);
        dispatch(setCompany({ ...company, coverPicture: url }));
        const fresh = await companyService.getCompanyById(company._id);
        dispatch(setCompany(fresh));
        toastHelper.success('Cover image removed');
      } catch (err) { toastHelper.error(getErrorMessage(err)); } finally { setUploadingCover(false); }
    }
  }

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">No company profile found.</p>
        <Link href="/company/onboarding">
          <Button>Complete Company Profile</Button>
        </Link>
      </div>
    );
  }

  const logoUrl = getCompanyImgUrl(company.logo);
  const coverUrl = getCompanyImgUrl(company.coverPicture);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 sm:px-8 py-8">

        {/* Back */}
        <Link href="/company/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <i className="fas fa-arrow-left text-xs" /> Back to Dashboard
        </Link>

        {/* ── Cover Hero ── */}
        <div className="relative h-44 sm:h-52 rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20">
          {coverBlank.showImage ? (
            <img src={coverUrl!} alt="Cover" className="w-full h-full object-cover" onLoad={coverBlank.onImgLoad} />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5" />
          )}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
          <div className="absolute top-4 right-4 z-10">
            <input ref={coverRef} id="company-cover-input" type="file" accept="image/*" onChange={(e) => onFileSelect(e, 'cover')} className="hidden" />
            <ImageMenu
              onEdit={() => coverRef.current?.click()}
              onDelete={coverUrl ? () => handleRemoveImage('cover') : undefined}
              loading={uploadingCover}
            />
          </div>
        </div>

        {/* ── Logo + Company Header ── */}
        <div className="relative px-4 sm:px-6 -mt-10 mb-8">
          <div className="flex items-end gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl bg-gray-100 flex items-center justify-center">
                {logoBlank.showImage ? (
                  <img src={logoUrl!} alt={company.name} className="w-full h-full object-cover" onLoad={logoBlank.onImgLoad} />
                ) : (
                  <i className="fas fa-building text-3xl text-gray-300" />
                )}
              </div>
              <input ref={logoRef} id="company-logo-input" type="file" accept="image/*" onChange={(e) => onFileSelect(e, 'logo')} className="hidden" />
              <div className="absolute -bottom-1 -right-1">
                <ImageMenu
                  onEdit={() => logoRef.current?.click()}
                  onDelete={logoUrl ? () => handleRemoveImage('logo') : undefined}
                  loading={uploadingLogo}
                />
              </div>
            </div>
            <div className="pb-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-black text-dark truncate">{company.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-0.5 text-sm text-gray-500">
                {company.industry && (
                  <span className="flex items-center gap-1.5"><i className="fas fa-building text-gray-300 text-xs" />{company.industry}</span>
                )}
                {company.companyEmail && (
                  <span className="flex items-center gap-1.5"><i className="fas fa-envelope text-gray-300 text-xs" />{company.companyEmail}</span>
                )}
                {company.approvedByAdmin === false && (
                  <span className="flex items-center gap-1.5 text-amber-600"><i className="fas fa-clock text-xs" />Pending approval</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Company Details Form ── */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <i className="fas fa-building" />
            </div>
            <div>
              <h2 className="font-bold text-dark">Company details</h2>
              <p className="text-xs text-gray-400">Update your company information</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Company name"
                error={errors.name?.message}
                {...register('name')}
              />
              <Select
                label="Industry"
                placeholder="Select industry"
                error={errors.industry?.message}
                value={wIndustry}
                onChange={(e) => setValue('industry', e.target.value, { shouldValidate: true })}
                options={COMPANY_INDUSTRIES.map((ind) => ({ value: ind.value, label: ind.label }))}
              />
            </div>

            {wIndustry === 'Other' && (
              <Input
                label="Specify your industry"
                placeholder="e.g. Logistics, Construction, Tourism..."
                error={errors.customIndustry?.message}
                {...register('customIndustry')}
              />
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                {...register('description')}
                rows={4}
                className={`w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200 resize-y ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="Tell us about your company..."
              />
              {errors.description && (
                <p className="text-red-500 text-xs font-medium">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Address"
                error={errors.address?.message}
                leftIcon={<i className="fas fa-location-dot text-gray-400" />}
                {...register('address')}
              />
              <Input
                label="Company email"
                type="email"
                error={errors.companyEmail?.message}
                leftIcon={<i className="fas fa-envelope text-gray-400" />}
                {...register('companyEmail')}
              />
            </div>

            <div>
              <LocationPickerField
                label="Location on map (optional)"
                lat={wLocLat}
                lng={wLocLng}
                onChange={(la, ln) => {
                  setValue('location.lat', la, { shouldValidate: true });
                  setValue('location.lng', ln, { shouldValidate: true });
                }}
              />
              <p className="text-xs text-gray-400 mt-1">Leave empty to remove the Google Maps link from your public profile.</p>
            </div>

            <Input
              label="Number of employees"
              error={errors.numberOfEmployees?.message}
              leftIcon={<i className="fas fa-users text-gray-400" />}
              {...register('numberOfEmployees')}
            />

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button loading={saving} type="submit" leftIcon={<i className="fas fa-check text-xs" />}>
                Save changes
              </Button>
            </div>
          </div>
        </form>

        {/* ── Account Section ── */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <i className="fas fa-shield-halved" />
            </div>
            <div>
              <h2 className="font-bold text-dark">Account security</h2>
              <p className="text-xs text-gray-400">Manage your login credentials</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/company/change-password">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all p-5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <i className="fas fa-key" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark">Change password</p>
                    <p className="text-xs text-gray-400 mt-0.5">Update your password regularly</p>
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/company/change-email">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all p-5 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
                    <i className="fas fa-envelope" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark">Change email</p>
                    <p className="text-xs text-gray-400 mt-0.5">Update your company email</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

      </main>

      {cropSrc && cropTarget && (
        <ImageCropperModal
          src={cropSrc}
          aspect={cropTarget === 'logo' ? 1 : 16 / 9}
          title={cropTarget === 'logo' ? 'Crop logo' : 'Crop cover photo'}
          onCrop={(blob) => { uploadCroppedBlob(blob, cropTarget); setCropSrc(null); setCropTarget(null); }}
          onCancel={() => { setCropSrc(null); setCropTarget(null); }}
        />
      )}
    </div>
  );
}
