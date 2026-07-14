import { cn } from '@/lib/utils';
import { ArrowLeft, Search, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, showBack = false, onBack, rightAction, className }: TopBarProps) {
  const navigate = useNavigate();

  return (
    <header className={cn(
      'sticky top-0 z-30 bg-surface border-b border-border',
      className
    )}>
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              onClick={onBack || (() => navigate(-1))}
              className="p-2 -ml-2 rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-lg font-semibold text-text-primary truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-1">
          {rightAction}
          <Link
            to="/search"
            className="p-2 rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            to="/settings"
            className="p-2 rounded-lg text-text-secondary hover:bg-surface-tertiary transition-colors"
          >
            <Settings className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
