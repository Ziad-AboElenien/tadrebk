'use client';

import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import { useAppSelector } from '@/store/store';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function StudentChangePasswordPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 mb-4">Please sign in to change your password.</p>
        <Link href="/login/student"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <Link href="/profile" className="text-sm text-primary hover:underline font-semibold flex items-center gap-1 mb-4">
          <i className="fas fa-arrow-left text-xs" /> Back to profile
        </Link>
        <h1 className="text-2xl font-black text-dark">Change Password</h1>
        <p className="text-gray-500 text-sm mt-1">Update your account password</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 shadow-sm">
        <ChangePasswordForm />
      </div>
    </div>
  );
}
