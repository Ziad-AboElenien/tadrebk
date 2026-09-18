'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/store';
import dynamic from 'next/dynamic';

const StudentShowcaseIntro = dynamic(
  () => import('@/features/home/components/StudentMiniDashboard').then((m) => ({ default: m.StudentShowcaseIntro })),
  { ssr: false },
);

const HeroSection = dynamic(() => import('@/features/home/components/HeroSection'));
const LaptopShowcase = dynamic(() => import('@/features/home/components/LaptopShowcase'));
const StudentMiniDashboard = dynamic(() => import('@/features/home/components/StudentMiniDashboard'), { ssr: false });
const FeaturedInternshipsSection = dynamic(() => import('@/features/home/components/FeaturedInternshipsSection'));
const ApplicationTimeline = dynamic(() => import('@/features/home/components/ApplicationTimeline'));
const ApplicationStates = dynamic(() => import('@/features/home/components/ApplicationStates'));
const HowItWorksSection = dynamic(() => import('@/features/home/components/HowItWorksSection'));
const CategoriesSection = dynamic(() => import('@/features/home/components/CategoriesSection'));
const ForStudentsSection = dynamic(() => import('@/features/home/components/ForStudentsSection'));

const DASHBOARD_BY_ROLE = {
  company: '/company/admin',
  admin: '/admin/dashboard',
  student: '/dashboard',
};

export default function HomeComponent() {
  const router = useRouter();
  const role = useAppSelector((s) => s.auth.role);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  // `/` is a guest-only landing page — logged-in users go to their dashboard.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(DASHBOARD_BY_ROLE[role] || '/dashboard');
    }
  }, [isAuthenticated, role, router]);

  if (isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-emerald-500" />
      </div>
    );
  }

  return (
    <div className="relative -mt-[80px] bg-white pt-[80px]">
      {/* dotted glassy sky */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(30,41,59,0.10) 1px, transparent 1.5px)',
          backgroundSize: '22px 22px',
        }}
      />
      {/* ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>
      <div className="relative">
      <HeroSection />
      <LaptopShowcase
        phoneContent={
          <div className="flex min-h-[950px] flex-col justify-center bg-gray-900 px-6 py-10">
            <StudentShowcaseIntro />
          </div>
        }
      >
        <StudentMiniDashboard />
      </LaptopShowcase>
      <HowItWorksSection variant="guest" />
      <FeaturedInternshipsSection />
      <ApplicationTimeline />
      <ApplicationStates />
      <CategoriesSection />
      <ForStudentsSection />
      </div>
    </div>
  );
}
