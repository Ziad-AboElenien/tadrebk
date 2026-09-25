import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: {
    default: 'Tadrebk — Internship Platform',
    template: '%s | Tadrebk',
  },
  description:
    'Browse verified internships, companies and guides on Tadrebk — Egypt’s internship platform for students.',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <Navbar />
      <div className="h-[80px]" />
      <main className="flex-1 min-h-[calc(100vh-64px)]">{children}</main>
      <Footer />
    </div>
  );
}
