'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Image as ImageIcon, Info } from 'lucide-react';
import { useAppDispatch } from '@/store/store';
import { setCompany } from '@/store/companySlice';
import {
  companySettingsSchema,
  type CompanySettingsFormData,
} from '@/features/auth/schemas/auth.schemas';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ImageMenu from '@/components/ui/ImageMenu';
import dynamic from 'next/dynamic';
import LocationPickerField from '@/components/ui/LocationPickerField';
import { companyService } from '@/features/company/services/company.service';
import { COMPANY_INDUSTRIES } from '@/lib/constants';
import { useBlankImage } from '@/lib/use-blank-image';
import { getCompanyImgUrl, parseLocation, type Company } from '@/features/company/types';
import { getErrorMessage } from '@/lib/axios';
import { toastHelper } from '@/lib/toast';

const ImageCropperModal = dynamic(() => import('@/components/ui/ImageCropperModal'), { ssr: false });

export default function CompanyEditProfile({ company }: { company: Company }) {
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [cropTarget, setCropTarget] = useState<'logo' | 'cover' | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const coverBlank = useBlankImage(getCompanyImgUrl(company.coverPicture));
  const logoBlank = useBlankImage(getCompanyImgUrl(company.logo));

  // NOTE: the parent mounts this panel fresh per company (key={company._id}),
  // so defaultValues (no syncing effect) always reflect the latest company.
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: company.name || '',
      description: company.description || '',
      headline: company.headline || '',
      industry: company.industry || '',
      address: company.address || '',
      location: {
        lat: company.location?.lat != null ? String(company.location.lat) : '',
        lng: company.location?.lng != null ? String(company.location.lng) : '',
      },
      companyEmail: company.companyEmail || '',
      numberOfEmployees: company.numberOfEmployees || '',
      website: company.website || '',
      linkedin: company.linkedin || '',
      foundedYear: company.foundedYear != null ? String(company.foundedYear) : '',
    },
  });

  const wIndustry = watch('industry');
  const wLocLat = watch('location.lat');
  const wLocLng = watch('location.lng');
  const wDescription = watch('description') || '';

  async function onSubmit(data: CompanySettingsFormData) {
    const industry = data.industry === 'Other' ? data.customIndustry?.trim() : data.industry;
    if (data.industry === 'Other' && !industry) {
      setError('customIndustry', { message: 'Please specify your industry' });
      return;
    }
    setSaving(true);
    try {
      const updated = await companyService.updateCompany(company._id, {
        name: data.name,
        description: data.description,
        headline: data.headline?.trim() || undefined,
        industry: industry || data.industry,
        address: data.address,
        location: parseLocation(data.location?.lat, data.location?.lng),
        companyEmail: data.companyEmail,
        numberOfEmployees: data.numberOfEmployees,
        website: data.website?.trim() || undefined,
        linkedin: data.linkedin?.trim() || undefined,
        foundedYear: data.foundedYear?.trim() ? Number(data.foundedYear.trim()) : undefined,
      });
      dispatch(setCompany(updated));
      toastHelper.success('Company profile saved!');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function onFileSelect(e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'cover') {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropSrc(URL.createObjectURL(file));
    setCropTarget(target);
    e.target.value = '';
  }

  async function uploadCroppedBlob(blob: Blob, target: 'logo' | 'cover') {
    const file = new File([blob], `${target}.jpg`, { type: 'image/jpeg' });
    if (target === 'logo') {
      setUploadingLogo(true);
      try {
        const url = await companyService.uploadLogo(company._id, file);
        dispatch(setCompany({ ...company, logo: url }));
        toastHelper.success('Logo uploaded!');
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setUploadingLogo(false);
      }
    } else {
      setUploadingCover(true);
      try {
        const url = await companyService.uploadCoverPicture(company._id, file);
        dispatch(setCompany({ ...company, coverPicture: url }));
        toastHelper.success('Cover image uploaded!');
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setUploadingCover(false);
      }
    }
  }

  async function handleRemoveImage(target: 'logo' | 'cover') {
    if (target === 'logo') {
      setUploadingLogo(true);
      try {
        await companyService.clearLogo(company._id);
        const fresh = await companyService.getCompanyById(company._id);
        dispatch(setCompany(fresh));
        toastHelper.success('Logo removed');
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setUploadingLogo(false);
      }
    } else {
      setUploadingCover(true);
      try {
        await companyService.clearCoverPicture(company._id);
        const fresh = await companyService.getCompanyById(company._id);
        dispatch(setCompany(fresh));
        toastHelper.success('Cover image removed');
      } catch (err) {
        toastHelper.error(getErrorMessage(err));
      } finally {
        setUploadingCover(false);
      }
    }
  }

  const logoUrl = getCompanyImgUrl(company.logo);
  const coverUrl = getCompanyImgUrl(company.coverPicture);

  return (
    <div className="space-y-6">
      {/* ============ brand ============ */}
      <section>
        <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
          <ImageIcon size={16} className="text-emerald-500" /> Brand
        </h3>
        <p className="mb-4 text-sm text-slate-400">Logo and cover students see everywhere.</p>

        <div className="relative h-32 overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 sm:h-36">
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
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-2xl text-slate-300 ring-4 ring-white">
              {logoBlank.showImage && logoUrl ? (
                <img src={logoUrl} alt={company.name} className="h-full w-full object-contain" onLoad={logoBlank.onImgLoad} />
              ) : (
                <Building2 size={30} />
              )}
            </div>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFileSelect(e, 'logo')}
            />
            <div className="absolute -bottom-1 -right-1">
              <ImageMenu
                onEdit={() => logoRef.current?.click()}
                onDelete={logoUrl ? () => handleRemoveImage('logo') : undefined}
                loading={uploadingLogo}
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-slate-900">{company.name}</p>
            <p className="truncate text-xs text-slate-400">
              {company.approvedByAdmin ? 'Approved company' : 'Pending admin approval'}
            </p>
          </div>
        </div>
      </section>

      {/* ============ details ============ */}
      <form onSubmit={handleSubmit(onSubmit)} className="border-t border-slate-100 pt-6">
        <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
          <Building2 size={16} className="text-emerald-500" /> Company details
        </h3>
        <p className="mb-4 text-sm text-slate-400">Public information on your profile.</p>

        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Company name" error={errors.name?.message} {...register('name')} />
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

          <Input
            label="Headline"
            placeholder="e.g. Building payment infrastructure for MENA"
            error={errors.headline?.message}
            {...register('headline')}
          />

          <div className="flex flex-col gap-1.5">
            <label className="flex items-center justify-between text-sm font-semibold text-slate-700">
              Description
              <span className={`text-xs font-normal ${wDescription.length > 80 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {wDescription.length}/80+ for a complete profile
              </span>
            </label>
            <textarea
              {...register('description')}
              rows={5}
              placeholder="What does your company do? What will interns work on and learn?"
              className={`w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${
                errors.description ? 'border-red-400' : 'border-slate-200'
              }`}
            />
            {errors.description && (
              <p className="text-xs font-medium text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Address"
              error={errors.address?.message}
              leftIcon={<i className="fas fa-location-dot text-slate-400" />}
              {...register('address')}
            />
            <Input
              label="Company email"
              type="email"
              error={errors.companyEmail?.message}
              leftIcon={<i className="fas fa-envelope text-slate-400" />}
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
            <p className="mt-1 text-xs text-slate-400">
              Leave empty to remove the Google Maps link from your public profile.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Website"
              placeholder="https://example.com"
              error={errors.website?.message}
              leftIcon={<i className="fas fa-globe text-slate-400" />}
              {...register('website')}
            />
            <Input
              label="LinkedIn"
              placeholder="https://linkedin.com/company/…"
              error={errors.linkedin?.message}
              leftIcon={<i className="fab fa-linkedin text-slate-400" />}
              {...register('linkedin')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Number of employees"
              placeholder="e.g. 51–200"
              error={errors.numberOfEmployees?.message}
              leftIcon={<i className="fas fa-users text-slate-400" />}
              {...register('numberOfEmployees')}
            />
            <Input
              label="Founded year"
              placeholder="e.g. 2018"
              inputMode="numeric"
              error={errors.foundedYear?.message}
              leftIcon={<i className="fas fa-calendar text-slate-400" />}
              {...register('foundedYear')}
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <Info size={13} />
              {isDirty ? 'You have unsaved changes.' : 'All changes saved.'}
            </p>
            <Button loading={saving} type="submit">
              Save changes
            </Button>
          </div>
        </div>
      </form>

      {cropSrc && cropTarget && (
        <ImageCropperModal
          src={cropSrc}
          aspect={cropTarget === 'logo' ? 1 : 16 / 9}
          title={cropTarget === 'logo' ? 'Crop logo' : 'Crop cover photo'}
          onCrop={(blob) => {
            uploadCroppedBlob(blob, cropTarget);
            setCropSrc(null);
            setCropTarget(null);
          }}
          onCancel={() => {
            setCropSrc(null);
            setCropTarget(null);
          }}
        />
      )}
    </div>
  );
}

