'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toastHelper } from '@/lib/toast';
import {
  companyOnboardingSchema,
  type CompanyOnboardingFormData,
} from '@/features/auth/schemas/auth.schemas';
import { companyService } from '@/features/company/services/company.service';
import { parseLocation } from '@/features/company/types';
import { getErrorMessage } from '@/lib/axios';
import { useAppDispatch, useAppSelector } from '@/store/store';
import { setCompany } from '@/store/companySlice';
import { setRole } from '@/store/authSlice';
import { LS_PENDING_ONBOARDING, COMPANY_INDUSTRIES } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import LocationPickerField from '@/components/ui/LocationPickerField';

export default function CompanyOnboardingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const company = useAppSelector((s) => s.company.currentCompany);
  const [legalFile, setLegalFile] = useState<File | null>(null);

  // Already have a company → go to dashboard
  useEffect(() => {
    if (company?._id) {
      localStorage.removeItem(LS_PENDING_ONBOARDING);
      router.replace('/company/dashboard');
    }
  }, [company?._id, router]);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyOnboardingFormData>({
    resolver: zodResolver(companyOnboardingSchema),
  });

  const wLocLat = watch('location.lat');
  const wLocLng = watch('location.lng');

  async function onSubmit(data: CompanyOnboardingFormData) {
    if (!legalFile) {
      toastHelper.error('Legal document is required');
      return;
    }

    try {
      const company = await companyService.createCompany({
        name: data.name,
        description: data.description,
        industry: data.industry,
        address: data.address,
        location: parseLocation(data.location?.lat, data.location?.lng),
        numberOfEmployees: data.numberOfEmployees,
        companyEmail: data.companyEmail,
        legalAttachment: legalFile,
      });

      dispatch(setCompany(company));
      dispatch(setRole('company'));
      localStorage.removeItem(LS_PENDING_ONBOARDING);
      toastHelper.success('Company profile created successfully!');
      router.push('/company/dashboard');
    } catch (err) {
      toastHelper.error(getErrorMessage(err));
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Step 2 of 2
        </span>
        <h1 className="text-3xl font-black text-dark mt-2 mb-2">
          Complete your company profile
        </h1>
        <p className="text-gray-500 text-sm">
          Sign in first, then submit your company details for review.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4"
        noValidate
      >
        <Input
          label="Company name"
          placeholder="Acme Corp"
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Description
          </label>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary min-h-[100px]"
            placeholder="Tell students about your company..."
            {...register('description')}
          />
          {errors.description && (
            <p className="text-red-500 text-xs font-medium mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        <Controller
          name="industry"
          control={control}
          render={({ field }) => (
            <Select
              label="Industry"
              placeholder="Select industry"
              options={COMPANY_INDUSTRIES.map((i) => ({
                value: i.value,
                label: i.label,
              }))}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.industry?.message}
            />
          )}
        />

        <Input
          label="Address"
          placeholder="123 Main St, Cairo"
          error={errors.address?.message}
          {...register('address')}
        />

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
          <p className="text-xs text-gray-400 mt-1">Your company will appear with a Google Maps link on your public profile.</p>
        </div>

        <Input
          label="Number of employees"
          placeholder="e.g. 50-100"
          error={errors.numberOfEmployees?.message}
          {...register('numberOfEmployees')}
        />

        <Input
          label="Company email"
          type="email"
          placeholder="hr@company.com"
          error={errors.companyEmail?.message}
          {...register('companyEmail')}
        />

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1.5">
            Legal attachment (required)
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-primary file:font-semibold"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setLegalFile(file);
              if (file) setValue('legalAttachment', file, { shouldValidate: true });
            }}
          />
          {errors.legalAttachment && (
            <p className="text-red-500 text-xs font-medium mt-1">
              Legal document is required
            </p>
          )}
        </div>

        <Button type="submit" fullWidth size="lg" loading={isSubmitting}>
          Submit for review
        </Button>
      </form>
    </div>
  );
}
