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
  CheckCircle,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  Layers,
  ChevronDown,
  Settings,
  User
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
  }, [currentApplication, routeAppId]);

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
    { label: 'Readiness & Checklist', path: activeAppId ? `/app/${activeAppId}/checklist` : '/dashboard', icon: CheckCircle },
  ];

  return (
    <AppLayoutContext.Provider value={{ activeAppId, activeApp }}>
      <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg-primary)] text-[var(--text-primary)]">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] sticky top-0 z-30">
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              N
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight whitespace-nowrap">
              HireMate Nexus
            </span>
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

        {/* Sidebar - Fixed width & stable layout to eliminate shaking on navigation */}
        <aside
          className={`${
            mobileMenuOpen ? 'block' : 'hidden'
          } md:flex w-full md:w-[270px] shrink-0 bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex-col justify-between p-4 fixed md:sticky top-0 h-auto md:h-screen z-20 overflow-y-auto`}
        >
          <div>
            {/* Desktop Logo Header - Single line guarantee */}
            <div className="hidden md:flex items-center justify-between mb-5 pb-3.5 border-b border-[var(--border-subtle)]">
              <Link to="/dashboard" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  N
                </div>
                <span className="font-extrabold text-base lg:text-lg tracking-tight whitespace-nowrap bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-800 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-200">
                  HireMate Nexus
                </span>
              </Link>
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-slate-400 transition-colors shrink-0"
                aria-label="Toggle theme"
                title="Toggle Light/Dark Theme"
              >
                {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>

            {/* Current Target Application Widget - Fixed min-height avoids shifting navigation links */}
            <div className="mb-4 min-h-[74px] flex flex-col justify-center">
              {activeApp ? (
                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 relative overflow-hidden">
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
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-[var(--border-subtle)]">
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
            </div>

            {/* Navigation Links - transition-colors avoids layout re-flows */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Highlighted Profile & Account Section with Working Sign Out */}
          <div className="mt-6 pt-3 border-t border-[var(--border-subtle)]">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-sm space-y-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-extrabold text-xs shrink-0 border border-indigo-200/50 dark:border-indigo-800/50">
                  {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate text-[var(--text-primary)]">
                    {currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Candidate Account')}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] truncate">
                    {currentUser?.email || 'Logged in'}
                  </div>
                </div>
              </div>

              <div className="pt-1.5 flex flex-col gap-1 border-t border-slate-200/70 dark:border-slate-800/70">
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>Profile & Account</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] md:min-h-screen">
          {children || <Outlet />}
        </main>
      </div>
    </AppLayoutContext.Provider>
  );
}
