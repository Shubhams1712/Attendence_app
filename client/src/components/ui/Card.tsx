import { cn } from '@/lib/utils';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  hover?: boolean;
}

export function Card({ className, children, onClick, hover = false }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface rounded-xl border border-border p-4 transition-all duration-200',
        hover && 'cursor-pointer hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
