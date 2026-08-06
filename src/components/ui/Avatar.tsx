import Image from 'next/image';
import { useBlankImage } from '@/lib/use-blank-image';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  icon?: string;
}

const sizeMap = {
  xs:  { container: 'w-7 h-7',   icon: 'text-xs',   px: 28,  py: 28 },
  sm:  { container: 'w-9 h-9',   icon: 'text-sm',   px: 36,  py: 36 },
  md:  { container: 'w-12 h-12', icon: 'text-base', px: 48,  py: 48 },
  lg:  { container: 'w-16 h-16', icon: 'text-xl',   px: 64,  py: 64 },
  xl:  { container: 'w-24 h-24', icon: 'text-3xl',  px: 96,  py: 96 },
  '2xl': { container: 'w-32 h-32', icon: 'text-4xl', px: 128, py: 128 },
};

export default function Avatar({
  src: _src,
  name = '?',
  size = 'md',
  className = '',
  icon = 'fa-user',
}: AvatarProps) {
  const { container, icon: iconSize, px, py } = sizeMap[size];

  const src = typeof _src === 'string' ? _src.trim() || null : null;
  const { showImage, onImgLoad } = useBlankImage(src);

  if (showImage) {
    return (
      <div
        className={[
          container,
          'relative rounded-full overflow-hidden ring-2 ring-white shadow-md shrink-0',
          className,
        ].join(' ')}
      >
        <Image
          src={src!}
          alt={name}
          width={px}
          height={py}
          onLoad={onImgLoad}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={[
        container,
        'bg-gray-100',
        'rounded-full flex items-center justify-center ring-2 ring-white shadow-md shrink-0',
        className,
      ].join(' ')}
      aria-label={name}
    >
      <i className={['fas', icon, iconSize, 'text-gray-400 select-none'].join(' ')} />
    </div>
  );
}
