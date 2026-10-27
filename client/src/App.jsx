import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Route-level code splitting to maximize initial load performance
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CreateApplicationPage = lazy(() => import('./pages/CreateApplicationPage'));
const ApplicationDashboardPage = lazy(() => import('./pages/ApplicationDashboardPage'));
const ResumePage = lazy(() => import('./pages/ResumePage'));
const JobMatchPage = lazy(() => import('./pages/JobMatchPage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const PracticePage = lazy(() => import('./pages/PracticePage'));
const CompanyResearchPage = lazy(() => import('./pages/CompanyResearchPage'));
const InterviewPrepPage = lazy(() => import('./pages/InterviewPrepPage'));
const ReadinessChecklistPage = lazy(() => import('./pages/ReadinessChecklistPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

function PageLoadingFallback() {
  return (
    <div className="space-y-6 animate-pulse p-2">
      <div className="h-9 bg-slate-200/70 dark:bg-slate-800/50 rounded-xl w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
        <div className="h-48 bg-slate-200/60 dark:bg-slate-800/40 rounded-2xl border border-[var(--border-subtle)]" />
        <div className="h-48 bg-slate-200/60 dark:bg-slate-800/40 rounded-2xl border border-[var(--border-subtle)]" />
        <div className="h-48 bg-slate-200/60 dark:bg-slate-800/40 rounded-2xl border border-[var(--border-subtle)]" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Persistent Layout Protected Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/applications" element={<DashboardPage />} />
                  <Route path="/applications/new" element={<CreateApplicationPage />} />
                  <Route path="/profile" element={<ProfilePage />} />

                  {/* Application-scoped preparation modules */}
                  <Route path="/app/:applicationId/dashboard" element={<ApplicationDashboardPage />} />
                  <Route path="/app/:applicationId/resume" element={<ResumePage />} />
                  <Route path="/app/:applicationId/match" element={<JobMatchPage />} />
                  <Route path="/app/:applicationId/roadmap" element={<RoadmapPage />} />
                  <Route path="/app/:applicationId/practice" element={<PracticePage />} />
                  <Route path="/app/:applicationId/company" element={<CompanyResearchPage />} />
                  <Route path="/app/:applicationId/interview-prep" element={<InterviewPrepPage />} />
                  <Route path="/app/:applicationId/checklist" element={<ReadinessChecklistPage />} />
                </Route>

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
