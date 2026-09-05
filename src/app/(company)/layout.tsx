'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminArea = pathname?.startsWith('/company/admin');

  if (isAdminArea) return <>{children}</>;

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <div className="h-[80px]" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}