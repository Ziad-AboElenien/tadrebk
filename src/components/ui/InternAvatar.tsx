'use client';

import { useState } from 'react';

interface InternAvatarProps {
  src?: string | null;
  firstName?: string;
  lastName?: string;
  email?: string;
  className?: string;
}

function initialsOf(firstName?: string, lastName?: string, email?: string): string {
  const fromName = `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
  if (fromName.trim()) return fromName;
  return (email?.[0] ?? '?').toUpperCase();
}

export default function InternAvatar({ src, firstName, lastName, email, className = 'h-9 w-9 text-xs' }: InternAvatarProps) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return (
      <img
        src={src}
        alt={`${firstName ?? ''} ${lastName ?? ''}`.trim() || email || 'Intern'}
        onError={() => setFailed(true)}
        loading="lazy"
        decoding="async"
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <div className={`${className} flex shrink-0 items-center justify-center rounded-full bg-blue-700 font-semibold text-white`}>
      {initialsOf(firstName, lastName, email)}
    </div>
  );
}
