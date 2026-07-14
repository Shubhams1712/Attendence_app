import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppProvider } from '@/contexts/AppContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PINProvider } from '@/contexts/PINContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';

// Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { StudentsPage } from '@/pages/StudentsPage';
import { NewAttendancePage } from '@/pages/NewAttendancePage';
import { TakeAttendancePage } from '@/pages/TakeAttendancePage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AttendanceDetailsPage } from '@/pages/AttendanceDetailsPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SearchPage } from '@/pages/SearchPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="animate-pulse space-y-4 text-center">
          <div className="w-12 h-12 rounded-xl bg-primary-200 mx-auto" />
          <div className="h-3 w-32 bg-surface-tertiary rounded mx-auto" />
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/attendance/new" element={<NewAttendancePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/attendance/:id" element={<AttendanceDetailsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/attendance/take" element={
        <ProtectedRoute>
          <TakeAttendancePage />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <PINProvider>
            <AppProvider>
              <AppRoutes />
            </AppProvider>
          </PINProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
