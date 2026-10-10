import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  Briefcase,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  HelpCircle,
  FileText,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function JobMatchPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'strong' | 'good' | 'gaps' | 'categories'

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
      setError(err.message || 'Failed to load match report');
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
      setError(err.message || 'Failed to calculate alignment');
    } finally {
      setRunning(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'strong':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Strong (≥75)
          </span>
        );
      case 'good':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Good (50–74)
          </span>
        );
      case 'needs_improvement':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Needs Improvement (1–49)
          </span>
        );
      case 'insufficient_data':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Insufficient Data
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Missing (0)
          </span>
        );
    }
  };

  const requirements = report?.requirementsResults || [];
  const filteredReqs = requirements.filter(r => {
    if (activeTab === 'strong') return r.status === 'strong';
    if (activeTab === 'good') return r.status === 'good';
    if (activeTab === 'gaps') return r.status === 'needs_improvement' || r.status === 'missing' || r.status === 'insufficient_data';
    return true;
  });

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Job Analysis & Alignment Score</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Transparent, explainable requirements evaluation computed strictly in backend code.
            </p>
          </div>
          <button
            onClick={handleRunMatch}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={15} className={running ? "animate-spin" : ""} />
            <span>{running ? 'Calculating Pure Alignment...' : 'Calculate Alignment Score'}</span>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-start gap-3">
          <AlertCircle size={17} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-semibold text-[var(--text-primary)]">Non-Negotiable Product Rule: </span>
            The alignment score is an indicator of target job alignment and preparation completeness. It is never a hiring probability.
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {!report && !loading && (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-lg mx-auto shadow-sm">
            <Briefcase size={32} className="text-indigo-600 mx-auto mb-3" />
            <h3 className="font-bold text-base">Alignment Not Yet Calculated</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-5">
              Click "Calculate Alignment Score" to parse requirements and evaluate your profile against the target job.
            </p>
            <button
              onClick={handleRunMatch}
              disabled={running}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              Run Job Alignment Analysis
            </button>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Top Score Summary Banner */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Target Alignment Score</span>
                <div className="text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                  {report.totalScore}%
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                  Weighted sum over included categories
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Coverage Indicator</span>
                <div className="text-2xl font-bold mt-1">
                  {report.coverage} / 100
                </div>
                {report.isProvisional ? (
                  <span className="inline-block mt-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    Provisional Status (&lt;60% coverage)
                  </span>
                ) : (
                  <span className="inline-block mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    High Coverage Met (≥60%)
                  </span>
                )}
              </div>

              <div className="flex flex-col justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Next Recommended Step</span>
                <Link
                  to={`/app/${applicationId}/roadmap`}
                  className="inline-flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-600 hover:text-white transition-colors"
                >
                  <span>Generate Preparation Roadmap</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* 6 Category Breakdown Cards */}
            {report.categoryScores && (
              <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
                <h3 className="font-extrabold text-base">Weighted Scoring Categories</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {Object.entries(report.categoryScores).map(([catKey, catVal]) => (
                    <div key={catKey} className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold capitalize">{catKey.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                          {catVal.status === 'included' ? `${catVal.score}% (W: ${catVal.weight})` : `${catVal.status}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-tight">{catVal.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'all' ? 'bg-indigo-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                All Requirements ({requirements.length})
              </button>
              <button
                onClick={() => setActiveTab('strong')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'strong' ? 'bg-emerald-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Strong ({requirements.filter(r => r.status === 'strong').length})
              </button>
              <button
                onClick={() => setActiveTab('good')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'good' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Good ({requirements.filter(r => r.status === 'good').length})
              </button>
              <button
                onClick={() => setActiveTab('gaps')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'gaps' ? 'bg-amber-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Skill Gaps ({requirements.filter(r => r.status !== 'strong' && r.status !== 'good').length})
              </button>
            </div>

            {/* Requirements Cards with Why Panels */}
            <div className="space-y-3.5">
              {filteredReqs.map((req, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-sm sm:text-base">{req.normalizedName}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] capitalize">
                        {req.importance} (Weight {req.importance === 'critical' ? 3 : req.importance === 'important' ? 2 : 1})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold">Score: {req.score}/100</span>
                      {getStatusBadge(req.status)}
                    </div>
                  </div>

                  {/* Why Panel */}
                  <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs space-y-1.5">
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Why this status: </span>
                      <span className="text-[var(--text-muted)]">{req.explanation}</span>
                    </div>
                    <div>
                      <span className="font-bold text-[var(--text-primary)]">Recommended Action: </span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">{req.recommendedAction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
