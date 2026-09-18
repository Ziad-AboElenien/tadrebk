'use client';

import { useSearchParams } from 'next/navigation';
import { Building2, KeyRound, Mail } from 'lucide-react';
import { useAppSelector } from '@/store/store';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import ChangePasswordForm from '@/features/auth/components/ChangePasswordForm';
import ChangeEmailForm from '@/features/auth/components/ChangeEmailForm';
import SettingsShell from '@/features/profiles/components/SettingsShell';
import CompanyEditProfile from '@/features/profiles/components/CompanyEditProfile';

const TABS = [
  { key: 'edit-profile', label: 'Edit Profile', desc: 'Brand, details & location', icon: Building2 },
  { key: 'password', label: 'Change Password', desc: 'Update your password', icon: KeyRound },
  { key: 'email', label: 'Change Email', desc: 'Update account email', icon: Mail },
];

export default function CompanySettingsScreen() {
  const searchParams = useSearchParams();
  const company = useAppSelector((s) => s.company.currentCompany);
  const tab = searchParams.get('tab');

  return (
    <SettingsShell
      title="Company Settings"
      subtitle="Manage your brand, security and account."
      basePath="/company/settings"
      activeTab={tab}
      items={TABS}
    >
      {tab === 'password' && (
        <div className="mx-auto max-w-lg">
          <h3 className="mb-1 font-bold text-slate-900">Change password</h3>
          <p className="mb-5 text-sm text-slate-400">Pick a strong, unique password.</p>
          <ChangePasswordForm />
        </div>
      )}
      {tab === 'email' && (
        <div className="mx-auto max-w-lg">
          <h3 className="mb-1 font-bold text-slate-900">Change email</h3>
          <p className="mb-5 text-sm text-slate-400">We&apos;ll send a code to verify the new address.</p>
          <ChangeEmailForm />
        </div>
      )}
      {tab !== 'password' && tab !== 'email' && (
        <>
          {company ? (
            <CompanyEditProfile key={company._id} company={company} />
          ) : (
            <div className="py-10 text-center">
              <p className="mb-4 text-sm text-slate-500">No company profile found.</p>
              <Link href="/company/onboarding">
                <Button>Complete Company Profile</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </SettingsShell>
  );
}
