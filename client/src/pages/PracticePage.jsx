import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { Cpu, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';

export default function PracticePage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPracticeData();
  }, [applicationId]);

  const fetchPracticeData = async () => {
    try {
      const [appRes, qRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/practice/${applicationId}`).catch(() => ({ data: [] }))
      ]);
      setApp(appRes.data);
      setQuestions(qRes.data || []);
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
      const res = await apiClient.post(`/practice/generate/${applicationId}`);
      setQuestions(res.data);
      setCurrentIndex(0);
      setSubmissionResult(null);
      setSelectedAnswer('');
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
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Practice & Auto-Graded Coding</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Auto-graded debugging, output prediction, and technical questions. Answers revealed only upon server submission.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Generating...' : 'Generate 10-Question Test'}</span>
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {questions.length === 0 && !loading && (
          <div className="p-8 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
            <Cpu size={32} className="text-indigo-600 mx-auto mb-3" />
            <h3 className="font-semibold text-base">No Practice Test Active</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">Click "Generate 10-Question Test" to load curated questions targeted to this job's requirements.</p>
          </div>
        )}

        {currentQ && (
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Question {currentIndex + 1} of {questions.length} ({currentQ.type.replace('_', ' ')})
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium capitalize">
                {currentQ.difficulty}
              </span>
            </div>

            <div className="text-base font-medium leading-relaxed">
              {currentQ.question}
            </div>

            {currentQ.codeSnippet && (
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                {currentQ.codeSnippet}
              </pre>
            )}

            {/* Options */}
            <div className="space-y-2.5 pt-2">
              {currentQ.options?.map((opt, idx) => (
                <label
                  key={idx}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer text-sm transition-all ${
                    selectedAnswer === opt
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
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

            {/* Submission Actions */}
            {!submissionResult ? (
              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedAnswer || submitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Evaluating...' : 'Submit & Check Answer'}
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-[var(--border-subtle)] space-y-4">
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  submissionResult.isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/40 text-rose-800 dark:text-rose-200'
                }`}>
                  {submissionResult.isCorrect ? <CheckCircle size={20} className="shrink-0 text-emerald-600" /> : <XCircle size={20} className="shrink-0 text-rose-600" />}
                  <div className="text-xs space-y-1">
                    <div className="font-bold text-sm">
                      {submissionResult.isCorrect ? 'Correct Answer!' : 'Incorrect'}
                    </div>
                    <div><span className="font-semibold">Correct: </span>{submissionResult.correctAnswer}</div>
                    <div className="mt-1"><span className="font-semibold">Explanation: </span>{submissionResult.explanation}</div>
                  </div>
                </div>

                <div className="flex justify-end">
                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNext}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors"
                    >
                      Next Question →
                    </button>
                  ) : (
                    <div className="text-xs text-[var(--text-muted)] font-medium">Practice test complete! Head to Readiness to see updated scores.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
