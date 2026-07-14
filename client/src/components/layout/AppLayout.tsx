import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/students': 'Students',
  '/attendance/new': 'New Attendance',
  '/history': 'History',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/search': 'Search',
};

export function AppLayout() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Attendance Register';

  const showNav = !location.pathname.startsWith('/attendance/take');
  const showTopBar = location.pathname !== '/attendance/take';

  return (
    <div className="min-h-screen bg-surface-secondary max-w-lg mx-auto relative w-full overflow-x-hidden">
      {showTopBar && <TopBar title={title} />}
      <main className={showNav ? 'pb-20' : ''}>
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  );
}
