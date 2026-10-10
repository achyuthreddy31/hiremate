import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { CheckCircle2, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

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
      setError(err.message);
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
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Interview Readiness & Final Checklist</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Active preparation effort across 7 core areas and finalized job-specific readiness checklist.
            </p>
          </div>
          <button
            onClick={handleRecalculate}
            disabled={calculating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={calculating ? "animate-spin" : ""} />
            <span>{calculating ? 'Updating...' : 'Update Readiness & Checklist'}</span>
          </button>
        </div>

        {/* Readiness 7 Areas Breakdown */}
        {readiness && (
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs uppercase font-semibold text-[var(--text-muted)]">Interview Readiness Score</span>
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {readiness.totalScore}%
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                {readiness.statusSummary}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
              {Object.entries(readiness.categories || {}).map(([key, cat]) => (
                <div key={key} className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cat.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700' : 'bg-slate-200 dark:bg-slate-700 text-[var(--text-muted)]'
                    }`}>
                      {cat.status === 'active' ? `${cat.score}%` : 'Not Started (0)'}
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
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="font-semibold text-base">Final Preparation Checklist</h3>
                <p className="text-xs text-[var(--text-muted)]">Actionable prerequisites prior to target interview</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
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
                    className={`p-3.5 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      isDone
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30 line-through text-[var(--text-muted)]'
                        : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] hover:border-slate-400'
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border ${
                      isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                    }`}>
                      {isDone && <CheckCircle2 size={12} />}
                    </div>
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-[var(--text-muted)]">{item.reason}</div>
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
