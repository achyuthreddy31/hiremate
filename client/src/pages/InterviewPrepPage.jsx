import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  HelpCircle,
  CheckSquare,
  Lock,
  Sparkles,
  RefreshCw,
  FileCheck,
  ChevronDown,
  Save,
  Check,
  AlertCircle,
  FolderGit2,
  ArrowRight
} from 'lucide-react';

export default function InterviewPrepPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [prep, setPrep] = useState(null);
  const [resumeImprovements, setResumeImprovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savingNotesIndex, setSavingNotesIndex] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('technical'); // 'technical' | 'behavioral' | 'project' | 'resume' | 'improvements' | 'stages'

  useEffect(() => {
    fetchPrepData();
  }, [applicationId]);

  const fetchPrepData = async () => {
    try {
      const [appRes, prepRes, impRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/interview-prep/${applicationId}`).catch(() => ({ data: null })),
        apiClient.get(`/interview-prep/resume-improvements/${applicationId}`).catch(() => ({ data: [] }))
      ]);
      setApp(appRes.data);
      setPrep(prepRes.data);
      setResumeImprovements(impRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load interview preparation');
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
      const impRes = await apiClient.get(`/interview-prep/resume-improvements/${applicationId}`);
      setResumeImprovements(impRes.data || []);
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
    setSavingNotesIndex(index);
    try {
      await apiClient.patch(`/interview-prep/${applicationId}/questions/${type}/${index}`, {
        prepared: currentPrepared,
        privateNotes: notes
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setSavingNotesIndex(null), 1000);
    }
  };

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Structured Interview Preparation</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Curated technical and behavioral questions, STAR guidance, and private self-tracking for {app?.companyName || 'your target company'}.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Structuring STAR Guidance...' : 'Generate Questions & STAR Guidance'}</span>
          </button>
        </div>


        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {!prep && !loading && (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-lg mx-auto shadow-sm">
            <HelpCircle size={32} className="text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-base">Preparation Material Not Yet Generated</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-5 leading-relaxed">
              Generate target technical questions, behavioral stories, and candidate-specific project deep dives.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
            >
              Generate Interview Preparation
            </button>
          </div>
        )}

        {prep && (
          <div className="space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 overflow-x-auto scrollbar-none">
              <button
                onClick={() => setActiveTab('technical')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'technical' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Technical ({prep.technicalQuestions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('behavioral')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'behavioral' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Behavioral (STAR) ({prep.behavioralQuestions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('project')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'project' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Project Deep Dives ({prep.projectBasedQuestions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('resume')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'resume' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Resume-Based ({prep.resumeBasedQuestions?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('improvements')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'improvements' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Resume Improvements ({resumeImprovements.length})
              </button>
              <button
                onClick={() => setActiveTab('stages')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  activeTab === 'stages' ? 'bg-blue-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Stage Checklists ({prep.stageChecklists?.length || 0})
              </button>
            </div>

            {/* View 1: Technical Questions */}
            {activeTab === 'technical' && (
              <div className="space-y-4">
                {prep.technicalQuestions?.map((q, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                          {q.category}
                        </span>
                        <h4 className="font-bold text-base sm:text-lg mt-2">{q.question}</h4>
                      </div>
                      <button
                        onClick={() => handleTogglePrepared('technicalQuestions', idx, q.prepared, q.privateNotes)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                          q.prepared
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                            : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                        }`}
                      >
                        <CheckSquare size={14} />
                        <span>{q.prepared ? 'Prepared' : 'Mark Prepared'}</span>
                      </button>
                    </div>

                    {/* STAR Framework Box */}
                    {q.starGuidance && (
                      <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs space-y-1.5 leading-relaxed">
                        <div className="font-bold text-[var(--text-primary)]">STAR Answer Framework:</div>
                        <div><span className="font-bold text-blue-600 dark:text-blue-400">Situation: </span>{q.starGuidance.situation}</div>
                        <div><span className="font-bold text-blue-600 dark:text-blue-400">Task: </span>{q.starGuidance.task}</div>
                        <div><span className="font-bold text-blue-600 dark:text-blue-400">Action: </span>{q.starGuidance.action}</div>
                        <div><span className="font-bold text-blue-600 dark:text-blue-400">Result: </span>{q.starGuidance.result}</div>
                      </div>
                    )}

                    {/* Expected Key Points */}
                    {q.expectedKeyPoints && q.expectedKeyPoints.length > 0 && (
                      <div className="text-xs space-y-1">
                        <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Expected Discussion Points:</span>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {q.expectedKeyPoints.map((pt, pIdx) => (
                            <span key={pIdx} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
                              {pt}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Private Notes */}
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-[11px] font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                          <Lock size={12} className="text-blue-500" />
                          <span>Private Reflection Notes:</span>
                        </label>
                        {savingNotesIndex === idx && (
                          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                            <Check size={12} /> Saved
                          </span>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        defaultValue={q.privateNotes || ''}
                        onBlur={(e) => handleSaveNotes('technicalQuestions', idx, e.target.value, q.prepared)}
                        placeholder="Type personal reflections, talking points, or project examples..."
                        className="w-full p-3 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-600 leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View 2: Behavioral Questions */}
            {activeTab === 'behavioral' && (
              <div className="space-y-4">
                {prep.behavioralQuestions?.map((q, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          {q.competency}
                        </span>
                        <h4 className="font-bold text-base sm:text-lg mt-2">{q.question}</h4>
                      </div>
                      <button
                        onClick={() => handleTogglePrepared('behavioralQuestions', idx, q.prepared, q.privateNotes)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                          q.prepared
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                            : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                        }`}
                      >
                        <CheckSquare size={14} />
                        <span>{q.prepared ? 'Prepared' : 'Mark Prepared'}</span>
                      </button>
                    </div>

                    {q.starGuidance && (
                      <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs space-y-1.5 leading-relaxed">
                        <div className="font-bold text-[var(--text-primary)]">STAR Answer Framework:</div>
                        <div><span className="font-bold text-emerald-600 dark:text-emerald-400">Situation: </span>{q.starGuidance.situation}</div>
                        <div><span className="font-bold text-emerald-600 dark:text-emerald-400">Task: </span>{q.starGuidance.task}</div>
                        <div><span className="font-bold text-emerald-600 dark:text-emerald-400">Action: </span>{q.starGuidance.action}</div>
                        <div><span className="font-bold text-emerald-600 dark:text-emerald-400">Result: </span>{q.starGuidance.result}</div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <textarea
                        rows={2}
                        defaultValue={q.privateNotes || ''}
                        onBlur={(e) => handleSaveNotes('behavioralQuestions', idx, e.target.value, q.prepared)}
                        placeholder="Draft your personal STAR story for this competency..."
                        className="w-full p-3 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-600 leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View 3: Project Deep Dives */}
            {activeTab === 'project' && (
              <div className="space-y-4">
                {prep.projectBasedQuestions?.map((q, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                          {q.projectTitle || 'Project Architecture'}
                        </span>
                        <h4 className="font-bold text-base mt-2">{q.question}</h4>
                      </div>
                      <button
                        onClick={() => handleTogglePrepared('projectBasedQuestions', idx, q.prepared, q.privateNotes)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                          q.prepared ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700' : 'border-[var(--border-subtle)]'
                        }`}
                      >
                        <CheckSquare size={14} />
                        <span>{q.prepared ? 'Prepared' : 'Mark Prepared'}</span>
                      </button>
                    </div>

                    {q.technicalDeepDive && (
                      <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                        <span className="font-bold text-[var(--text-primary)]">Architecture Focus: </span>
                        {q.technicalDeepDive}
                      </div>
                    )}

                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <textarea
                        rows={2}
                        defaultValue={q.privateNotes || ''}
                        onBlur={(e) => handleSaveNotes('projectBasedQuestions', idx, e.target.value, q.prepared)}
                        placeholder="Notes on architectural decisions, trade-offs, and metrics for this project..."
                        className="w-full p-3 rounded-xl text-xs bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-600 leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View 4: Resume Based Questions */}
            {activeTab === 'resume' && (
              <div className="space-y-4">
                {prep.resumeBasedQuestions?.map((q, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 shadow-sm">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                          {q.sourceSection} Focus
                        </span>
                        <h4 className="font-bold text-base mt-2">{q.question}</h4>
                      </div>
                      <button
                        onClick={() => handleTogglePrepared('resumeBasedQuestions', idx, q.prepared, q.privateNotes)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shrink-0 ${
                          q.prepared ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700' : 'border-[var(--border-subtle)]'
                        }`}
                      >
                        <CheckSquare size={14} />
                        <span>{q.prepared ? 'Prepared' : 'Mark Prepared'}</span>
                      </button>
                    </div>

                    {q.verificationFocus && (
                      <div className="text-xs text-[var(--text-muted)]">
                        <span className="font-bold">Interview Focus: </span>{q.verificationFocus}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* View 5: Truthful Resume Improvements */}
            {activeTab === 'improvements' && (
              <div className="space-y-4">
                {resumeImprovements.map((imp, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        {imp.category.replace(/_/g, ' ')}
                      </span>
                      {imp.needsUserInput && (
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          Metric Required
                        </span>
                      )}
                    </div>
                    <div className="text-xs space-y-1.5 leading-relaxed">
                      <div><span className="font-bold text-slate-500 dark:text-slate-400">Previous Draft: </span><span className="text-slate-700 dark:text-slate-200 font-medium">{imp.original}</span></div>
                      <div><span className="font-bold text-emerald-600 dark:text-emerald-400">Truthful Rewrite: </span><span className="font-semibold">{imp.suggestion}</span></div>
                      <div className="text-[var(--text-muted)] mt-1">{imp.reason}</div>
                      {imp.promptForUser && (
                        <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-semibold mt-2">
                          Candidate Input Needed: {imp.promptForUser}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View 6: Stage Checklists */}
            {activeTab === 'stages' && (
              <div className="space-y-4">
                {prep.stageChecklists?.map((stage, idx) => (
                  <div key={idx} className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 shadow-sm">
                    <h4 className="font-bold text-base">{stage.stage}</h4>
                    <div className="space-y-2">
                      {stage.items?.map((item, iIdx) => (
                        <div key={iIdx} className="flex items-center gap-2.5 text-xs">
                          <CheckSquare size={15} className="text-blue-500 shrink-0" />
                          <span>{item.title}</span>
                        </div>
                      ))}
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
