import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  Cpu,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Timer,
  ChevronRight,
  TrendingUp,
  Award,
  RotateCcw
} from 'lucide-react';

export default function PracticePage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isExhausted, setIsExhausted] = useState(false);
  const [activeTab, setActiveTab] = useState('quiz'); // 'quiz' | 'performance'

  useEffect(() => {
    fetchPracticeData();
  }, [applicationId]);

  const fetchPracticeData = async () => {
    try {
      const [appRes, qRes, perfRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/practice/${applicationId}`).catch(() => ({ data: [] })),
        apiClient.get(`/practice/performance/${applicationId}`).catch(() => ({ data: [] }))
      ]);
      setApp(appRes.data);
      const fetchedQuestions = qRes.data || [];
      setQuestions(fetchedQuestions);
      setIsExhausted(!!qRes.exhausted && fetchedQuestions.length === 0);
      setPerformance(perfRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load practice questions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (reset = false) => {
    setGenerating(true);
    setError('');
    try {
      const endpoint = reset
        ? `/practice/generate/${applicationId}?reset=true`
        : `/practice/generate/${applicationId}`;
      const res = await apiClient.post(endpoint);
      const generated = res.data || [];
      setQuestions(generated);
      setCurrentIndex(0);
      setSubmissionResult(null);
      setSelectedAnswer('');
      setIsExhausted(!!res.exhausted && generated.length === 0);
    } catch (err) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return;
    setSubmitting(true);
    setError('');

    const currentQ = questions[currentIndex];
    try {
      const res = await apiClient.post(`/practice/submit/${applicationId}/${currentQ._id}`, {
        answer: selectedAnswer,
        timeTakenSeconds: 30
      });
      setSubmissionResult(res.data);
      // Refresh performance stats in background
      apiClient.get(`/practice/performance/${applicationId}`).then(p => setPerformance(p.data || []));
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setSubmissionResult(null);
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Practice & Auto-Graded Coding</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Auto-graded debugging, output prediction, and code reading. Evaluates adaptive difficulty across 5-attempt windows.
            </p>
          </div>
          <button
            onClick={() => handleGenerate(false)}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Selecting Questions...' : 'Generate 10-Question Test'}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'quiz' ? 'bg-indigo-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Active Test Session ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'performance' ? 'bg-indigo-600 text-white' : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Adaptive Topic Performance ({performance.length})
          </button>
        </div>

        {/* Tab 1: Active Test Session */}
        {activeTab === 'quiz' && (
          <div>
            {questions.length === 0 && !loading && (
              <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-lg mx-auto shadow-sm space-y-4">
                {isExhausted ? (
                  <>
                    <Award size={40} className="text-amber-500 mx-auto" />
                    <h3 className="font-extrabold text-lg">Question Bank Completed!</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      You have completed all available practice and coding questions for this application. To practice again from the beginning, you can reset your attempt history.
                    </p>
                    <button
                      onClick={() => handleGenerate(true)}
                      disabled={generating}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      <RotateCcw size={14} />
                      <span>Reset History & Practice Again</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Cpu size={36} className="text-indigo-600 mx-auto" />
                    <h3 className="font-bold text-base">No Active Practice Questions</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Generate a targeted 10-question practice test matching the technical requirements of this job. Previously served questions will not be repeated.
                    </p>
                    <button
                      onClick={() => handleGenerate(false)}
                      disabled={generating}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                    >
                      Generate 10-Question Test
                    </button>
                  </>
                )}
              </div>
            )}

            {currentQ && (
              <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
                <div className="flex justify-between items-center pb-3.5 border-b border-[var(--border-subtle)]">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Question {currentIndex + 1} of {questions.length} • {currentQ.type.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 capitalize">
                      {currentQ.difficulty}
                    </span>
                    <span className="text-[var(--text-muted)]">{currentQ.skill}</span>
                  </div>
                </div>

                <div className="text-sm sm:text-base font-semibold leading-relaxed">
                  {currentQ.question}
                </div>

                {currentQ.codeSnippet && (
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                    {currentQ.codeSnippet}
                  </pre>
                )}

                {/* Options */}
                <div className="space-y-2.5 pt-2">
                  {currentQ.options?.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer text-xs sm:text-sm transition-all ${
                        selectedAnswer === opt
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 font-medium'
                          : 'border-[var(--border-subtle)] hover:border-slate-400 bg-[var(--bg-primary)]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="practiceOption"
                        value={opt}
                        disabled={!!submissionResult}
                        checked={selectedAnswer === opt}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        className="mt-1"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>

                {/* Submit / Next Button */}
                {!submissionResult ? (
                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedAnswer || submitting}
                      className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? 'Auto-Grading On Server...' : 'Submit & Check Answer'}
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        submissionResult.isCorrect
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                          : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/40 text-rose-800 dark:text-rose-200'
                      }`}
                    >
                      {submissionResult.isCorrect ? (
                        <CheckCircle size={20} className="shrink-0 text-emerald-600 mt-0.5" />
                      ) : (
                        <XCircle size={20} className="shrink-0 text-rose-600 mt-0.5" />
                      )}
                      <div className="text-xs space-y-1">
                        <div className="font-extrabold text-sm">
                          {submissionResult.isCorrect ? 'Correct!' : 'Incorrect'}
                        </div>
                        <div>
                          <span className="font-bold">Correct Option: </span>
                          {submissionResult.correctAnswer}
                        </div>
                        <div className="mt-1">
                          <span className="font-bold">Explanation: </span>
                          {submissionResult.explanation}
                        </div>
                        {submissionResult.adaptiveEvaluation && (
                          <div className="pt-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                            Adaptive Engine: {submissionResult.adaptiveEvaluation.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-[var(--text-muted)] font-semibold">
                        {currentIndex < questions.length - 1 ? (
                          `Question ${currentIndex + 1} completed`
                        ) : (
                          'Practice session complete! Check your updated Interview Readiness score.'
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {currentIndex < questions.length - 1 ? (
                          <button
                            onClick={handleNext}
                            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all"
                          >
                            Next Question →
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerate(false)}
                            disabled={generating}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-all"
                          >
                            <RefreshCw size={14} className={generating ? "animate-spin" : ""} />
                            <span>Start Next Practice Test</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Adaptive Topic Performance */}
        {activeTab === 'performance' && (
          <div className="space-y-4">
            {performance.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
                No attempt history recorded yet. Complete practice questions to track topic accuracy.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {performance.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2 shadow-sm">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-sm">{item.topic}</h4>
                      <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{item.accuracy}% Accuracy</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${item.accuracy}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-[var(--text-muted)] pt-1">
                      <span>{item.totalAttempts} attempts logged</span>
                      <span className="capitalize font-semibold">Level: {item.difficulty}</span>
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
