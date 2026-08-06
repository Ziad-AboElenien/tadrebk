'use client';

import { useState, useCallback } from 'react';

// The backend has no DELETE endpoint for profile/cover images, so "removing"
// one is done by re-uploading a 1x1 transparent PNG. That marker image must
// never be shown — whenever an image of exactly 1x1 pixels loads, it is
// treated as "no image" and the caller renders its icon fallback instead.
export function useBlankImage(src: string | null | undefined) {
  const [isBlank, setIsBlank] = useState(false);

  const onImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget;
    if (el.naturalWidth <= 1 && el.naturalHeight <= 1) setIsBlank(true);
  }, []);

  return { showImage: Boolean(src) && !isBlank, onImgLoad };
}
