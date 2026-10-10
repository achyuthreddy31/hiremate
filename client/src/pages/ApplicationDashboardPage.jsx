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
  Cpu
} from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

export default function ApplicationDashboardPage() {
  const { applicationId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workflowStarting, setWorkflowStarting] = useState(false);

  useEffect(() => {
    fetchOverview();
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

  const handleStartWorkflow = async () => {
    setWorkflowStarting(true);
    try {
      await apiClient.post(`/workflow/start/${applicationId}`);
      // Refresh overview
      setTimeout(() => {
        fetchOverview();
        setWorkflowStarting(false);
      }, 1500);
    } catch (err) {
      setError(err.message);
      setWorkflowStarting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AppLayout>
    );
  }

  const app = data?.application;
  const match = data?.jobMatchScore;
  const readiness = data?.interviewReadinessScore;
  const roadmap = data?.roadmap;
  const checklist = data?.checklist;

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-indigo-300 font-semibold">Target Application Dashboard</div>
            <h1 className="text-2xl font-bold mt-1">{app?.jobTitle}</h1>
            <div className="text-indigo-200 text-sm mt-0.5">{app?.companyName}</div>
          </div>
          <button
            onClick={handleStartWorkflow}
            disabled={workflowStarting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold transition-all shadow-md disabled:opacity-50"
          >
            <Sparkles size={16} />
            <span>{workflowStarting ? 'Running Workflow...' : 'Prepare Completely'}</span>
          </button>
        </div>

        {/* Notice */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-center gap-2">
          <AlertCircle size={15} className="text-amber-500 shrink-0" />
          <span>
            The alignment score is an indicator of job requirements match and preparation effort. It is never a hiring probability.
          </span>
        </div>

        {/* Dual Scores KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Job Match Score Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Job Match Score</span>
                <div className="text-3xl font-bold mt-1">
                  {match ? `${match.total}%` : 'Not Calculated'}
                </div>
              </div>
              {match?.isProvisional && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                  Provisional (Coverage: {match.coverage}%)
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Weighted alignment across skills, experience, projects, education, keywords, and resume structure.
            </p>
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)]">Target requirements match</span>
              <Link to={`/app/${applicationId}/match`} className="text-indigo-600 font-semibold hover:underline">
                View Requirements →
              </Link>
            </div>
          </div>

          {/* Interview Readiness Score Card */}
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Interview Readiness</span>
                <div className="text-3xl font-bold mt-1">
                  {readiness ? `${readiness.total}%` : '0%'}
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                {readiness?.statusSummary || '0 of 7 areas started'}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Measures preparation effort across tests, auto-graded coding, company knowledge, questions prepared, and checklist.
            </p>
            <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)]">Preparation progress</span>
              <Link to={`/app/${applicationId}/checklist`} className="text-indigo-600 font-semibold hover:underline">
                View Readiness Breakdown →
              </Link>
            </div>
          </div>
        </div>

        {/* Preparation Modules Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to={`/app/${applicationId}/resume`}
            className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-xs text-[var(--text-muted)] font-medium">Step 1</div>
              <div className="font-semibold text-sm group-hover:text-indigo-600">Resume & Quality</div>
            </div>
            <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to={`/app/${applicationId}/roadmap`}
            className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-xs text-[var(--text-muted)] font-medium">Step 2</div>
              <div className="font-semibold text-sm group-hover:text-indigo-600">Roadmap Plan</div>
            </div>
            <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to={`/app/${applicationId}/practice`}
            className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-xs text-[var(--text-muted)] font-medium">Step 3</div>
              <div className="font-semibold text-sm group-hover:text-indigo-600">Practice & Coding</div>
            </div>
            <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            to={`/app/${applicationId}/company`}
            className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-indigo-500/50 transition-all flex items-center justify-between group"
          >
            <div>
              <div className="text-xs text-[var(--text-muted)] font-medium">Step 4</div>
              <div className="font-semibold text-sm group-hover:text-indigo-600">Company Quiz</div>
            </div>
            <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
