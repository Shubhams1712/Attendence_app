import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  History,
  BarChart3,
  Settings,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';
import { useAuth } from '@/contexts/AuthContext';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { path: '/students', label: 'Students', icon: Users },
  { path: '/history', label: 'History', icon: History },
  { path: '/analytics', label: 'Stats', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOnline, pendingSync } = useOffline();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Online/Offline indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-warning-500 text-white text-center text-xs py-1 px-4 flex items-center justify-center gap-2 safe-top"
          >
            <WifiOff size={14} />
            <span>Offline Mode{pendingSync > 0 ? ` • ${pendingSync} pending sync` : ''}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page content */}
      <main className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav safe-bottom">
        <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                  'flex flex-col items-center justify-center gap-0.5 w-14 h-14 rounded-xl transition-all duration-200',
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-0.5 w-8 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Connectivity indicator (bottom right) */}
      <div className={clsx(
        'fixed bottom-20 right-4 p-2 rounded-full shadow-soft z-40',
        isOnline ? 'bg-success-100 text-success-600' : 'bg-gray-200 text-gray-500'
      )}>
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
      </div>
    </div>
  );
}
