import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Pulsing placeholder block. Size it with className. */
export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`}
      {...props}
    />
  );
}

/** Circular avatar placeholder. */
export function SkeletonAvatar({ size = 112, className = '' }: { size?: number; className?: string }) {
  return (
    <div
      aria-hidden
      style={{ width: size, height: size }}
      className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`}
    />
  );
}

/** A few text lines with a shorter last line. */
export function SkeletonLines({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div aria-hidden className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3.5 animate-pulse rounded-full bg-slate-200/80"
          style={{ width: i === lines - 1 ? '55%' : '100%' }}
        />
      ))}
    </div>
  );
}
