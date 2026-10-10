import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { Compass, CheckCircle2, Clock, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

export default function RoadmapPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRoadmapData();
  }, [applicationId]);

  const fetchRoadmapData = async () => {
    try {
      const [appRes, roadRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/roadmap/${applicationId}`).catch(() => ({ data: null }))
      ]);
      setApp(appRes.data);
      setRoadmap(roadRes.data);
    } catch (err) {
      setError(err.message);
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dated Preparation Roadmap</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Time allocated proportionally across identified gaps with minimum 20-min slots. Final day reserved for comprehensive review.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Allocating...' : 'Generate / Re-Plan Roadmap'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {roadmap && (
          <div className="space-y-6">
            {/* Progress Header */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-semibold text-[var(--text-muted)]">Progress</span>
                <div className="text-2xl font-bold">{roadmap.completionPercentage}% Completed</div>
              </div>
              <div className="text-right text-xs text-[var(--text-muted)]">
                <div>Total Days: {roadmap.totalDays}</div>
                <div>Daily Preparation: {roadmap.dailyMinutes} mins</div>
              </div>
            </div>

            {/* Task Timeline */}
            <div className="space-y-4">
              {roadmap.tasks?.map((task) => {
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task._id}
                    className={`p-4 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-slate-50 dark:bg-slate-900/40 border-emerald-500/30 opacity-75'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className={`mt-1 w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                            isCompleted
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-400 hover:border-indigo-600'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 size={14} />}
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                              Day {task.day}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                              {task.estimatedMinutes} mins
                            </span>
                            <h4 className={`font-semibold text-sm ${isCompleted ? 'line-through text-[var(--text-muted)]' : ''}`}>
                              {task.title}
                            </h4>
                          </div>
                          <div className="text-xs text-[var(--text-muted)] mt-2 space-y-1">
                            <div><span className="font-semibold text-[var(--text-primary)]">Learning Activity: </span>{task.learningActivity}</div>
                            <div><span className="font-semibold text-[var(--text-primary)]">Practice Activity: </span>{task.practiceActivity}</div>
                            <div className="italic text-slate-500">{task.reason}</div>
                          </div>
                        </div>
                      </div>
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
