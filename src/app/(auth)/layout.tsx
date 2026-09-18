import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'Auth',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <Navbar />
      <div className="h-[80px]" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
