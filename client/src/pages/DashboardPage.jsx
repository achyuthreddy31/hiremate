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
  Award,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function DashboardPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await apiClient.get('/applications');
      setApplications(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Target Job Applications</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Select or create a target job application to focus your dated preparation workflow.
            </p>
          </div>
          <Link
            to="/applications/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            <Plus size={16} />
            <span>New Target Application</span>
          </Link>
        </div>

        {/* Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-[var(--border-subtle)] flex items-start gap-3">
          <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--text-muted)] leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)]">Product Notice: </span>
            HireMate AI alignment and readiness scores reflect transparent target job alignment and preparation effort. They are never a hiring probability.
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 rounded-xl bg-slate-200 dark:bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && applications.length === 0 && (
          <div className="text-center py-16 px-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
              <Briefcase size={24} />
            </div>
            <h3 className="text-lg font-semibold">No Target Applications Yet</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto mt-1 mb-6">
              Add your chosen company, role, job description, and interview timeline to unlock your personalized preparation roadmap.
            </p>
            <Link
              to="/applications/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
            >
              <Plus size={16} />
              <span>Create Target Application</span>
            </Link>
          </div>
        )}

        {/* Applications Grid */}
        {!loading && applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {applications.map((app) => (
              <div
                key={app._id}
                className="group p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                      {app.employmentType.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] capitalize">{app.experienceLevel.replace('_', ' ')}</span>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-indigo-600 transition-colors">{app.jobTitle}</h3>
                  <div className="text-sm font-medium text-[var(--text-muted)] mt-0.5">{app.companyName}</div>

                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{app.dailyPreparationMinutes}m / day</span>
                    </div>
                    {app.interviewDate && (
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{new Date(app.interviewDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <Link
                    to={`/app/${app._id}/dashboard`}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-medium text-xs hover:bg-indigo-600 hover:text-white transition-colors"
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
