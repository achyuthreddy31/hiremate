import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import {
  Plus,
  Briefcase,
  Building,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Trash2,
  Target,
  Compass,
  Cpu,
  FileText,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  BarChart3
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [applications, setApplications] = useState([]);
  const [primaryOverview, setPrimaryOverview] = useState(null);
  const [primaryRoadmap, setPrimaryRoadmap] = useState(null);
  const [primaryPerformance, setPrimaryPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const appsRes = await apiClient.get('/applications');
      const appsList = appsRes.data || [];
      setApplications(appsList);

      if (appsList.length > 0) {
        const firstApp = appsList[0];
        const [overviewRes, roadRes, perfRes] = await Promise.all([
          apiClient.get(`/readiness/overview/${firstApp._id}`).catch(() => ({ data: null })),
          apiClient.get(`/roadmap/${firstApp._id}`).catch(() => ({ data: null })),
          apiClient.get(`/practice/performance/${firstApp._id}`).catch(() => ({ data: [] }))
        ]);
        setPrimaryOverview(overviewRes.data);
        setPrimaryRoadmap(roadRes.data);
        setPrimaryPerformance(perfRes.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this target job application?')) return;

    try {
      await apiClient.delete(`/applications/${id}`);
      setApplications(prev => prev.filter(app => app._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete application');
    }
  };

  const userDisplayName = currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Candidate');

  // Aggregated Metric Calculations
  const readiness = primaryOverview?.interviewReadinessScore;
  const match = primaryOverview?.jobMatchScore;
  const readinessScore = readiness?.total || (match?.total ? Math.round(match.total * 0.8) : 0);
  const totalAppsCount = applications.length;

  const roadmapTasks = primaryRoadmap?.tasks || [];
  const completedRoadmapTasks = roadmapTasks.filter(t => t.status === 'completed').length;
  const roadmapPercentage = roadmapTasks.length > 0
    ? Math.round((completedRoadmapTasks / roadmapTasks.length) * 100)
    : (primaryRoadmap?.completionPercentage || 0);

  const totalPracticeAttempts = primaryPerformance.reduce((acc, p) => acc + (p.totalAttempts || 0), 0);
  const averageAccuracy = primaryPerformance.length > 0
    ? Math.round(primaryPerformance.reduce((acc, p) => acc + (p.accuracy || 0), 0) / primaryPerformance.length)
    : 0;

  const primaryApp = applications[0];

  return (
    <AppLayout>
      <div className="space-y-7 max-w-7xl mx-auto">
        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* 1. Welcome Banner - Modern Blue Executive Styling */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-blue-800 to-slate-900 text-white p-6 sm:p-8 shadow-md border border-blue-600/30">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-200 border border-blue-400/30">
                <Sparkles size={12} className="text-blue-300" />
                <span>Executive Preparation Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                Welcome back, {userDisplayName}!
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                {totalAppsCount > 0 ? (
                  <>
                    Tracking <strong>{totalAppsCount} target job {totalAppsCount === 1 ? 'application' : 'applications'}</strong>. Active preparation readiness is currently at <strong className="text-white">{readinessScore}%</strong>. Continue your dated roadmap drills today.
                  </>
                ) : (
                  <>
                    Start by enrolling your target role and company. HireMate Nexus deterministically analyzes job requirements, identifies prioritized skill gaps, and generates your daily preparation schedule.
                  </>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                to="/applications/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <Plus size={16} />
                <span>Add Target Job</span>
              </Link>
              {primaryApp && (
                <Link
                  to={`/app/${primaryApp._id}/dashboard`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white border border-blue-400/40 font-semibold text-xs sm:text-sm transition-all active:scale-95"
                >
                  <span>Open {primaryApp.companyName} Hub</span>
                  <ArrowRight size={14} />
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 2. Professional Metric Cards (4 KPI Cards in Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Metric 1: Interview Readiness */}
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Interview Readiness
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/80">
                <Award size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {readinessScore}%
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-1.5">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {readinessScore >= 75 ? 'Interview Ready' : readinessScore >= 50 ? 'On Track' : 'In Preparation'}
                </span>
                <span>Active Metric</span>
              </div>
            </div>
          </div>

          {/* Metric 2: Target Applications */}
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Target Applications
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/80">
                <Briefcase size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {totalAppsCount}
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-1.5">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {totalAppsCount > 0 ? 'Active Tracking' : 'None Enrolled'}
                </span>
                <span>Role Tracks</span>
              </div>
            </div>
          </div>

          {/* Metric 3: Learning Roadmap Progress */}
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Roadmap Milestones
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/80">
                <Compass size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {roadmapTasks.length > 0 ? `${completedRoadmapTasks}/${roadmapTasks.length}` : '0/0'}
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-1.5">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {roadmapPercentage}% Completed
                </span>
                <span>Scheduled Days</span>
              </div>
            </div>
          </div>

          {/* Metric 4: Practice & Coding */}
          <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Practice & Coding
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/80">
                <Cpu size={16} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {totalPracticeAttempts > 0 ? `${totalPracticeAttempts} Qs` : 'Ready'}
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mt-1.5">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {averageAccuracy > 0 ? `${averageAccuracy}% Accuracy` : 'Auto-Graded'}
                </span>
                <span>Validation</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Interview Readiness Card & Spotlight Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Interview Readiness Card (2 Columns) */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Comprehensive Interview Readiness
                </span>
                <h3 className="text-xl font-extrabold tracking-tight mt-0.5">
                  Multi-Dimensional Evaluation Snapshot
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <ShieldCheck size={14} />
                <span>Deterministic Score</span>
              </span>
            </div>

            {/* Score Display and Progress Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center font-extrabold shadow-md shadow-blue-500/25 shrink-0">
                  <span className="text-2xl leading-none">{readinessScore}%</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90 mt-0.5">Score</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base">
                    {readinessScore >= 80 ? 'Exceptional Candidate Preparedness' : readinessScore >= 60 ? 'Strong Preparation Underway' : 'Active Preparation Required'}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Calculated across target job requirements match, resume impact, coding drills, and checklist items.
                  </p>
                </div>
              </div>

              {primaryApp && (
                <Link
                  to={`/app/${primaryApp._id}/checklist`}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs shrink-0"
                >
                  View Readiness Breakdown →
                </Link>
              )}
            </div>

            {/* Core Dimensions Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-1">
              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-muted)]">Target Match</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {match?.total || (readiness?.categories?.jobMatch?.score || 0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${match?.total || 0}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-muted)]">Resume Quality</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {readiness?.categories?.resumeQuality?.score || 85}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${readiness?.categories?.resumeQuality?.score || 85}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-muted)]">Coding Practice</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {readiness?.categories?.codingCategory?.score || averageAccuracy || 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${readiness?.categories?.codingCategory?.score || averageAccuracy || 0}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-muted)]">Company Intel</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {readiness?.categories?.companyResearch?.score || 70}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${readiness?.categories?.companyResearch?.score || 70}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-muted)]">Interview Q&A</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {readiness?.categories?.interviewPrep?.score || 65}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${readiness?.categories?.interviewPrep?.score || 65}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[var(--text-muted)]">Checklist Audit</span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {readiness?.categories?.finalChecklist?.score || (roadmapPercentage > 0 ? roadmapPercentage : 0)}%
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 mt-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${readiness?.categories?.finalChecklist?.score || roadmapPercentage || 0}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Primary Target Spotlight (1 Column) */}
          <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                Active Spotlight
              </span>
              <h3 className="text-lg font-extrabold tracking-tight mt-0.5">
                Primary Target Role
              </h3>

              {primaryApp ? (
                <div className="mt-4 p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-[var(--text-primary)]">{primaryApp.jobTitle}</h4>
                      <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{primaryApp.companyName}</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                      Active Prep
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5 text-xs text-[var(--text-muted)]">
                    <div className="flex justify-between">
                      <span>Daily Study Quota:</span>
                      <strong className="text-[var(--text-primary)]">{primaryApp.dailyPreparationMinutes || 60} mins</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Timeline:</span>
                      <strong className="text-[var(--text-primary)]">{primaryApp.availableDays || 14} days available</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 p-6 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
                  <Target size={28} className="text-slate-400 mx-auto" />
                  <p className="text-xs text-[var(--text-muted)]">No target application enrolled yet.</p>
                </div>
              )}
            </div>

            <div>
              {primaryApp ? (
                <Link
                  to={`/app/${primaryApp._id}/practice`}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow hover:shadow-blue-500/20 transition-all"
                >
                  <Cpu size={14} />
                  <span>Practice Today's Roadmap Topic</span>
                </Link>
              ) : (
                <Link
                  to="/applications/new"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition-all"
                >
                  <Plus size={14} />
                  <span>Enroll Target Application</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* 4. Job Applications Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Target Job Applications</h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Deterministic ATS matches, requirement gap breakdowns, and company preparation hubs.
              </p>
            </div>
            <Link
              to="/applications/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow hover:shadow-blue-500/20 shrink-0"
            >
              <Plus size={14} />
              <span>Add Target Application</span>
            </Link>
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-800/40 animate-pulse border border-[var(--border-subtle)]" />
              ))}
            </div>
          )}

          {!loading && applications.length === 0 && (
            <div className="text-center py-12 px-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-lg mx-auto shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-200 dark:border-blue-900">
                <Target size={24} />
              </div>
              <h4 className="text-base font-bold">No Target Job Applications Enrolled</h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Add your target job title and description to unlock customized match scores, dated learning roadmaps, and targeted practice.
              </p>
              <Link
                to="/applications/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
              >
                <Plus size={14} />
                <span>Create Application</span>
              </Link>
            </div>
          )}

          {!loading && applications.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/50 transition-all shadow-sm hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                        {app.status || 'Active'}
                      </span>
                      <button
                        onClick={(e) => handleDelete(e, app._id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                        title="Delete application"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-base mt-2 truncate text-[var(--text-primary)]" title={app.jobTitle}>
                      {app.jobTitle}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium mt-0.5 truncate">
                      <Building size={13} className="shrink-0" />
                      <span className="truncate">{app.companyName}</span>
                    </div>

                    <div className="mt-3.5 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-blue-500" />
                        <span>{app.dailyPreparationMinutes || 60}m/day</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-blue-500" />
                        <span>
                          {app.interviewDate
                            ? new Date(app.interviewDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            : `${app.availableDays || 14}d prep`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <Link
                      to={`/app/${app._id}/dashboard`}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Open Prep Hub →
                    </Link>
                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/app/${app._id}/match`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 text-[var(--text-primary)] hover:text-blue-600 transition-colors"
                        title="Target Job Match"
                      >
                        Match
                      </Link>
                      <Link
                        to={`/app/${app._id}/practice`}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-colors"
                        title="Practice & Coding"
                      >
                        Practice
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5. Learning Roadmap Section */}
        {primaryApp && roadmapTasks.length > 0 && (
          <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Dated Curriculum
                </span>
                <h3 className="text-lg font-extrabold tracking-tight mt-0.5">
                  Active Learning Roadmap ({primaryApp.companyName} • {primaryApp.jobTitle})
                </h3>
              </div>
              <Link
                to={`/app/${primaryApp._id}/roadmap`}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>View Full {roadmapTasks.length}-Day Schedule</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {roadmapTasks.slice(0, 6).map((task) => {
                const isDone = task.status === 'completed';
                return (
                  <div
                    key={task._id || task.day}
                    className={`p-4 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-[var(--bg-primary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                        Day {task.day}
                      </span>
                      <span className="text-[10px] font-semibold text-[var(--text-muted)]">
                        {task.estimatedMinutes}m
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-[var(--text-primary)] mt-2 line-clamp-1">
                      {task.title || task.topic}
                    </h4>

                    <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-[var(--text-muted)] capitalize">
                        {task.priority || 'Important'}
                      </span>
                      {isDone ? (
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Done</span>
                        </span>
                      ) : (
                        <Link
                          to={`/app/${primaryApp._id}/practice`}
                          className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Practice →
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 6. Quick Actions Section */}
        <div className="space-y-3.5">
          <div>
            <h3 className="text-xl font-extrabold tracking-tight">Quick Actions & Preparation Modules</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Direct access to all specialized preparation workflows across your target roles.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <Link
              to="/applications/new"
              className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/50 hover:shadow-sm transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Target size={18} />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                  New Target Job
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Enroll role</div>
              </div>
            </Link>

            <Link
              to={primaryApp ? `/app/${primaryApp._id}/match` : '/dashboard'}
              className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/50 hover:shadow-sm transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Briefcase size={18} />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                  Target Match
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Skill gaps</div>
              </div>
            </Link>

            <Link
              to={primaryApp ? `/app/${primaryApp._id}/resume` : '/dashboard'}
              className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/50 hover:shadow-sm transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <FileText size={18} />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                  Resume Quality
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Bullet audits</div>
              </div>
            </Link>

            <Link
              to={primaryApp ? `/app/${primaryApp._id}/roadmap` : '/dashboard'}
              className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/50 hover:shadow-sm transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Compass size={18} />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                  Study Roadmap
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Daily plan</div>
              </div>
            </Link>

            <Link
              to={primaryApp ? `/app/${primaryApp._id}/practice` : '/dashboard'}
              className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/50 hover:shadow-sm transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <Cpu size={18} />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                  Practice Drills
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Coding & MCQs</div>
              </div>
            </Link>

            <Link
              to={primaryApp ? `/app/${primaryApp._id}/checklist` : '/dashboard'}
              className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-blue-500/50 hover:shadow-sm transition-all group flex flex-col justify-between min-h-[120px]"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <CheckCircle2 size={18} />
              </div>
              <div className="mt-3">
                <div className="font-bold text-xs text-[var(--text-primary)] group-hover:text-blue-600 transition-colors">
                  Final Checklist
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-0.5">Audit readiness</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
