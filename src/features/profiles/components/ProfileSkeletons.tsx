'use client';

import { Skeleton, SkeletonAvatar, SkeletonLines } from '@/components/ui/Skeleton';

/** Loading skeleton matching the student profile layout (own + viewer). */
export function StudentProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-[2.5%] py-4 sm:px-6 sm:py-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Skeleton className="h-40 rounded-none sm:h-44" />
        <div className="px-5 pb-6 sm:px-6">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
            <SkeletonAvatar size={112} className="border-4 border-white shadow-lg" />
            <div className="flex gap-2 pb-1">
              <Skeleton className="h-9 w-32 !rounded-lg" />
              <Skeleton className="h-9 w-28 !rounded-lg" />
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            <Skeleton className="h-7 w-56 !rounded-lg" />
            <Skeleton className="h-4 w-80 max-w-full !rounded-lg" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-4 w-36 !rounded-full" />
              <Skeleton className="h-4 w-28 !rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <Skeleton className="mb-5 h-5 w-40 !rounded-lg" />
              <SkeletonLines lines={3} />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <Skeleton className="mb-5 h-5 w-32 !rounded-lg" />
              <SkeletonLines lines={4} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/** Loading skeleton matching the company profile layout (own + viewer). */
export function CompanyProfileSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-[2.5%] py-4 sm:px-6 sm:py-8">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <Skeleton className="h-44 rounded-none" />
        <div className="px-5 pb-6 sm:px-6">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
            <SkeletonAvatar size={112} className="border-4 border-white shadow-lg" />
            <div className="flex gap-2 pb-1">
              <Skeleton className="h-9 w-32 !rounded-lg" />
              <Skeleton className="h-9 w-28 !rounded-lg" />
            </div>
          </div>
          <div className="mt-4 space-y-2.5">
            <Skeleton className="h-7 w-64 !rounded-lg" />
            <div className="flex gap-4 pt-1">
              <Skeleton className="h-4 w-36 !rounded-full" />
              <Skeleton className="h-4 w-28 !rounded-full" />
              <Skeleton className="hidden h-4 w-32 !rounded-full sm:block" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="h-9 w-9 !rounded-lg" />
            <Skeleton className="mt-3 h-7 w-16 !rounded-lg" />
            <Skeleton className="mt-2 h-3 w-24 !rounded-full" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-6">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <Skeleton className="mb-5 h-5 w-48 !rounded-lg" />
              <SkeletonLines lines={3} />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <Skeleton className="mb-5 h-5 w-32 !rounded-lg" />
            <SkeletonLines lines={4} />
          </div>
        </div>
      </div>
    </main>
  );
}

/** Loading skeleton for the settings shell (sidebar + panel). */
export function SettingsSkeleton() {
  return (
    <main className="mx-auto w-full max-w-6xl px-[2.5%] py-4 sm:px-6 sm:py-8">
      <Skeleton className="mb-2 h-8 w-44 !rounded-lg" />
      <Skeleton className="mb-6 h-4 w-72 max-w-full !rounded-full" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <div className="flex gap-2 overflow-hidden lg:flex-col">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[68px] w-40 shrink-0 !rounded-xl lg:w-full" />
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8">
          <Skeleton className="mb-2 h-6 w-52 !rounded-lg" />
          <Skeleton className="mb-6 h-4 w-80 max-w-full !rounded-full" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[68px] !rounded-xl" />
            ))}
          </div>
          <Skeleton className="mt-4 h-28 !rounded-xl" />
        </div>
      </div>
    </main>
  );
}
