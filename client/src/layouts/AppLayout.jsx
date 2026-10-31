import React, { useState, useEffect, useContext, createContext } from 'react';
import { Link, useLocation, useNavigate, useParams, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../services/api';
import {
  TrendingUp,
  Briefcase,
  FileText,
  Compass,
  Cpu,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Layers,
  ChevronDown,
  Settings,
  User,
  Search,
  Target,
  Sparkles
} from 'lucide-react';

// In-memory cache for target application data to prevent flashes and duplicate fetches on route navigation
const appMetadataCache = new Map();

export const AppLayoutContext = createContext(null);

export default function AppLayout({ children, currentApplication }) {
  const parentLayout = useContext(AppLayoutContext);
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const routeAppId = params.applicationId;

  // Initialize activeApp immediately from props or cache to prevent layout shift during navigation
  const [activeApp, setActiveApp] = useState(() => {
    if (currentApplication && currentApplication._id) {
      appMetadataCache.set(String(currentApplication._id), currentApplication);
      return currentApplication;
    }
    if (routeAppId && appMetadataCache.has(String(routeAppId))) {
      return appMetadataCache.get(String(routeAppId));
    }
    return null;
  });

  const activeAppId = activeApp?._id || routeAppId;

  useEffect(() => {
    // If nested inside parent AppLayout, only forward currentApplication and never duplicate fetches
    if (parentLayout) {
      if (currentApplication && currentApplication._id && parentLayout.setActiveApp) {
        parentLayout.setActiveApp(currentApplication);
      }
      return;
    }

    if (currentApplication && currentApplication._id) {
      appMetadataCache.set(String(currentApplication._id), currentApplication);
      setActiveApp(currentApplication);
    } else if (routeAppId) {
      if (appMetadataCache.has(String(routeAppId))) {
        setActiveApp(appMetadataCache.get(String(routeAppId)));
      } else {
        apiClient.get(`/applications/${routeAppId}`)
          .then(res => {
            if (res.data) {
              appMetadataCache.set(String(routeAppId), res.data);
              setActiveApp(res.data);
            }
          })
          .catch(() => {});
      }
    } else {
      setActiveApp(null);
    }
  }, [currentApplication, routeAppId, parentLayout]);

  // If already nested within persistent parent AppLayout route, pass through content seamlessly
  if (parentLayout) {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Overview', path: activeAppId ? `/app/${activeAppId}/dashboard` : '/dashboard', icon: TrendingUp },
    { label: 'Target Job & Match', path: activeAppId ? `/app/${activeAppId}/match` : '/dashboard', icon: Briefcase },
    { label: 'Resume & Quality', path: activeAppId ? `/app/${activeAppId}/resume` : '/dashboard', icon: FileText },
    { label: 'Roadmap & Learning', path: activeAppId ? `/app/${activeAppId}/roadmap` : '/dashboard', icon: Compass },
    { label: 'Practice & Coding', path: activeAppId ? `/app/${activeAppId}/practice` : '/dashboard', icon: Cpu },
    { label: 'Company Research', path: activeAppId ? `/app/${activeAppId}/company` : '/dashboard', icon: BookOpen },
    { label: 'Interview Prep', path: activeAppId ? `/app/${activeAppId}/interview-prep` : '/dashboard', icon: HelpCircle },
    { label: 'Readiness & Checklist', path: activeAppId ? `/app/${activeAppId}/checklist` : '/dashboard', icon: CheckCircle2 },
  ];

  return (
    <AppLayoutContext.Provider value={{ activeAppId, activeApp, setActiveApp }}>
      <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[var(--sidebar-bg)] text-white border-b border-[var(--sidebar-border)] sticky top-0 z-30 transition-colors duration-200">
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm shrink-0">
              N
            </div>
            <span className="font-extrabold text-base tracking-tight whitespace-nowrap text-white">
              HireMate Nexus
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--sidebar-card-border)] bg-[var(--sidebar-card-bg)] text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-[var(--sidebar-card-border)] bg-[var(--sidebar-card-bg)] text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </header>

        {/* Modern Blue Professional Sidebar - Deep Navy (Light) & Dark Navy (Dark) */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:flex w-full md:w-[260px] shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] text-[var(--sidebar-text)] flex-col justify-between p-4 fixed md:sticky top-0 h-auto md:h-screen z-20 overflow-y-auto transition-colors duration-200`}
        >
          <div>
            {/* Desktop Logo Header - Single line without Pro badge */}
            <div className="hidden md:flex items-center justify-between mb-5 pb-3.5 border-b border-[var(--sidebar-border)]">
              <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform shrink-0">
                  N
                </div>
                <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap">
                  HireMate Nexus
                </span>
              </Link>
            </div>

            {/* Current Target Application Widget in Sidebar */}
            <div className="mb-4 h-[74px] flex flex-col justify-center">
              {activeApp ? (
                <div className="p-3 rounded-xl bg-[var(--sidebar-card-bg)] border border-[var(--sidebar-card-border)] relative overflow-hidden h-[74px] flex flex-col justify-center">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <Target size={11} />
                      Target Role
                    </span>
                    <Link
                      to="/dashboard"
                      className="text-[11px] text-blue-400 hover:underline flex items-center gap-0.5"
                      title="Switch Target Application"
                    >
                      Switch
                    </Link>
                  </div>
                  <div className="font-bold text-sm text-white truncate" title={activeApp.companyName}>
                    {activeApp.companyName}
                  </div>
                  <div className="text-xs text-[var(--sidebar-text-muted)] truncate" title={activeApp.jobTitle}>
                    {activeApp.jobTitle}
                  </div>
                </div>
              ) : routeAppId ? (
                <div className="p-3 rounded-xl bg-[var(--sidebar-card-bg)] border border-[var(--sidebar-card-border)] h-[74px] flex flex-col justify-center gap-1.5 animate-pulse">
                  <div className="h-2.5 bg-blue-900/40 rounded w-16" />
                  <div className="h-3.5 bg-blue-900/50 rounded w-28" />
                  <div className="h-2.5 bg-blue-900/40 rounded w-20" />
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[var(--sidebar-card-bg)] border border-[var(--sidebar-card-border)] h-[74px] flex flex-col justify-center">
                  <div className="text-[11px] font-medium text-[var(--sidebar-text-muted)] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-200">
                      <Layers size={13} className="text-blue-400" />
                      <span>Overview Mode</span>
                    </div>
                    <Link to="/applications/new" className="text-[11px] text-blue-400 hover:underline font-bold">
                      + Add Job
                    </Link>
                  </div>
                  <div className="text-[10px] text-[var(--sidebar-text-muted)] mt-1">Select application to prep</div>
                </div>
              )}
            </div>

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
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[var(--sidebar-active-bg)] text-white shadow-sm shadow-blue-500/25'
                        : 'text-slate-300 hover:bg-[var(--sidebar-hover-bg)] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-blue-400 group-hover:text-blue-300 transition-colors'} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Account Footer */}
          <div className="mt-6 pt-3 border-t border-[var(--sidebar-border)]">
            <div className="p-3 rounded-2xl bg-[var(--sidebar-card-bg)] border border-[var(--sidebar-card-border)] shadow-sm space-y-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-extrabold text-xs shrink-0 border border-blue-500/30">
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate text-white">
                    {currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Candidate Account')}
                  </div>
                  <div className="text-[10px] text-[var(--sidebar-text-muted)] truncate">
                    {currentUser?.email || 'Logged in'}
                  </div>
                </div>
              </div>

              <div className="pt-1.5 flex flex-col gap-1 border-t border-[var(--sidebar-border)]">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-[var(--sidebar-hover-bg)] transition-colors"
                >
                  <Settings size={14} className="text-blue-400" />
                  <span>Profile & Settings</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Column with Top Navigation Bar */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Top Navigation Bar with Search */}
          <header className="sticky top-0 z-20 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur shadow-xs">
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search target jobs, roadmap topics, skills..."
                  className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>
            </div>

            {/* Topbar Utility Actions */}
            <div className="flex items-center gap-3">
              {/* Active Target Quick Pill */}
              {activeApp ? (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-blue-900 dark:text-blue-200">{activeApp.companyName}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[var(--text-muted)] truncate max-w-[140px]">{activeApp.jobTitle}</span>
                </div>
              ) : (
                <Link
                  to="/applications/new"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors"
                >
                  <Target size={13} />
                  <span>+ Target Job</span>
                </Link>
              )}

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-slate-300 dark:hover:border-slate-700 transition-colors shrink-0"
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-slate-600" />}
              </button>

              {/* User Avatar Pill */}
              <Link
                to="/profile"
                className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Profile & Settings"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-[var(--text-primary)] truncate max-w-[100px]">
                  {currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Account')}
                </span>
              </Link>
            </div>
          </header>

          {/* Main Viewport Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            {children || <Outlet context={{ app: activeApp, setApp: setActiveApp, searchQuery }} />}
          </main>
        </div>
      </div>
    </AppLayoutContext.Provider>
  );
}
