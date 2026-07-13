import { motion } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import clsx from 'clsx';

interface AlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const typeConfig = {
  info: {
    bg: 'bg-primary-50 dark:bg-primary-950 border-primary-200 dark:border-primary-800',
    icon: <Info size={18} className="text-primary-600 dark:text-primary-400" />,
    title: 'text-primary-800 dark:text-primary-200',
    text: 'text-primary-700 dark:text-primary-300',
  },
  success: {
    bg: 'bg-success-50 dark:bg-success-500/10 border-success-200 dark:border-success-500/30',
    icon: <CheckCircle size={18} className="text-success-600 dark:text-success-400" />,
    title: 'text-success-800 dark:text-success-200',
    text: 'text-success-700 dark:text-success-300',
  },
  warning: {
    bg: 'bg-warning-50 dark:bg-warning-500/10 border-warning-200 dark:border-warning-500/30',
    icon: <AlertTriangle size={18} className="text-warning-600 dark:text-warning-400" />,
    title: 'text-warning-800 dark:text-warning-200',
    text: 'text-warning-700 dark:text-warning-300',
  },
  error: {
    bg: 'bg-danger-50 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/30',
    icon: <AlertTriangle size={18} className="text-danger-600 dark:text-danger-400" />,
    title: 'text-danger-800 dark:text-danger-200',
    text: 'text-danger-700 dark:text-danger-300',
  },
};

export function Alert({ type, title, children, onClose, className }: AlertProps) {
  const config = typeConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx(
        'rounded-2xl border p-4 flex gap-3',
        config.bg,
        className
      )}
    >
      <div className="shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <p className={clsx('text-sm font-semibold mb-1', config.title)}>{title}</p>
        )}
        <div className={clsx('text-sm', config.text)}>{children}</div>
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
}
