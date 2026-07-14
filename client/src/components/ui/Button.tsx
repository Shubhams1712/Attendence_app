import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        {
          'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm': variant === 'primary',
          'bg-surface border border-border text-text-primary hover:bg-surface-tertiary focus:ring-primary-500': variant === 'secondary',
          'bg-danger text-white hover:bg-red-600 focus:ring-red-500 shadow-sm': variant === 'danger',
          'text-text-secondary hover:bg-surface-tertiary hover:text-text-primary focus:ring-primary-500': variant === 'ghost',
          'border border-border bg-transparent text-text-primary hover:bg-surface-tertiary focus:ring-primary-500': variant === 'outline',
        },
        {
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
