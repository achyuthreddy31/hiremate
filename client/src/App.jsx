import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CreateApplicationPage from './pages/CreateApplicationPage';
import ApplicationDashboardPage from './pages/ApplicationDashboardPage';
import ResumePage from './pages/ResumePage';
import JobMatchPage from './pages/JobMatchPage';
import RoadmapPage from './pages/RoadmapPage';
import PracticePage from './pages/PracticePage';
import CompanyResearchPage from './pages/CompanyResearchPage';
import InterviewPrepPage from './pages/InterviewPrepPage';
import ReadinessChecklistPage from './pages/ReadinessChecklistPage';
import ProfilePage from './pages/ProfilePage';

import ErrorBoundary from './components/ErrorBoundary';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/applications" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/applications/new" element={<ProtectedRoute><CreateApplicationPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

            {/* Application-scoped preparation modules */}
            <Route path="/app/:applicationId/dashboard" element={<ProtectedRoute><ApplicationDashboardPage /></ProtectedRoute>} />
            <Route path="/app/:applicationId/resume" element={<ProtectedRoute><ResumePage /></ProtectedRoute>} />
            <Route path="/app/:applicationId/match" element={<ProtectedRoute><JobMatchPage /></ProtectedRoute>} />
            <Route path="/app/:applicationId/roadmap" element={<ProtectedRoute><RoadmapPage /></ProtectedRoute>} />
            <Route path="/app/:applicationId/practice" element={<ProtectedRoute><PracticePage /></ProtectedRoute>} />
            <Route path="/app/:applicationId/company" element={<ProtectedRoute><CompanyResearchPage /></ProtectedRoute>} />
            <Route path="/app/:applicationId/interview-prep" element={<ProtectedRoute><InterviewPrepPage /></ProtectedRoute>} />
            <Route path="/app/:applicationId/checklist" element={<ProtectedRoute><ReadinessChecklistPage /></ProtectedRoute>} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}
