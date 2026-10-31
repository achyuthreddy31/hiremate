import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  Compass,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  RefreshCw,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Target,
  Code2,
  Layers,
  Sparkles
} from 'lucide-react';

export default function RoadmapPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'recommendations'

  useEffect(() => {
    fetchRoadmapData();
  }, [applicationId]);

  const fetchRoadmapData = async () => {
    try {
      const [appRes, roadRes, recsRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/roadmap/${applicationId}`).catch(() => ({ data: null })),
        apiClient.get(`/roadmap/recommendations/${applicationId}`).catch(() => ({ data: [] }))
      ]);
      setApp(appRes.data);
      setRoadmap(roadRes.data);
      setRecommendations(recsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await apiClient.post(`/roadmap/generate/${applicationId}`);
      setRoadmap(res.data);
      const recsRes = await apiClient.get(`/roadmap/recommendations/${applicationId}`);
      setRecommendations(recsRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const res = await apiClient.patch(`/roadmap/${applicationId}/tasks/${task._id}`, { status: nextStatus });
      setRoadmap(res.data);
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
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Dated Preparation Roadmap</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Time allocated progressively across identified gaps. Each day structures 3 sequential stages: Fundamentals, Guided Practice, and Advanced Challenges.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Calculating Schedule...' : 'Generate / Re-Plan Roadmap'}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {!roadmap && !loading && (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-lg mx-auto shadow-sm">
            <Compass size={32} className="text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-base">Roadmap Not Yet Generated</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-5 leading-relaxed">
              Generate a dated roadmap allocating your daily study time across prioritized skill gaps.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Generate Daily Roadmap
            </button>
          </div>
        )}

        {roadmap && (
          <div className="space-y-6">
            {/* Progress Metrics Bar */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Roadmap Completion</span>
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                  {roadmap.completionPercentage}%
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-[var(--text-muted)]">
                <div>
                  <div className="font-bold text-[var(--text-primary)] text-sm">{roadmap.totalDays} Days</div>
                  <span>Total Duration</span>
                </div>
                <div className="border-l border-[var(--border-subtle)] pl-6">
                  <div className="font-bold text-[var(--text-primary)] text-sm">{roadmap.dailyMinutes} Mins</div>
                  <span>Daily Study Quota</span>
                </div>
                <div className="border-l border-[var(--border-subtle)] pl-6">
                  <div className="font-bold text-[var(--text-primary)] text-sm">{roadmap.tasks?.length || 0}</div>
                  <span>Scheduled Tasks</span>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'tasks' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Day-by-Day Schedule ({roadmap.tasks?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'recommendations' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Grounded Learning Resources ({recommendations.length})
              </button>
            </div>

            {/* Tasks Tab View */}
            {activeTab === 'tasks' && (
              <div className="space-y-4">
                {roadmap.tasks?.map((task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task._id}
                      className={`p-5 rounded-2xl border transition-all shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className={`mt-1 w-5 h-5 rounded-lg flex items-center justify-center border transition-all active:scale-95 shrink-0 ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-400 hover:border-blue-600'
                          }`}
                          title="Toggle completed status"
                        >
                          {isCompleted && <CheckCircle2 size={13} />}
                        </button>

                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                {task.dayLabel || `Day ${task.day}`}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                                {task.estimatedMinutes} mins
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] capitalize">
                                Priority: {task.priority}
                              </span>
                              <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] capitalize">
                                Level: {task.difficulty}
                              </span>
                              {isCompleted && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                  Completed
                                </span>
                              )}
                              <h4 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">
                                {task.title}
                              </h4>
                            </div>
                          </div>

                          {/* Learning Objective */}
                          {task.learningObjectives && (
                            <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                              <Sparkles size={13} className="shrink-0 text-blue-500" />
                              <span><strong className="font-bold text-blue-900 dark:text-blue-200">Objective:</strong> {task.learningObjectives}</span>
                            </div>
                          )}

                          {/* 3 Sequential Stages - Unified, Professional Design System */}
                          <div className="space-y-2.5 pt-1">
                            {/* Stage 1: Fundamentals & Concepts */}
                            <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs space-y-1.5">
                              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider">
                                <BookOpen size={14} className="text-blue-500 shrink-0" />
                                <span>Stage 1 — Fundamentals & Concepts</span>
                              </div>
                              <p className="text-[var(--text-primary)] leading-relaxed pl-5 font-normal text-xs">
                                {task.stage1_fundamentals || task.learningActivity}
                              </p>
                            </div>

                            {/* Stage 2: Guided Coding Practice */}
                            <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs space-y-1.5">
                              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider">
                                <Code2 size={14} className="text-blue-500 shrink-0" />
                                <span>Stage 2 — Guided Coding Practice</span>
                              </div>
                              <p className="text-[var(--text-primary)] leading-relaxed pl-5 font-normal text-xs">
                                {task.stage2_guidedPractice || task.practiceActivity}
                              </p>
                            </div>

                            {/* Stage 3: Advanced Topics & Challenges */}
                            <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs space-y-1.5">
                              <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400 text-xs uppercase tracking-wider">
                                <Target size={14} className="text-blue-500 shrink-0" />
                                <span>Stage 3 — Advanced Topics & Challenges</span>
                              </div>
                              <p className="text-[var(--text-primary)] leading-relaxed pl-5 font-normal text-xs">
                                {task.stage3_advancedTopics || 'Analyze edge cases, concurrency pitfalls, and execute rigorous interview-level coding challenges.'}
                              </p>
                            </div>
                          </div>

                          <div className="italic text-slate-500 dark:text-slate-400 text-[11px] pt-1">
                            {task.reason}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recommendations Tab View */}
            {activeTab === 'recommendations' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        {rec.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">{rec.estimatedMinutes} mins</span>
                    </div>
                    <h4 className="font-bold text-sm">{rec.title}</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{rec.reason}</p>
                    {rec.searchQuery && (
                      <div className="pt-2 border-t border-[var(--border-subtle)] text-[11px]">
                        <span className="font-semibold text-[var(--text-muted)]">Search Query: </span>
                        <span className="font-mono text-blue-600 dark:text-blue-400">{rec.searchQuery}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
