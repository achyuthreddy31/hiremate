import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  Briefcase,
  Plus,
  ArrowRight,
  Calendar,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Trash2,
  ExternalLink,
  Target,
  CheckCircle,
  FileCheck
} from 'lucide-react';

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get('/applications');
      setApplications(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApplication = async (e, id, companyName) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to delete "${companyName}"? This will permanently delete its job analysis, resume data, and preparation records.`)) {
      return;
    }

    setDeletingId(id);
    try {
      await apiClient.delete(`/applications/${id}`);
      setApplications(prev => prev.filter(app => app._id !== id));
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Job Applications Hub</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Select an active target application to open its personalized roadmap, match score, and practice modules.
            </p>
          </div>
          <Link
            to="/applications/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow active:scale-95"
          >
            <Plus size={16} />
            <span>New Target Application</span>
          </Link>
        </div>

        {/* Product Notice Card */}
        <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-[var(--border-subtle)] flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--text-muted)] leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)]">Explainable Alignment Indicator: </span>
            HireMate AI calculates transparent skill alignment scores and readiness metrics directly in code based on real job requirements. Scores are indicators of alignment and preparation effort—never hiring probabilities.
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-52 rounded-2xl bg-slate-200/70 dark:bg-slate-800/40 animate-pulse border border-[var(--border-subtle)]" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && applications.length === 0 && (
          <div className="text-center py-16 px-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-100 dark:border-indigo-900">
              <Target size={28} />
            </div>
            <h3 className="text-lg font-bold">No Target Job Applications</h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md mx-auto mt-1.5 mb-6 leading-relaxed">
              Target a specific company and role. HireMate AI will analyze the real job description, discover skill gaps, calculate your match score, and schedule your study roadmap.
            </p>
            <Link
              to="/applications/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs sm:text-sm transition-all shadow hover:shadow-md"
            >
              <Plus size={16} />
              <span>Create Target Job Application</span>
            </Link>
          </div>
        )}

        {/* Applications List / Cards */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => (
              <div
                key={app._id}
                className="group p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-sm hover:shadow-md relative"
              >
                <div>
                  {/* Top Badges & Delete */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 capitalize border border-indigo-100 dark:border-indigo-900">
                      {app.employmentType.replace('_', ' ')}
                    </span>
                    <button
                      onClick={(e) => handleDeleteApplication(e, app._id, app.companyName)}
                      disabled={deletingId === app._id}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete application"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Title & Company */}
                  <h3 className="font-bold text-base sm:text-lg group-hover:text-indigo-600 transition-colors truncate">
                    {app.jobTitle}
                  </h3>
                  <div className="text-xs sm:text-sm font-semibold text-[var(--text-muted)] mt-0.5 truncate">
                    {app.companyName}
                  </div>

                  {/* Stats / Context */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-[11px] text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5 truncate">
                      <Clock size={13} className="text-indigo-500" />
                      <span>{app.dailyPreparationMinutes}m / day</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={13} className="text-indigo-500" />
                      <span>{app.interviewDate ? new Date(app.interviewDate).toLocaleDateString() : `${app.availableDays} days plan`}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-5 pt-3">
                  <Link
                    to={`/app/${app._id}/dashboard`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                  >
                    <span>Open Preparation Center</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
