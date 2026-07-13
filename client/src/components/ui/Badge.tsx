import clsx from 'clsx';

interface BadgeProps {
  variant: 'present' | 'absent' | 'leave' | 'unmarked';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  present: 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400',
  absent: 'bg-danger-100 text-danger-600 dark:bg-danger-500/20 dark:text-danger-400',
  leave: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-400',
  unmarked: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function Badge({ variant, size = 'md', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-semibold capitalize',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {variant}
    </span>
  );
}
