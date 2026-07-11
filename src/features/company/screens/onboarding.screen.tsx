'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  companyOnboardingSchema,
  type CompanyOnboardingFormData,
} from '@/features/auth/schemas/auth.schemas';
import { companyService } from '@/features/company/services/company.service';
import { getErrorMessage } from '@/lib/axios';
import { useAppDispatch } from '@/store/store';
import { setCompany } from '@/store/companySlice';
import { setRole } from '@/store/authSlice';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { COMPANY_INDUSTRIES } from '@/lib/constants';

export default function CompanyOnboardingScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [legalFile, setLegalFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CompanyOnboardingFormData>({
    resolver: zodResolver(companyOnboardingSchema),
  });

  async function onSubmit(data: CompanyOnboardingFormData) {
    if (!legalFile) {
      toast.error('Legal document is required');
      return;
    }

    try {
      const company = await companyService.createCompany({
        name: data.name,
        description: data.description,
        industry: data.industry,
        address: data.address,
        numberOfEmployees: data.numberOfEmployees,
        companyEmail: data.companyEmail,
        legalAttachment: legalFile,
      });

      dispatch(setCompany(company));
      dispatch(setRole('company'));
      toast.success('Company profile created successfully!');
      router.push('/company/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
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
