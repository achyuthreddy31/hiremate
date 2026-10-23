import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../services/api';
import {
  Briefcase,
  FileText,
  Compass,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Settings,
  LogOut,
  Sun,
  Moon,
  TrendingUp,
  Cpu,
  ChevronRight,
  Menu,
  X,
  Layers,
  ArrowLeft
} from 'lucide-react';

export default function AppLayout({ children, currentApplication }) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationId: routeAppId } = useParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeApp, setActiveApp] = useState(currentApplication || null);

  // Determine active application ID priority: passed prop -> URL param -> cached in localStorage
  const savedAppId = typeof window !== 'undefined' ? localStorage.getItem('hiremate_active_app_id') : null;
  const activeAppId = currentApplication?._id || routeAppId || savedAppId || null;

  useEffect(() => {
    if (currentApplication?._id) {
      setActiveApp(currentApplication);
      localStorage.setItem('hiremate_active_app_id', currentApplication._id);
      if (currentApplication.companyName) {
        localStorage.setItem('hiremate_active_app_name', `${currentApplication.companyName} (${currentApplication.jobTitle || ''})`);
      }
    } else if (routeAppId) {
      localStorage.setItem('hiremate_active_app_id', routeAppId);
      // Fetch application details if not provided to keep widget populated
      if (!activeApp || activeApp._id !== routeAppId) {
        apiClient.get(`/applications/${routeAppId}`)
          .then((res) => {
            if (res.data) {
              setActiveApp(res.data);
              localStorage.setItem('hiremate_active_app_name', `${res.data.companyName} (${res.data.jobTitle || ''})`);
            }
          })
          .catch(() => {});
      }
    }
  }, [currentApplication, routeAppId]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: activeAppId ? `/app/${activeAppId}/dashboard` : '/dashboard', icon: TrendingUp, badge: null },
    { label: 'Target Job & Match', path: activeAppId ? `/app/${activeAppId}/match` : '/dashboard', icon: Briefcase, badge: 'Step 1' },
    { label: 'Resume & Quality', path: activeAppId ? `/app/${activeAppId}/resume` : '/dashboard', icon: FileText, badge: 'Step 2' },
    { label: 'Roadmap & Learning', path: activeAppId ? `/app/${activeAppId}/roadmap` : '/dashboard', icon: Compass, badge: 'Step 3' },
    { label: 'Practice & Coding', path: activeAppId ? `/app/${activeAppId}/practice` : '/dashboard', icon: Cpu, badge: 'Step 4' },
    { label: 'Company Research', path: activeAppId ? `/app/${activeAppId}/company` : '/dashboard', icon: BookOpen, badge: 'Step 5' },
    { label: 'Interview Prep', path: activeAppId ? `/app/${activeAppId}/interview-prep` : '/dashboard', icon: HelpCircle, badge: 'Step 6' },
    { label: 'Readiness & Checklist', path: activeAppId ? `/app/${activeAppId}/checklist` : '/dashboard', icon: CheckCircle, badge: 'Step 7' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] sticky top-0 z-30">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            H
          </div>
          <span className="font-bold text-lg tracking-tight">HireMate AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex w-full md:w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex-col justify-between p-4 fixed md:sticky top-0 h-auto md:h-screen z-20 overflow-y-auto`}
      >
        <div>
          {/* Desktop Logo */}
          <div className="hidden md:flex items-center justify-between mb-5 pb-3.5 border-b border-[var(--border-subtle)]">
            <Link to="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                H
              </div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-800 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-200">
                HireMate AI
              </span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-slate-400 transition-colors"
              aria-label="Toggle theme"
              title="Toggle Light/Dark Theme"
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>

          {/* Current Target Application Widget */}
          {activeApp ? (
            <div className="mb-4 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 relative overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  Target Application
                </span>
                <Link
                  to="/dashboard"
                  className="text-[11px] text-indigo-500 hover:underline flex items-center gap-0.5"
                  title="Switch Target Application"
                >
                  Switch
                </Link>
              </div>
              <div className="font-semibold text-sm truncate" title={activeApp.companyName}>
                {activeApp.companyName}
              </div>
              <div className="text-xs text-[var(--text-muted)] truncate" title={activeApp.jobTitle}>
                {activeApp.jobTitle}
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[var(--border-subtle)]">
              <div className="text-[11px] font-medium text-[var(--text-muted)] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers size={13} className="text-indigo-500" />
                  <span>All Applications</span>
                </div>
                <Link to="/applications/new" className="text-[10px] text-indigo-600 hover:underline font-bold">
                  + Add
                </Link>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && !isActive && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="mt-6 pt-3 border-t border-[var(--border-subtle)] space-y-1">
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-[var(--text-primary)] transition-colors"
          >
            <Settings size={16} />
            <span>Profile & Account</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full min-h-screen">
        {children}
      </main>
    </div>
  );
}
