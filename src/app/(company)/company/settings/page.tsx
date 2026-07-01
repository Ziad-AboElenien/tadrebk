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
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Spinner from '@/components/ui/Spinner';
import { companyService } from '@/services/company.service';
import { COMPANY_INDUSTRIES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';

export default function CompanySettingsPage() {
  const dispatch = useAppDispatch();
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
    formState: { errors },
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
  });

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

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <h1 className="text-2xl font-black text-dark">Company settings</h1>

      {/* Logo & Cover */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
        <h2 className="font-bold text-dark text-lg">Branding</h2>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Logo</p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
              {company.name.substring(0, 2).toUpperCase()}
            </div>
            <input
              ref={logoRef}
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              loading={uploadingLogo}
              onClick={() => logoRef.current?.click()}
            >
              Upload Logo
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Cover Image</p>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            loading={uploadingCover}
            onClick={() => coverRef.current?.click()}
          >
            Upload Cover
          </Button>
        </div>
      </section>

      {/* Company Details */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
        <h2 className="font-bold text-dark text-lg">Company details</h2>

        <Input
          label="Company name"
          error={errors.name?.message}
          {...register('name')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className={`w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200 resize-y ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs font-medium">{errors.description.message}</p>
          )}
        </div>

        <Select
          label="Industry"
          placeholder="Select industry"
          error={errors.industry?.message}
          {...register('industry')}
        >
          {COMPANY_INDUSTRIES.map((ind) => (
            <option key={ind.value} value={ind.value}>
              {ind.label}
            </option>
          ))}
        </Select>

        <Input
          label="Address"
          error={errors.address?.message}
          {...register('address')}
        />

        <Input
          label="Company email"
          type="email"
          error={errors.companyEmail?.message}
          {...register('companyEmail')}
        />

        <Input
          label="Number of employees"
          error={errors.numberOfEmployees?.message}
          {...register('numberOfEmployees')}
        />

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button loading={saving} type="submit">
            Save changes
          </Button>
        </div>
      </form>

      {/* Account Settings */}
      <section className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-dark text-lg flex items-center gap-2">
          <i className="fas fa-lock text-primary text-base" />
          Account
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/company/change-password">
            <Button variant="outline" size="sm">
              <i className="fas fa-key text-xs" />
              Change password
            </Button>
          </Link>
          <Link href="/company/change-email">
            <Button variant="outline" size="sm">
              <i className="fas fa-envelope text-xs" />
              Change email
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
