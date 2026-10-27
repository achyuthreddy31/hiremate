import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
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
  Target
} from 'lucide-react';

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Applications Hub</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Manage your target job applications, review deterministic readiness scores, and track your dated roadmap.
            </p>
          </div>
          <Link
            to="/applications/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-all shadow hover:shadow-indigo-500/20 active:scale-95"
          >
            <Plus size={16} />
            <span>New Target Application</span>
          </Link>
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
              Target a specific company and role. HireMate Nexus will analyze the real job description, discover skill gaps, calculate your match score, and schedule your study roadmap.
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
                className="group relative p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/50 transition-colors flex flex-col justify-between min-h-[208px] shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                      {app.status || 'Active'}
                    </span>
                    <button
                      onClick={(e) => handleDelete(e, app._id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                      title="Delete target job application"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="font-extrabold text-base mt-2.5 group-hover:text-indigo-600 transition-colors truncate" title={app.jobTitle}>
                    {app.jobTitle}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium mt-0.5 truncate">
                    <Building size={13} className="shrink-0" />
                    <span className="truncate">{app.companyName}</span>
                  </div>

                  {/* Application Metrics */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-indigo-500" />
                      <span>{app.dailyPreparationMinutes || 60}m / day</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-indigo-500" />
                      <span>
                        {app.interviewDate
                          ? new Date(app.interviewDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : `${app.availableDays || 14} days prep`}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Target Preparation</span>
                  <Link
                    to={`/app/${app._id}/dashboard`}
                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"
                  >
                    <ArrowRight size={15} />
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
