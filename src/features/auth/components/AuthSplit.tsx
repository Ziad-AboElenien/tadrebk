'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export interface AuthHeroFeature {
  icon: LucideIcon;
  title: string;
  tint: string;
  iconColor: string;
}

interface AuthSplitProps {
  heroIcon: LucideIcon;
  heroGradient: string;
  heroTitle: string;
  heroText: string;
  heroFeatures: AuthHeroFeature[];
  backHref: string;
  backLabel: string;
  cardGradient: string;
  cardTitle: string;
  cardSubtitle: string;
  children: ReactNode;
  footerNote?: string;
  wide?: boolean;
}

export default function AuthSplit({
  heroIcon: HeroIcon,
  heroGradient,
  backHref,
  backLabel,
  cardGradient,
  cardTitle,
  cardSubtitle,
  children,
  footerNote,
  wide = false,
}: AuthSplitProps) {
  return (
    <section className="w-full bg-gradient-to-br from-slate-50 via-white to-emerald-50/60">
      <div className={`mx-auto grid w-full gap-8 px-4 py-4 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-6 ${wide ? 'max-w-7xl' : 'max-w-6xl'}`}>
        <div className="hidden flex-col items-center justify-center p-8 lg:sticky lg:top-24 lg:flex lg:h-[calc(100vh-7rem)] xl:p-12">
          <div className="relative">
            <div
              className={`flex h-64 w-64 items-center justify-center rounded-full bg-gradient-to-br shadow-2xl xl:h-80 xl:w-80 ${heroGradient}`}
            >
              <HeroIcon className="h-28 w-28 text-white xl:h-32 xl:w-32" strokeWidth={1.5} />
            </div>
            <div className="absolute -right-4 -top-4 flex h-16 w-16 animate-bounce items-center justify-center rounded-2xl bg-amber-400 shadow-lg">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <div className="absolute -bottom-2 -left-6 flex h-14 w-14 animate-pulse items-center justify-center rounded-xl bg-blue-500 shadow-lg">
              <ShieldCheck size={22} className="text-white" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-xl'}`}>
            <Link
              href={backHref}
              className="group mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-emerald-600"
            >
              <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
              {backLabel}
            </Link>

            <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-6">
              <div className="mb-5 text-center">
                <div
                  className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br p-2.5 shadow-lg ${cardGradient}`}
                >
                  <Image src="/images/favicon2.png" alt="Tadrebk" width={48} height={48} className="h-full w-full object-contain" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{cardTitle}</h1>
                <p className="mt-2 text-sm text-slate-500 sm:text-base">{cardSubtitle}</p>
              </div>

              {children}
            </div>

            <p className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={13} />
              <span>{footerNote || 'Your information is secure and encrypted'}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
