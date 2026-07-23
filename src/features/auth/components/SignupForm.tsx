'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { signupSchema, type SignupFormData } from '@/features/auth/schemas/auth.schemas';
import * as authService from '@/features/auth/server/auth.service';
import { getErrorMessage } from '@/lib/axios';
import { LS_PENDING_EMAIL } from '@/lib/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { useGoogleAuth } from '@/features/auth/hooks/useGoogleAuth';

const universityOptions = [
  { value: 'Cairo University', label: 'Cairo University' },
  { value: 'Ain Shams University', label: 'Ain Shams University' },
  { value: 'Alexandria University', label: 'Alexandria University' },
  { value: 'Helwan University', label: 'Helwan University' },
  { value: 'Mansoura University', label: 'Mansoura University' },
  { value: 'Assiut University', label: 'Assiut University' },
  { value: 'Zagazig University', label: 'Zagazig University' },
  { value: 'Suez Canal University', label: 'Suez Canal University' },
  { value: 'AUC', label: 'American University in Cairo (AUC)' },
  { value: 'GUC', label: 'German University in Cairo (GUC)' },
  { value: 'BUE', label: 'British University in Egypt (BUE)' },
  { value: 'MTI University', label: 'MTI University' },
  { value: 'MIU', label: 'Misr International University' },
  { value: 'Other', label: 'Other' },
];

const fieldOfStudyOptions = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Computer Engineering', label: 'Computer Engineering' },
  { value: 'Information Technology', label: 'Information Technology' },
  { value: 'Information Systems', label: 'Information Systems' },
  { value: 'Software Engineering', label: 'Software Engineering' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Mass Communication', label: 'Mass Communication' },
  { value: 'Medicine', label: 'Medicine' },
  { value: 'Pharmacy', label: 'Pharmacy' },
  { value: 'Nursing', label: 'Nursing' },
  { value: 'Law', label: 'Law' },
  { value: 'Architecture', label: 'Architecture' },
  { value: 'Design', label: 'Design' },
  { value: 'Other', label: 'Other' },
];

const degreeOptions = [
  { value: 'Bachelor', label: "Bachelor's" },
  { value: 'Master', label: "Master's" },
  { value: 'PhD', label: 'PhD' },
  { value: 'Diploma', label: 'Diploma' },
  { value: 'High School', label: 'High School' },
];

const gradeOptions = [
  { value: '3.7-4.0', label: '3.7 - 4.0 (Excellent)' },
  { value: '3.3-3.69', label: '3.3 - 3.69 (Very Good)' },
  { value: '2.7-3.29', label: '2.7 - 3.29 (Good)' },
  { value: '2.3-2.69', label: '2.3 - 2.69 (Above Average)' },
  { value: '2.0-2.29', label: '2.0 - 2.29 (Average)' },
  { value: 'Below 2.0', label: 'Below 2.0' },
];

const startDateOptions = Array.from({ length: 11 }, (_, i) => {
  const year = 2026 - i;
  return { value: `${year}-09-01`, label: `September ${year}` };
});

interface SignupFormProps {
  role: 'student' | 'company';
}

export default function SignupForm({ role }: SignupFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signInWithGoogle } = useGoogleAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  async function onSubmit(data: SignupFormData) {
    if (!isCompany) {
      const missing: string[] = [];
      if (!data.university) missing.push('University');
      if (!data.fieldOfStudy) missing.push('Field of Study');
      if (!data.degree) missing.push('Degree');
      if (!data.grade) missing.push('Grade');
      if (!data.startDate) missing.push('Start Date');
      if (missing.length > 0) {
        toast.error(`Please fill in: ${missing.join(', ')}`);
        return;
      }
    }
    try {
      await authService.signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        phone: data.phone || undefined,
        education: !isCompany && data.university
          ? [{
              institution: data.university,
              degree: data.degree!,
              field: data.fieldOfStudy!,
              grade: data.grade!,
              startDate: data.startDate!,
            }]
          : undefined,
      });
      // Store pending email for the confirm-email page
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_PENDING_EMAIL, data.email);
      }
      toast.success('Account created! Please check your email for the OTP.');
      router.push('/confirm-email');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  }

  const isCompany = role === 'company';

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCompany ? 'bg-gray-100' : 'bg-emerald-50'}`}>
            <i className={`${isCompany ? 'fas fa-building text-gray-600' : 'fas fa-graduation-cap text-primary'} text-sm`} />
          </div>
          <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {isCompany ? 'Company' : 'Student'} Sign Up
          </span>
        </div>
        <h1 className="text-3xl font-black text-dark mb-2">Create your account</h1>
        <p className="text-gray-400 text-sm">
          {isCompany
            ? "You'll set up your company profile after confirming your email."
            : 'Join thousands of students finding their dream internships.'}
        </p>
      </div>

      {/* Google Auth */}
      <button
        type="button"
        id="google-signup-btn"
        onClick={signInWithGoogle}
        className="w-full flex items-center justify-center gap-3 border-2 border-gray-100 hover:border-gray-200 bg-white py-3 rounded-xl font-semibold text-sm text-gray-700 transition-all mb-6 hover:shadow-sm"
      >
        <i className="fab fa-google text-lg" style={{ color: '#4285F4' }} />
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-300 font-medium">or sign up with email</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First name"
            id="signup-firstName"
            placeholder="Ahmed"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last name"
            id="signup-lastName"
            placeholder="Hassan"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Email address"
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          leftIcon={<i className="fas fa-envelope text-sm" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone number (optional)"
          id="signup-phone"
          type="tel"
          placeholder="01012345678"
          leftIcon={<i className="fas fa-phone text-sm" />}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Password"
          id="signup-password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Min. 8 chars, 1 uppercase, 1 number"
          leftIcon={<i className="fas fa-lock text-sm" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={`fas fa-eye${showPassword ? '-slash' : ''} text-sm`} />
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm password"
          id="signup-confirmPassword"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repeat your password"
          leftIcon={<i className="fas fa-lock text-sm" />}
          rightElement={
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              <i className={`fas fa-eye${showConfirm ? '-slash' : ''} text-sm`} />
            </button>
          }
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Academic Info - Student only */}
        {!isCompany && (
          <>
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Academic Information</p>
            </div>

            <Select
              label="University"
              id="signup-university"
              placeholder="Select your university"
              options={universityOptions}
              error={errors.university?.message}
              value={watch('university') ?? ''}
              onChange={(e) => setValue('university', e.target.value, { shouldValidate: true })}
            />

            <Select
              label="Field of Study"
              id="signup-fieldOfStudy"
              placeholder="Select your field"
              options={fieldOfStudyOptions}
              error={errors.fieldOfStudy?.message}
              value={watch('fieldOfStudy') ?? ''}
              onChange={(e) => setValue('fieldOfStudy', e.target.value, { shouldValidate: true })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Degree"
                id="signup-degree"
                placeholder="Select degree"
                options={degreeOptions}
                error={errors.degree?.message}
                value={watch('degree') ?? ''}
                onChange={(e) => setValue('degree', e.target.value, { shouldValidate: true })}
              />
              <Select
                label="Grade / GPA"
                id="signup-grade"
                placeholder="Select grade"
                options={gradeOptions}
                error={errors.grade?.message}
                value={watch('grade') ?? ''}
                onChange={(e) => setValue('grade', e.target.value, { shouldValidate: true })}
              />
            </div>

            <Select
              label="Start Date"
              id="signup-startDate"
              placeholder="When did you start?"
              options={startDateOptions}
              error={errors.startDate?.message}
              value={watch('startDate') ?? ''}
              onChange={(e) => setValue('startDate', e.target.value, { shouldValidate: true })}
            />
          </>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          id="signup-submit-btn"
          className="mt-2"
        >
          Create Account
        </Button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-gray-400 text-sm mt-6">
        Already have an account?{' '}
        <Link
          href={`/login/${role}`}
          className="text-primary font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>

      {/* Switch role */}
      <p className="text-center text-gray-300 text-xs mt-3">
        {isCompany ? (
          <>
            Signing up as a student?{' '}
            <Link href="/signup/student" className="text-gray-400 hover:text-primary transition-colors">
              Switch here
            </Link>
          </>
        ) : (
          <>
            Are you a company?{' '}
            <Link href="/signup/company" className="text-gray-400 hover:text-primary transition-colors">
              Switch here
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
