'use client';

import { useAppSelector } from '@/store/store';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import ComingSoonCard from '@/components/ui/ComingSoonCard';

export default function CompanySettingsPage() {
  const company = useAppSelector((s) => s.company.currentCompany);

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <h1 className="text-2xl font-black text-dark">Company settings</h1>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
        <p className="font-semibold text-dark">{company.name}</p>
        <p className="text-sm text-gray-500 mt-1">{company.companyEmail}</p>
      </div>

      <ComingSoonCard
        icon="fas fa-image"
        title="Logo & cover upload"
        description="Upload company branding from settings."
      />
    </div>
  );
}
