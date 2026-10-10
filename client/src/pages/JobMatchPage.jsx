import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { Briefcase, AlertCircle, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';

export default function JobMatchPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatchData();
  }, [applicationId]);

  const fetchMatchData = async () => {
    try {
      const [appRes, matchRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/jobs/match/${applicationId}`).catch(() => ({ data: null }))
      ]);
      setApp(appRes.data);
      setReport(matchRes.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatch = async () => {
    setRunning(true);
    setError('');
    try {
      await apiClient.post(`/jobs/analyze/${applicationId}`);
      const res = await apiClient.post(`/jobs/match/${applicationId}`);
      setReport(res.data);
    } catch (err) {
      setError(err.message || 'Failed to calculate match');
    } finally {
      setRunning(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'strong':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Strong (≥75)</span>;
      case 'good':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">Good (50-74)</span>;
      case 'needs_improvement':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">Needs Improvement (1-49)</span>;
      case 'insufficient_data':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">Insufficient Data</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">Missing (0)</span>;
    }
  };

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Analysis & Alignment Score</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Transparent, explainable requirements evaluation computed strictly in backend code.
            </p>
          </div>
          <button
            onClick={handleRunMatch}
            disabled={running}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={running ? "animate-spin" : ""} />
            <span>{running ? 'Calculating...' : 'Recalculate Alignment'}</span>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-center gap-2">
          <AlertCircle size={15} className="text-amber-500 shrink-0" />
          <span>{report?.disclaimer || 'The score is an alignment and preparation indicator. It is never a hiring probability.'}</span>
        </div>

        {report && (
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold">Total Match Score</span>
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {report.totalScore}%
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[var(--text-muted)]">Coverage Metric: </span>
                <span className="text-xs font-bold">{report.coverage} / 100</span>
                {report.isProvisional && (
                  <div className="text-xs text-amber-500 font-semibold mt-0.5">Provisional Score (&lt;60% coverage)</div>
                )}
              </div>
            </div>

            {/* Requirements Table with Explainable "Why" Panels */}
            <div className="space-y-4 pt-2">
              <h3 className="font-semibold text-base">Requirement Breakdown & Why Panels</h3>
              <div className="space-y-3">
                {report.requirementsResults?.map((req, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{req.normalizedName}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[var(--text-muted)] capitalize">
                          {req.importance} (Weight {req.importance === 'critical' ? 3 : req.importance === 'important' ? 2 : 1})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold">Score: {req.score}/100</span>
                        {getStatusBadge(req.status)}
                      </div>
                    </div>

                    {/* Why explanation panel */}
                    <div className="p-3 rounded-lg bg-[var(--bg-surface)] text-xs text-[var(--text-muted)] space-y-1">
                      <div><span className="font-semibold text-[var(--text-primary)]">Why this status: </span>{req.explanation}</div>
                      <div><span className="font-semibold text-[var(--text-primary)]">Recommended Action: </span>{req.recommendedAction}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
