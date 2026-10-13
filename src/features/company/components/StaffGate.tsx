'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import Sidebar from '@/components/tadrebk/Sidebar';
import TopBar from '@/components/tadrebk/TopBar';
import { useAppSelector } from '@/store/store';
import { useCompanyPermissions } from '@/features/company/hooks/use-company-permissions';
import type { ReactNode } from 'react';

interface StaffGateProps {
  title: string;
  children: ReactNode;
}

/**
 * Owner-only screens (billing/points/programs/profile/postings) stay
 * owner-only on the backend — staff hitting them would only collect 403s,
 * so they see a clear notice instead of firing doomed requests.
 *
 * Usage inside a screen (AFTER all hooks, right before the main return):
 *   const gate = useCompanyPermissions(company?._id);
 *   ...
 *   if (!gate.loading && !gate.isOwner) return <StaffBlocked title="..." />;
 */
export function StaffBlocked({ title }: { title: string }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar active="" />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar title={title} />
        <main className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <ShieldAlert size={24} className="text-slate-400" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-slate-900">Restricted area</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Only the company owner can open {title}. Ask your admin for access.
          </p>
          <Link
            href="/company/admin"
            className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Back to Dashboard
          </Link>
        </main>
      </div>
    </div>
  );
}

export default function StaffGate({ title, children }: StaffGateProps) {
  const company = useAppSelector((s) => s.company.currentCompany);
  const perms = useCompanyPermissions(company?._id);

  if (!perms.loading && !perms.isOwner) {
    return <StaffBlocked title={title} />;
  }

  return <>{children}</>;
}
