type BadgeVariant = 'primary' | 'success' | 'warning' | 'info' | 'neutral' | 'danger';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  success: 'bg-green-50 text-green-700 border border-green-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  info:    'bg-blue-50 text-blue-700 border border-blue-100',
  neutral: 'bg-gray-100 text-gray-600 border border-gray-200',
  danger:  'bg-red-50 text-red-700 border border-red-100',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-xs',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 font-semibold rounded-full uppercase tracking-wide',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
