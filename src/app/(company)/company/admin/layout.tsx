'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminShellProvider, useAdminShell } from '@/components/tadrebk/admin-shell';

function AdminBootstrap() {
  const { setSidebarOpen } = useAdminShell();
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  return null;
}

export default function CompanyAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShellProvider>
      <AdminBootstrap />
      {children}
    </AdminShellProvider>
  );
}