import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Briefcase,
  FileText,
  Compass,
  CheckCircle,
  HelpCircle,
  Award,
  BookOpen,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';

export default function AppLayout({ children, currentApplication }) {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const appId = currentApplication?._id;

  const navItems = [
    { label: 'Overview', path: appId ? `/app/${appId}/dashboard` : '/dashboard', icon: TrendingUp },
    { label: 'Target Job & Match', path: appId ? `/app/${appId}/match` : '/applications', icon: Briefcase },
    { label: 'Resume & Quality', path: appId ? `/app/${appId}/resume` : '/applications', icon: FileText },
    { label: 'Roadmap & Learning', path: appId ? `/app/${appId}/roadmap` : '/applications', icon: Compass },
    { label: 'Practice & Coding', path: appId ? `/app/${appId}/practice` : '/applications', icon: Cpu },
    { label: 'Company Research', path: appId ? `/app/${appId}/company` : '/applications', icon: BookOpen },
    { label: 'Interview Prep', path: appId ? `/app/${appId}/interview-prep` : '/applications', icon: HelpCircle },
    { label: 'Readiness & Checklist', path: appId ? `/app/${appId}/checklist` : '/applications', icon: CheckCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col justify-between p-4">
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--border-subtle)]">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                H
              </div>
              <span className="font-bold text-xl tracking-tight">HireMate AI</span>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Current Application Badge if present */}
          {currentApplication && (
            <div className="mb-4 p-2.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-800/50">
              <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Active Target</div>
              <div className="font-medium text-sm truncate">{currentApplication.companyName}</div>
              <div className="text-xs text-[var(--text-muted)] truncate">{currentApplication.jobTitle}</div>
            </div>
          )}

          {/* Nav links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] space-y-2">
          <Link
            to="/profile"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Settings size={18} />
            <span>Profile & Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
