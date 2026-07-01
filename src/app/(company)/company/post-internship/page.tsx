'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import { internshipService } from '@/services/internship.service';
import { z } from 'zod';
import { internshipSchema } from '@/features/auth/schemas/auth.schemas';
type InternshipFormValues = z.output<typeof internshipSchema>;
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { getErrorMessage } from '@/lib/axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function PostInternshipPage() {
  const router = useRouter();
  const company = useAppSelector((s) => s.company.currentCompany);
  const [submitting, setSubmitting] = useState(false);
  const [technicalSkillsStr, setTechnicalSkillsStr] = useState('');
  const [softSkillsStr, setSoftSkillsStr] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(internshipSchema),
    defaultValues: {
      title: '',
      description: '',
      location: 'on-site' as const,
      workingTime: 'full-time' as const,
      softSkills: [] as string[],
      technicalSkills: [] as string[],
    },
  });

  if (!company) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Complete your company profile first.</p>
        <Link href="/company/onboarding">
          <Button>Complete Company Profile</Button>
        </Link>
      </div>
    );
  }

  async function onSubmit(data: InternshipFormValues) {
    if (!company) return;
    setSubmitting(true);
    try {
      await internshipService.createInternship(company._id, {
        ...data,
        softSkills: softSkillsStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        technicalSkills: technicalSkillsStr
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      toast.success('Internship posted successfully!');
      router.push('/company/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-black text-dark mb-8">Post a new internship</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Title"
          placeholder="e.g. Frontend Developer Intern"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Description</label>
          <textarea
            {...register('description')}
            rows={6}
            className={`w-full border rounded-xl bg-white text-gray-800 placeholder:text-gray-400 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary hover:border-gray-300 transition-all duration-200 resize-y ${errors.description ? 'border-red-400' : 'border-gray-200'}`}
            placeholder="Describe the internship responsibilities and requirements..."
          />
          {errors.description && (
            <p className="text-red-500 text-xs font-medium">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Location"
            error={errors.location?.message}
            {...register('location')}
          >
            <option value="on-site">On-site</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
          </Select>

          <Select
            label="Working time"
            error={errors.workingTime?.message}
            {...register('workingTime')}
          >
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
          </Select>
        </div>

        <Input
          label="Technical skills (comma-separated)"
          value={technicalSkillsStr}
          onChange={(e) => setTechnicalSkillsStr(e.target.value)}
          placeholder="e.g. JavaScript, React, Node.js"
        />

        <Input
          label="Soft skills (comma-separated)"
          value={softSkillsStr}
          onChange={(e) => setSoftSkillsStr(e.target.value)}
          placeholder="e.g. Communication, Teamwork, Problem-solving"
        />

        <div className="flex gap-4 pt-4">
          <Button type="submit" loading={submitting}>
            Post internship
          </Button>
          <Link href="/company/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
