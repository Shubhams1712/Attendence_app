import { motion } from 'framer-motion';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  className,
  interactive = false,
  padding = 'md',
  onClick,
}: CardProps) {
  const Component = interactive ? motion.button : motion.div;

  const baseStyles = clsx(
    'bg-white dark:bg-gray-900 rounded-2xl shadow-soft',
    'border border-gray-100 dark:border-gray-800',
    interactive && 'cursor-pointer transition-all duration-200 hover:shadow-soft-lg hover:-translate-y-0.5 active:scale-[0.98]',
    paddingStyles[padding],
    className
  );

  if (interactive) {
    return (
      <Component
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={baseStyles}
      >
        {children}
      </Component>
    );
  }

  return (
    <div className={baseStyles}>{children}</div>
  );
}
