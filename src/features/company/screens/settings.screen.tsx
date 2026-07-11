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
import { companyService } from '@/features/company/services/company.service';
import { COMPANY_INDUSTRIES } from '@/lib/constants';
import { getImgUrl } from '@/features/company/types';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';

export default function CompanySettingsScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const company = useAppSelector((s) => s.company.currentCompany);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        description: company.description || '',
        industry: company.industry || '',
        address: company.address || '',
        companyEmail: company.companyEmail || '',
        numberOfEmployees: company.numberOfEmployees || '',
      });
    }
  }, [company, reset]);

  async function onSubmit(data: CompanySettingsFormData) {
    if (!company) return;
    setSaving(true);
    try {
      const updated = await companyService.updateCompany(company._id, data);
      dispatch(setCompany(updated));
      toast.success('Company settings saved!');
      router.push('/company/profile');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    setUploadingLogo(true);
    try {
      const url = await companyService.uploadLogo(company._id, file);
      dispatch(setCompany({ ...company, logo: url }));
      toast.success('Logo uploaded!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingLogo(false);
      if (logoRef.current) logoRef.current.value = '';
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    setUploadingCover(true);
    try {
      const url = await companyService.uploadCoverPicture(company._id, file);
      dispatch(setCompany({ ...company, coverPicture: url }));
      toast.success('Cover image uploaded!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploadingCover(false);
      if (coverRef.current) coverRef.current.value = '';
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

  const logoUrl = getImgUrl(company.logo);
  const coverUrl = getImgUrl(company.coverPicture);
  const initials = company.name.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto max-w-4xl px-4 sm:px-8 py-8">

        {/* Back */}
        <Link href="/company/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <i className="fas fa-arrow-left text-xs" /> Back to Dashboard
        </Link>

        {/* ── Cover Hero ── */}
        <div className="relative h-44 sm:h-52 rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20">
          {coverUrl ? (
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5" />
          )}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
          <div className="absolute top-4 right-4 z-10">
            <input ref={coverRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
            <button
              onClick={() => coverRef.current?.click()}
              disabled={uploadingCover}
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              {uploadingCover ? (
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <i className="fas fa-camera text-xs" />
              )}
              {uploadingCover ? 'Uploading...' : 'Change cover'}
            </button>
          </div>
        </div>

        {/* ── Logo + Company Header ── */}
        <div className="relative px-4 sm:px-6 -mt-10 mb-8">
          <div className="flex items-end gap-4">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
                {logoUrl ? (
                  <img src={logoUrl} alt={company.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white select-none">{initials}</span>
                )}
              </div>
              <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              <button
                onClick={() => logoRef.current?.click()}
                disabled={uploadingLogo}
                className="absolute inset-0 w-full h-full rounded-2xl bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm text-gray-700 text-xs font-semibold px-2 py-1 rounded-lg flex items-center gap-1">
                  {uploadingLogo ? (
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <i className="fas fa-camera" />
                  )}
                  {uploadingLogo ? '...' : 'Change'}
                </span>
              </button>
            </div>
            <div className="pb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-dark">{company.name}</h1>
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
    </div>
  );
}
