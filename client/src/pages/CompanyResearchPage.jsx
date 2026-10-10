import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  BookOpen,
  CheckCircle,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Award,
  AlertCircle,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function CompanyResearchPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
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
      setError(err.message || 'Failed to load company research');
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
    if (!research?.quiz) return;
    setSubmittingQuiz(true);
    const answersArray = research.quiz.map((_, idx) => quizAnswers[idx] ?? -1);
    try {
      const res = await apiClient.post(`/company/quiz/${applicationId}`, { answers: answersArray });
      setQuizResult(res.data);
    } catch (err) {
      setError(err.message || 'Quiz submission failed');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Grounded Company Research & Quiz</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Factual claims verified with Google Search grounding citations or explicitly labeled inferred/predicted.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Conducting Grounded Research...' : 'Conduct Grounded Research'}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {!research && !loading && (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-lg mx-auto shadow-sm">
            <BookOpen size={32} className="text-indigo-600 mx-auto mb-3" />
            <h3 className="font-bold text-base">No Company Research Yet</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-5 leading-relaxed">
              Retrieve verified company information, engineering values, and interview preparation facts.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
            >
              Start Grounded Company Research
            </button>
          </div>
        )}

        {research && (
          <div className="space-y-6">
            {/* Fact Cards */}
            <div className="space-y-3">
              <h3 className="font-extrabold text-base">Verified & Inferred Company Facts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {research.items?.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                          {item.category.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold capitalize border ${
                            item.label === 'verified'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[var(--border-subtle)]'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed">{item.information}</p>
                    </div>

                    {item.sourceUrl && (
                      <div className="pt-3 border-t border-[var(--border-subtle)]">
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline"
                        >
                          <span>Verified Source Citation</span>
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sections Reviewed Toggles */}
            <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3 shadow-sm">
              <div>
                <h3 className="font-extrabold text-base">Section Review Checklist</h3>
                <p className="text-xs text-[var(--text-muted)]">Mark sections as reviewed to track your Company Knowledge readiness area</p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                {research.sectionsReviewed?.map((sec, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleToggleReviewed(sec.category, sec.reviewed)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                      sec.reviewed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                        : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-slate-400'
                    }`}
                  >
                    <CheckCircle size={14} className={sec.reviewed ? "text-emerald-500" : "text-slate-400"} />
                    <span className="capitalize">{sec.category.replace(/_/g, ' ')}: {sec.reviewed ? 'Reviewed' : 'Mark Reviewed'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Grounded Company Quiz */}
            {research.quiz?.length > 0 && (
              <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3.5 border-b border-[var(--border-subtle)]">
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg">Verified Company Knowledge Quiz</h3>
                    <p className="text-xs text-[var(--text-muted)]">Quiz questions strictly sourced from verified official records</p>
                  </div>
                  {quizResult && (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Latest Score: {quizResult.quizScore}% ({quizResult.correctCount}/{quizResult.totalQuestions})
                    </span>
                  )}
                </div>

                <div className="space-y-5">
                  {research.quiz.map((q, qIdx) => (
                    <div key={qIdx} className="space-y-2.5 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
                      <div className="text-xs sm:text-sm font-bold">{qIdx + 1}. {q.question}</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, oIdx) => (
                          <label
                            key={oIdx}
                            className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              quizAnswers[qIdx] === oIdx
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 font-medium'
                                : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`quiz_${qIdx}`}
                              checked={quizAnswers[qIdx] === oIdx}
                              onChange={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                              className="mt-0.5"
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
                    disabled={submittingQuiz}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                  >
                    {submittingQuiz ? 'Submitting...' : 'Submit Company Quiz'}
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
