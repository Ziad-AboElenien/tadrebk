'use client';

import { useAppSelector } from '@/store/store';
import dynamic from 'next/dynamic';

const HeroSection = dynamic(() => import('@/features/home/components/HeroSection'));
const CompanyMiniDashboard = dynamic(() => import('@/features/home/components/CompanyMiniDashboard'), { ssr: false });
const StudentMiniDashboard = dynamic(() => import('@/features/home/components/StudentMiniDashboard'), { ssr: false });
const HowItWorksSection = dynamic(() => import('@/features/home/components/HowItWorksSection'));
const CategoriesSection = dynamic(() => import('@/features/home/components/CategoriesSection'));
const CtaBannerSection = dynamic(() => import('@/features/home/components/CtaBannerSection'));
const FeaturedInternshipsSection = dynamic(() => import('@/features/home/components/FeaturedInternshipsSection'));
const ForStudentsSection = dynamic(() => import('@/features/home/components/ForStudentsSection'));

export default function HomeComponent() {
  const role = useAppSelector((s) => s.auth.role);

  return (
    <>
      <HeroSection />
      {role === 'company' ? <CompanyMiniDashboard /> : <StudentMiniDashboard />}
      <HowItWorksSection />
      <CategoriesSection />
      <CtaBannerSection />
      <FeaturedInternshipsSection />
      <ForStudentsSection />
    </>
  );
}
