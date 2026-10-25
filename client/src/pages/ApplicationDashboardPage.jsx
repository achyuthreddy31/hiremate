import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Award,
  Cpu,
  RefreshCw,
  FileText,
  Target,
  ListOrdered,
  Briefcase
} from 'lucide-react';

export default function ApplicationDashboardPage() {
  const { applicationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workflowStatus, setWorkflowStatus] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    fetchOverview();
    checkWorkflowStatus();
  }, [applicationId]);

  const fetchOverview = async () => {
    try {
      const res = await apiClient.get(`/readiness/overview/${applicationId}`);
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkWorkflowStatus = async () => {
    try {
      const res = await apiClient.get(`/workflow/status/${applicationId}`);
      setWorkflowStatus(res.data);
      if (res.data?.status === 'processing') {
        startPolling();
      }
    } catch (err) {
      // No active workflow found, normal state
    }
  };

  const startPolling = () => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const res = await apiClient.get(`/workflow/status/${applicationId}`);
        setWorkflowStatus(res.data);
        if (res.data?.status === 'completed' || res.data?.status === 'failed') {
          clearInterval(interval);
          setPolling(false);
          fetchOverview();
        }
      } catch (err) {
        clearInterval(interval);
        setPolling(false);
      }
    }, 2000);
  };

  const handleStartWorkflow = async () => {
    setError('');
    try {
      const res = await apiClient.post(`/workflow/start/${applicationId}`);
      setWorkflowStatus(res.data);
      startPolling();
    } catch (err) {
      setError(err.message || 'Failed to start workflow');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-64 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="text-xs text-[var(--text-muted)]">Loading preparation overview...</span>
        </div>
      </AppLayout>
    );
  }

  const app = data?.application;

  if (error || !app) {
    return (
      <AppLayout currentApplication={app || null}>
        <div className="max-w-2xl mx-auto py-12 px-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-900">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">
            {error ? 'Unable to load overview' : 'Target Application Not Found'}
          </h2>
          <p className="text-sm text-[var(--text-muted)] mb-6 max-w-md mx-auto">
            {error || 'The application you are trying to view could not be loaded or may not exist.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setError('');
                setLoading(true);
                fetchOverview();
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={14} />
              Retry Loading
            </button>
            <Link
              to="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-[var(--border-subtle)] text-[var(--text-main)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const match = data?.jobMatchScore;
  const readiness = data?.interviewReadinessScore;
  const roadmap = data?.roadmap;
  const checklist = data?.checklist;

  const validInterviewDate = app?.interviewDate && !isNaN(new Date(app.interviewDate).getTime())
    ? new Date(app.interviewDate).toLocaleDateString()
    : null;

  const stageDisplay = typeof workflowStatus?.currentStage === 'string'
    ? workflowStatus.currentStage.replace(/_/g, ' ')
    : 'Processing';

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white border border-indigo-900/50 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-2">
              <Target size={12} />
              <span>Target Preparation Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{app?.jobTitle || 'Target Role'}</h1>
            <div className="text-indigo-200 text-sm font-semibold mt-0.5">{app?.companyName || 'Company'}</div>

            {validInterviewDate && (
              <div className="flex items-center gap-2 text-xs text-indigo-300/80 mt-3">
                <Calendar size={13} />
                <span>Target Interview: {validInterviewDate}</span>
              </div>
            )}
          </div>

          {/* Workflow Action Button */}
          <div className="relative z-10 w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleStartWorkflow}
              disabled={polling || workflowStatus?.status === 'processing'}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold transition-all shadow hover:shadow-indigo-500/25 active:scale-95 disabled:opacity-60"
            >
              <Sparkles size={16} className={polling ? "animate-spin" : ""} />
              <span>{polling ? 'Running Workflow Pipeline...' : 'Prepare Completely'}</span>
            </button>
          </div>
        </div>

        {/* Workflow Progress Bar if active */}
        {workflowStatus && (workflowStatus.status === 'processing' || workflowStatus.progress < 100) && (
          <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-indigo-200 dark:border-indigo-900/60 shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                Workflow Progress: {stageDisplay}
              </span>
              <span className="font-bold">{workflowStatus.progress || 0}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${workflowStatus.progress || 10}%` }}
              />
            </div>
          </div>
        )}

        {/* KPI Dual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Job Match Score Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Job Match Score</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {match ? `${match.total}%` : 'Not Run'}
                  </div>
                </div>
                {match?.isProvisional ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    Provisional ({match.coverage}% coverage)
                  </span>
                ) : match ? (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Full Coverage ({match.coverage}%)
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                Deterministic calculation across technical skills, experience years, relevant projects, education level, keywords, and resume quality.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)]">Explainable requirements match</span>
              <Link to={`/app/${applicationId}/match`} className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                <span>View Why Panels</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Interview Readiness Score Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Interview Readiness</span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {readiness ? `${readiness.total}%` : '0%'}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {readiness?.statusSummary || '0 of 7 areas started'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-2 leading-relaxed">
                Active preparation effort metric across practice tests, auto-graded coding, questions prepared, company knowledge, and completed checklist tasks.
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)]">Preparation completion status</span>
              <Link to={`/app/${applicationId}/checklist`} className="text-indigo-600 font-bold hover:underline flex items-center gap-1">
                <span>View Readiness Breakdown</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Preparation Stages Flow */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-base sm:text-lg">Structured Preparation Flow</h3>
            
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to={`/app/${applicationId}/match`}
              className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/60 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  
                  <Briefcase size={15} className="text-indigo-500" />
                </div>
                <div className="font-bold text-sm group-hover:text-indigo-600 transition-colors">Target Job & Alignment</div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Extract real job requirements and review explainable "Why" panels.</p>
              </div>
              <div className="mt-3 pt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <span>Review Requirements</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to={`/app/${applicationId}/resume`}
              className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/60 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  
                  <FileText size={15} className="text-indigo-500" />
                </div>
                <div className="font-bold text-sm group-hover:text-indigo-600 transition-colors">Resume & Quality Check</div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Upload PDF in memory, check action verbs ratio, and verify extracted skills.</p>
              </div>
              <div className="mt-3 pt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <span>Upload & Verify Resume</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to={`/app/${applicationId}/roadmap`}
              className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/60 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  
                  <Clock size={15} className="text-indigo-500" />
                </div>
                <div className="font-bold text-sm group-hover:text-indigo-600 transition-colors">Preparation Roadmap</div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Dated study schedule allocating time proportionally across identified gaps.</p>
              </div>
              <div className="mt-3 pt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <span>View Roadmap Schedule</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to={`/app/${applicationId}/practice`}
              className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/60 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  
                  <Cpu size={15} className="text-indigo-500" />
                </div>
                <div className="font-bold text-sm group-hover:text-indigo-600 transition-colors">Practice & Auto-Graded Coding</div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Solve 10-question tests with auto-graded debugging and adaptive difficulty.</p>
              </div>
              <div className="mt-3 pt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <span>Start Practice Tests</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to={`/app/${applicationId}/company`}
              className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/60 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  
                  <BookOpen size={15} className="text-indigo-500" />
                </div>
                <div className="font-bold text-sm group-hover:text-indigo-600 transition-colors">Company Research Hub</div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Verified company culture facts, tech stack, leadership, and recruitment insights.</p>
              </div>
              <div className="mt-3 pt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <span>Explore Company Hub</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to={`/app/${applicationId}/checklist`}
              className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/60 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex justify-between items-center mb-1">
                  
                  <CheckCircle size={15} className="text-indigo-500" />
                </div>
                <div className="font-bold text-sm group-hover:text-indigo-600 transition-colors">Readiness & Final Checklist</div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Audit interview preparedness and complete final prerequisites before interview day.</p>
              </div>
              <div className="mt-3 pt-2 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
                <span>Complete Final Checklist</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
