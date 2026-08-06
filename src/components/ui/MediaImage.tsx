'use client';

import { useBlankImage } from '@/lib/use-blank-image';

interface MediaImageProps {
  src: string | null | undefined;
  alt?: string;
  boxClassName?: string;
  imgClassName?: string;
  iconClassName?: string;
  onError?: () => void;
}

// Renders an image, or the icon fallback when the image is the 1x1 blank
// marker uploaded in place of a removed picture (see use-blank-image).
export default function MediaImage({
  src,
  alt = '',
  boxClassName = '',
  imgClassName = '',
  iconClassName = 'fas fa-building',
  onError,
}: MediaImageProps) {
  const { showImage, onImgLoad } = useBlankImage(src);

  if (!showImage) {
    return (
      <div className={`${boxClassName} bg-gray-100 flex items-center justify-center`}>
        <i className={iconClassName} />
      </div>
    );
  }

  return (
    <div className={boxClassName}>
      <img src={src!} alt={alt} className={imgClassName} onLoad={onImgLoad} onError={onError} />
    </div>
  );
}
