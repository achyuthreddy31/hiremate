import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { BookOpen, CheckCircle, ExternalLink, HelpCircle, RefreshCw } from 'lucide-react';

export default function CompanyResearchPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCompanyData();
  }, [applicationId]);

  const fetchCompanyData = async () => {
    try {
      const [appRes, compRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/company/${applicationId}`).catch(() => ({ data: null }))
      ]);
      setApp(appRes.data);
      setResearch(compRes.data);
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
      const res = await apiClient.post(`/company/generate/${applicationId}`);
      setResearch(res.data);
    } catch (err) {
      setError(err.message || 'Failed to research company');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleReviewed = async (category, currentStatus) => {
    try {
      const res = await apiClient.post(`/company/review/${applicationId}`, {
        category,
        reviewed: !currentStatus
      });
      setResearch(prev => ({ ...prev, sectionsReviewed: res.data }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmitQuiz = async () => {
    const answersArray = research.quiz.map((_, idx) => quizAnswers[idx] ?? -1);
    try {
      const res = await apiClient.post(`/company/quiz/${applicationId}`, { answers: answersArray });
      setQuizResult(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Grounded Company Research & Quiz</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Facts verified by retrieved sources or labeled inferred/predicted. Quiz questions built ONLY from verified facts.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Researching...' : 'Conduct Grounded Research'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {research && (
          <div className="space-y-6">
            {/* Fact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {research.items?.map((item, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs uppercase font-semibold text-[var(--text-muted)]">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                      item.label === 'verified'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{item.information}</p>
                  {item.sourceUrl && (
                    <div className="pt-2 border-t border-[var(--border-subtle)]">
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline"
                      >
                        <span>Verified Source</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sections Reviewed Toggles */}
            <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
              <h3 className="font-semibold text-base">Section Review Checklist</h3>
              <div className="flex flex-wrap gap-3">
                {research.sectionsReviewed?.map((sec, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleReviewed(sec.category, sec.reviewed)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      sec.reviewed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-slate-400'
                    }`}
                  >
                    <CheckCircle size={14} className={sec.reviewed ? "text-emerald-500" : "text-slate-400"} />
                    <span className="capitalize">{sec.category.replace('_', ' ')}: {sec.reviewed ? 'Reviewed' : 'Mark Reviewed'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grounded Company Quiz */}
            {research.quiz?.length > 0 && (
              <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
                <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="font-semibold text-base">Verified Company Quiz</h3>
                    <p className="text-xs text-[var(--text-muted)]">Quiz questions strictly sourced from verified official records</p>
                  </div>
                  {quizResult && (
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                      Score: {quizResult.quizScore}%
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {research.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-2">
                      <div className="text-sm font-semibold">{qIdx + 1}. {q.question}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer ${
                              quizAnswers[qIdx] === oIdx
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
                                : 'border-[var(--border-subtle)] bg-[var(--bg-primary)]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`quiz_${qIdx}`}
                              checked={quizAnswers[qIdx] === oIdx}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSubmitQuiz}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
                  >
                    Submit Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
