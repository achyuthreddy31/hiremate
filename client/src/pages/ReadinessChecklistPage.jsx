import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function ReadinessChecklistPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [readiness, setReadiness] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [applicationId]);

  const fetchData = async () => {
    try {
      const [appRes, readRes, checkRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/readiness/readiness/${applicationId}`).catch(() => ({ data: null })),
        apiClient.get(`/readiness/checklist/${applicationId}`).catch(() => ({ data: null }))
      ]);
      setApp(appRes.data);
      setReadiness(readRes.data);
      setChecklist(checkRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load readiness data');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculate = async () => {
    setCalculating(true);
    setError('');
    try {
      await apiClient.post(`/readiness/checklist/${applicationId}`);
      const res = await apiClient.post(`/readiness/readiness/${applicationId}`);
      setReadiness(res.data);
      fetchData();
    } catch (err) {
      setError(err.message || 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  const handleToggleChecklist = async (index, currentStatus) => {
    const next = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const res = await apiClient.patch(`/readiness/checklist/${applicationId}/${index}`, { status: next });
      setChecklist(res.data);
      // Update readiness snapshot in background to reflect checklist change
      apiClient.post(`/readiness/readiness/${applicationId}`).then(r => setReadiness(r.data));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Interview Readiness & Final Checklist</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Active preparation effort across 7 core areas and finalized job-specific readiness checklist.
            </p>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={calculating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={15} className={calculating ? "animate-spin" : ""} />
            <span>{calculating ? 'Recomputing Readiness...' : 'Update Readiness & Checklist'}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Readiness 7 Areas Breakdown */}
        {readiness && (
          <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Interview Readiness Score</span>
                <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                  {readiness.totalScore}%
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {readiness.statusSummary}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
              {Object.entries(readiness.categories || {}).map(([key, cat]) => (
                <div key={key} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-extrabold border ${
                        cat.status === 'active'
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-200 dark:bg-slate-800 text-[var(--text-muted)] border-[var(--border-subtle)]'
                      }`}
                    >
                      {cat.status === 'active' ? `${cat.score}% (W: ${cat.weight})` : 'Not Started (0)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] leading-tight">{cat.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Final Checklist */}
        {checklist && (
          <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg">Final Preparation Checklist</h3>
                <p className="text-xs text-[var(--text-muted)]">Check off items as you complete your final interview preparations</p>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-[var(--border-subtle)]">
                {checklist.completionPercentage}% Complete
              </span>
            </div>

            <div className="space-y-3">
              {checklist.items?.map((item, idx) => {
                const isDone = item.status === 'completed';
                return (
                  <div
                    key={idx}
                    onClick={() => handleToggleChecklist(idx, item.status)}
                    onKeyDown={(e) => {
                      if (e.key === ' ' || e.key === 'Enter') {
                        e.preventDefault();
                        handleToggleChecklist(idx, item.status);
                      }
                    }}
                    role="checkbox"
                    aria-checked={isDone}
                    tabIndex={0}
                    className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3.5 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isDone
                        ? 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-500/40'
                        : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] hover:border-slate-400'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-md shrink-0 flex items-center justify-center border-2 transition-colors ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 hover:border-blue-500'
                      }`}
                    >
                      {isDone && <CheckCircle2 size={13} className="text-white" />}
                    </div>
                    <div className="text-xs space-y-1 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-primary)]">
                          {item.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] capitalize">
                          {item.priority}
                        </span>
                        {isDone && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="text-[var(--text-muted)] leading-relaxed">{item.reason}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
