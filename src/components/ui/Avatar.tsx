import Image from 'next/image';
import { AVATAR_GRADIENTS } from '@/lib/constants';

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  index?: number; // for consistent gradient per user
}

const sizeMap = {
  xs:  { container: 'w-7 h-7',   text: 'text-xs',   px: 28,  py: 28 },
  sm:  { container: 'w-9 h-9',   text: 'text-sm',   px: 36,  py: 36 },
  md:  { container: 'w-12 h-12', text: 'text-base',  px: 48,  py: 48 },
  lg:  { container: 'w-16 h-16', text: 'text-xl',   px: 64,  py: 64 },
  xl:  { container: 'w-24 h-24', text: 'text-3xl',  px: 96,  py: 96 },
  '2xl': { container: 'w-32 h-32', text: 'text-4xl', px: 128, py: 128 },
};

export default function Avatar({
  src,
  name = '?',
  size = 'md',
  className = '',
  index = 0,
}: AvatarProps) {
  const { container, text, px, py } = sizeMap[size];
  const gradient = AVATAR_GRADIENTS[Math.abs(index) % AVATAR_GRADIENTS.length];
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <div
        className={[
          container,
          'relative rounded-full overflow-hidden ring-2 ring-white shadow-md shrink-0',
          className,
        ].join(' ')}
      >
        <Image
          src={src}
          alt={name}
          width={px}
          height={py}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      className={[
        container,
        `bg-gradient-to-br ${gradient}`,
        'rounded-full flex items-center justify-center ring-2 ring-white shadow-md shrink-0',
        className,
      ].join(' ')}
      aria-label={name}
    >
      <span className={[text, 'font-bold text-white select-none'].join(' ')}>
        {initials}
      </span>
    </div>
  );
}
