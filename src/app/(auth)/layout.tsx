import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Auth',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex flex-col">
      {/* Minimal header */}
      <header className="px-4 md:px-6 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/logoandfav.png" alt="Tadrebk" width={232} height={193} className="h-12 w-auto" priority />
        </Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-dark transition-colors flex items-center gap-1.5">
          <i className="fas fa-arrow-left text-xs" />
          Back to home
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 md:py-12">
        {children}
      </main>

      {/* Subtle footer */}
      <footer className="px-4 md:px-6 py-4 text-center text-xs text-gray-300">
        © {new Date().getFullYear()} Tadrebk. Built for students in Egypt.
      </footer>
    </div>
  );
}
