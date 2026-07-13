import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-8xl font-bold text-primary-600 dark:text-primary-400 mb-4"
      >
        404
      </motion.div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Page Not Found
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/dashboard">
          <Button variant="primary" icon={<Home size={18} />}>
            Go Home
          </Button>
        </Link>
        <Button variant="secondary" icon={<ArrowLeft size={18} />} onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    </div>
  );
}
