import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { HelpCircle, CheckSquare, Lock, Sparkles, RefreshCw } from 'lucide-react';

export default function InterviewPrepPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [prep, setPrep] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPrepData();
  }, [applicationId]);

  const fetchPrepData = async () => {
    try {
      const [appRes, prepRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/interview-prep/${applicationId}`).catch(() => ({ data: null }))
      ]);
      setApp(appRes.data);
      setPrep(prepRes.data);
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
      const res = await apiClient.post(`/interview-prep/generate/${applicationId}`);
      setPrep(res.data);
    } catch (err) {
      setError(err.message || 'Failed to generate prep');
    } finally {
      setGenerating(false);
    }
  };

  const handleTogglePrepared = async (type, index, currentStatus, currentNotes) => {
    try {
      await apiClient.patch(`/interview-prep/${applicationId}/questions/${type}/${index}`, {
        prepared: !currentStatus,
        privateNotes: currentNotes || ''
      });
      fetchPrepData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveNotes = async (type, index, notes, currentPrepared) => {
    try {
      await apiClient.patch(`/interview-prep/${applicationId}/questions/${type}/${index}`, {
        prepared: currentPrepared,
        privateNotes: notes
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Structured Interview Preparation</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Curated technical and behavioral questions, STAR guidance, and private self-tracking. Focused on structured question prep and self-tracking.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Generating...' : 'Generate Questions & STAR Guidance'}</span>
          </button>
        </div>

        {/* Private Notes Notice */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] flex items-center gap-2">
          <Lock size={15} className="text-indigo-500 shrink-0" />
          <span>
            Candidate Privacy: Typed personal notes are stored locally in your private record. They are never sent to AI and do not affect scoring.
          </span>
        </div>

        {prep && (
          <div className="space-y-6">
            {/* Technical Questions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-base">Target Technical Questions</h3>
              {prep.technicalQuestions?.map((q, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 capitalize">
                        {q.category}
                      </span>
                      <h4 className="font-semibold text-base mt-2">{q.question}</h4>
                    </div>
                    <button
                      onClick={() => handleTogglePrepared('technicalQuestions', idx, q.prepared, q.privateNotes)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        q.prepared
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                          : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                      }`}
                    >
                      <CheckSquare size={14} />
                      <span>{q.prepared ? 'Prepared' : 'Mark Prepared'}</span>
                    </button>
                  </div>

                  {/* STAR Guidance */}
                  {q.starGuidance && (
                    <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] text-xs space-y-1.5">
                      <div className="font-semibold text-[var(--text-primary)]">STAR Answer Framework:</div>
                      <div><span className="font-semibold text-indigo-500">S: </span>{q.starGuidance.situation}</div>
                      <div><span className="font-semibold text-indigo-500">T: </span>{q.starGuidance.task}</div>
                      <div><span className="font-semibold text-indigo-500">A: </span>{q.starGuidance.action}</div>
                      <div><span className="font-semibold text-indigo-500">R: </span>{q.starGuidance.result}</div>
                    </div>
                  )}

                  {/* Private Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Private Reflection Notes</label>
                    <textarea
                      rows={2}
                      defaultValue={q.privateNotes}
                      onBlur={(e) => handleSaveNotes('technicalQuestions', idx, e.target.value, q.prepared)}
                      placeholder="Record your personal notes, reminders, and stories here..."
                      className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Resume-Based Questions */}
            {prep.resumeBasedQuestions?.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-base">Resume-Based Deep Dive Questions</h3>
                {prep.resumeBasedQuestions.map((q, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm">{q.question}</h4>
                      <button
                        onClick={() => handleTogglePrepared('resumeBasedQuestions', idx, q.prepared, q.privateNotes)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                          q.prepared ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700' : 'border-[var(--border-subtle)]'
                        }`}
                      >
                        <CheckSquare size={14} />
                        <span>{q.prepared ? 'Prepared' : 'Mark Prepared'}</span>
                      </button>
                    </div>
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
