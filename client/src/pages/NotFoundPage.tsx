import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <p className="text-6xl font-bold text-primary-600 mb-4">404</p>
      <h1 className="text-xl font-semibold text-text-primary mb-2">Page not found</h1>
      <p className="text-sm text-text-secondary mb-6 text-center">The page you're looking for doesn't exist.</p>
      <Link to="/">
        <Button icon={<Home className="w-4 h-4" />}>Go Home</Button>
      </Link>
    </div>
  );
}
