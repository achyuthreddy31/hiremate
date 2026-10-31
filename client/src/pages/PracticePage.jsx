import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  Cpu,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Award,
  RotateCcw,
  Code,
  BookOpen,
  Search,
  Check,
  Play,
  ArrowRight,
  Eye,
  Key
} from 'lucide-react';

const CATEGORIES_DATA = {
  'Programming Languages': [
    'Python',
    'Java',
    'C',
    'C++',
    'JavaScript',
    'TypeScript'
  ],
  'Web Development': [
    'HTML',
    'CSS',
    'JavaScript',
    'React',
    'Node.js',
    'Express.js',
    'FastAPI'
  ],
  'Databases': [
    'SQL',
    'MongoDB',
    'PostgreSQL',
    'MySQL'
  ],
  'Core CS & DSA': [
    'Data Structures & Algorithms',
    'Object-Oriented Programming',
    'DBMS',
    'Operating Systems',
    'Computer Networks'
  ],
  'AI & Data Science': [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Pandas',
    'NumPy'
  ]
};

const DIFFICULTY_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];
const COUNT_OPTIONS = [5, 10, 15, 20];
const MODE_OPTIONS = [
  { label: 'MCQs', value: 'mcq' },
  { label: 'Coding challenges', value: 'coding_challenges' }
];

export default function PracticePage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [app, setApp] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [codeAnswer, setCodeAnswer] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [roadmap, setRoadmap] = useState(null);
  const [roadmapTasks, setRoadmapTasks] = useState([]);
  const [activeRoadmapTask, setActiveRoadmapTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [revealedSolution, setRevealedSolution] = useState(null);
  const [error, setError] = useState('');
  const [isExhausted, setIsExhausted] = useState(false);
  const [activeTab, setActiveTab] = useState('practice'); // 'practice' | 'performance'

  // Dynamic Selection State - Defaults to Roadmap Topics if available
  const [selectedCategory, setSelectedCategory] = useState('Programming Languages');
  const [selectedSkill, setSelectedSkill] = useState('JavaScript');
  const [skillSearch, setSkillSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Intermediate');
  const [selectedCount, setSelectedCount] = useState(10);
  const [selectedMode, setSelectedMode] = useState('mcq');

  // Session Results Tracking
  const [sessionHistory, setSessionHistory] = useState([]);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  useEffect(() => {
    fetchPracticeData();
  }, [applicationId]);

  // Synchronize available skills when category changes
  const handleCategoryChange = (newCat) => {
    setSelectedCategory(newCat);
    const available = newCat === 'Roadmap Topics'
      ? roadmapTasks.map(t => t.topic)
      : (CATEGORIES_DATA[newCat] || []);
    const newSkill = available[0] || '';
    setSelectedSkill(newSkill);
    setSkillSearch('');
    setRevealedSolution(null);
    setSubmissionResult(null);
    setSelectedAnswer('');
    setCurrentIndex(0);
    handleStartSession(false, { category: newCat, skill: newSkill });
  };

  const handleSkillChange = (newSkill) => {
    setSelectedSkill(newSkill);
    setRevealedSolution(null);
    setSubmissionResult(null);
    setSelectedAnswer('');
    setCurrentIndex(0);
    handleStartSession(false, { skill: newSkill });
  };

  const handleDifficultyChange = (newDiff) => {
    setSelectedDifficulty(newDiff);
    setRevealedSolution(null);
    setSubmissionResult(null);
    setSelectedAnswer('');
    setCurrentIndex(0);
    handleStartSession(false, { difficulty: newDiff });
  };

  const handleCountChange = (newCount) => {
    const parsed = Number(newCount);
    setSelectedCount(parsed);
    setRevealedSolution(null);
    setSubmissionResult(null);
    setSelectedAnswer('');
    setCurrentIndex(0);
    handleStartSession(false, { count: parsed });
  };

  const handleModeChange = (newMode) => {
    setSelectedMode(newMode);
    setRevealedSolution(null);
    setSubmissionResult(null);
    setSelectedAnswer('');
    setCurrentIndex(0);
    handleStartSession(false, { mode: newMode });
  };

  const fetchPracticeData = async () => {
    try {
      const [appRes, perfRes, roadRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/practice/performance/${applicationId}`).catch(() => ({ data: [] })),
        apiClient.get(`/roadmap/${applicationId}`).catch(() => ({ data: null }))
      ]);
      setApp(appRes.data);
      setPerformance(perfRes.data || []);

      let catToUse = selectedCategory;
      let skillToUse = selectedSkill;
      let diffToUse = selectedDifficulty;

      const loadedRoadmap = roadRes?.data;
      if (loadedRoadmap && Array.isArray(loadedRoadmap.tasks) && loadedRoadmap.tasks.length > 0) {
        setRoadmap(loadedRoadmap);
        const tasks = loadedRoadmap.tasks;
        setRoadmapTasks(tasks);

        // Find the first uncompleted task, or the first task if all complete
        const activeTask = tasks.find(t => t.status !== 'completed') || tasks[0];
        setActiveRoadmapTask(activeTask);

        // Default the practice experience to the active Roadmap Topic!
        catToUse = 'Roadmap Topics';
        skillToUse = activeTask.topic;
        diffToUse = activeTask.difficulty === 'hard'
          ? 'Advanced'
          : (activeTask.difficulty === 'easy' ? 'Beginner' : 'Intermediate');

        setSelectedCategory(catToUse);
        setSelectedSkill(skillToUse);
        setSelectedDifficulty(diffToUse);
      }

      // Load session synchronized with initial filter selections
      await handleStartSession(false, {
        category: catToUse,
        skill: skillToUse,
        difficulty: diffToUse,
        count: selectedCount,
        mode: selectedMode
      });
    } catch (err) {
      setError(err.message || 'Failed to load practice questions');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (reset = false, customParams = {}) => {
    setGenerating(true);
    setError('');
    setIsSessionComplete(false);
    setSessionHistory([]);
    setRevealedSolution(null);
    setSubmissionResult(null);
    setSelectedAnswer('');
    setCurrentIndex(0);

    const cat = customParams.category !== undefined ? customParams.category : selectedCategory;
    const sk = customParams.skill !== undefined ? customParams.skill : selectedSkill;
    const diff = customParams.difficulty !== undefined ? customParams.difficulty : selectedDifficulty;
    const cnt = customParams.count !== undefined ? customParams.count : selectedCount;
    const md = customParams.mode !== undefined ? customParams.mode : selectedMode;

    try {
      const payload = {
        category: cat,
        skill: sk,
        difficulty: diff,
        count: cnt,
        mode: md,
        reset
      };

      const endpoint = reset
        ? `/practice/generate/${applicationId}?reset=true`
        : `/practice/generate/${applicationId}`;

      const res = await apiClient.post(endpoint, payload);
      const generated = res.data || [];
      setQuestions(generated);
      setCurrentIndex(0);
      setSubmissionResult(null);
      setSelectedAnswer('');
      setIsExhausted(!!res.exhausted && generated.length === 0);

      if (generated.length > 0) {
        setCodeAnswer(generated[0].starterCode || '');
      } else {
        setCodeAnswer('');
      }
    } catch (err) {
      setError(err.message || 'Failed to generate practice session');
    } finally {
      setGenerating(false);
    }
  };

  const currentQ = questions[currentIndex];

  const handleRevealSolution = async () => {
    if (!currentQ?._id || revealing) return;
    setRevealing(true);
    setError('');
    try {
      const res = await apiClient.post(`/practice/reveal-solution/${applicationId}/${currentQ._id}`);
      if (res.data) {
        setRevealedSolution(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to reveal reference solution');
    } finally {
      setRevealing(false);
    }
  };

  const handleSubmitAnswer = async () => {
    const answerToSubmit = currentQ?.mode === 'coding_challenges' || currentQ?.type === 'code_writing'
      ? codeAnswer
      : selectedAnswer;

    if (!answerToSubmit || String(answerToSubmit).trim() === '') return;

    setSubmitting(true);
    setError('');

    try {
      const res = await apiClient.post(`/practice/submit/${applicationId}/${currentQ._id}`, {
        answer: answerToSubmit,
        timeTakenSeconds: 30
      });

      const resultData = res.data;
      setSubmissionResult(resultData);

      // Record in session history
      const newHistory = [
        ...sessionHistory,
        {
          questionId: currentQ._id,
          isCorrect: resultData.isCorrect,
          userAnswer: answerToSubmit,
          correctAnswer: resultData.correctAnswer
        }
      ];
      setSessionHistory(newHistory);

      // Refresh adaptive performance stats in background
      apiClient.get(`/practice/performance/${applicationId}`).then(p => setPerformance(p.data || []));
    } catch (err) {
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setSelectedAnswer('');
      setSubmissionResult(null);
      setRevealedSolution(null);
      setCodeAnswer(questions[nextIdx]?.starterCode || '');
    } else {
      // Completed all questions in the session
      setIsSessionComplete(true);
    }
  };

  const availableSkills = selectedCategory === 'Roadmap Topics'
    ? roadmapTasks.map(t => t.topic)
    : (CATEGORIES_DATA[selectedCategory] || []);
  const filteredSkills = availableSkills.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase())
  );

  // Accurate session statistics calculation
  const totalSessionAnswered = sessionHistory.length;
  const correctCount = sessionHistory.filter(h => h.isCorrect).length;
  const incorrectCount = totalSessionAnswered - correctCount;
  const accuracyPercentage = totalSessionAnswered > 0
    ? Math.round((correctCount / totalSessionAnswered) * 100)
    : 0;
  const finalScore = questions.length > 0
    ? Math.round((correctCount / questions.length) * 100)
    : 0;

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Practice & Coding</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Dynamic technical quizzes and auto-graded coding challenges across core software engineering domains.
            </p>
          </div>
          <button
            onClick={() => handleStartSession(false)}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Configuring Session...' : 'Start Practice Session'}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Dynamic Selection Controls Panel */}
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
          <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Session Configuration & Parameters
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* 1. Category Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-600 transition-colors"
              >
                {roadmapTasks.length > 0 && (
                  <option value="Roadmap Topics">Roadmap Topics ({roadmapTasks.length})</option>
                )}
                {Object.keys(CATEGORIES_DATA).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* 2. Skill Dropdown (Synchronized with Category) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">
                {selectedCategory === 'Roadmap Topics' ? 'Roadmap Topic' : `Skill (${filteredSkills.length})`}
              </label>
              <select
                value={selectedSkill}
                onChange={(e) => handleSkillChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-600 transition-colors"
              >
                {selectedCategory === 'Roadmap Topics' ? (
                  roadmapTasks.map((t) => (
                    <option key={t._id || t.day} value={t.topic}>
                      Day {t.day}: {t.topic} {t.status === 'completed' ? '✓ (Done)' : ''}
                    </option>
                  ))
                ) : (
                  filteredSkills.map(sk => (
                    <option key={sk} value={sk}>{sk}</option>
                  ))
                )}
              </select>
            </div>

            {/* 3. Difficulty */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => handleDifficultyChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-600 transition-colors"
              >
                {DIFFICULTY_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* 4. Number of Questions */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Questions</label>
              <select
                value={selectedCount}
                onChange={(e) => handleCountChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-600 transition-colors"
              >
                {COUNT_OPTIONS.map(cnt => (
                  <option key={cnt} value={cnt}>{cnt} Questions</option>
                ))}
              </select>
            </div>

            {/* 5. Practice Mode */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Practice Mode</label>
              <select
                value={selectedMode}
                onChange={(e) => handleModeChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs font-semibold bg-[var(--bg-primary)] border border-[var(--border-subtle)] focus:outline-none focus:border-blue-600 transition-colors"
              >
                {MODE_OPTIONS.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            {questions.length > 0 && questions.length < selectedCount ? (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Note: Displaying all {questions.length} available unique questions for {selectedSkill} ({selectedDifficulty}).
              </span>
            ) : (
              <span className="text-xs text-[var(--text-muted)]">
                Selecting {selectedCount} questions will configure a fresh unserved set.
              </span>
            )}
            <button
              onClick={() => handleStartSession(false)}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              <Play size={14} className={generating ? "animate-spin" : ""} />
              <span>{generating ? 'Configuring Session...' : `Start ${selectedSkill} (${selectedCount} Qs)`}</span>
            </button>
          </div>
        </div>

        {/* Active Roadmap Integration Banner */}
        {selectedCategory === 'Roadmap Topics' && (
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-sm">
                Day {roadmapTasks.find(t => t.topic === selectedSkill)?.day || 1}
              </div>
              <div>
                <div className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <span>Roadmap-Aligned Practice: {selectedSkill}</span>
                  <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 font-extrabold border border-blue-200 dark:border-blue-700">
                    Target Job Priority
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Questions automatically targeted to your {app?.jobTitle || 'target job'} curriculum. Use category dropdowns to explore other domains.
                </p>
              </div>
            </div>
            <Link
              to={`/app/${applicationId}/roadmap`}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline shrink-0"
            >
              View Full Roadmap →
            </Link>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'practice'
                ? 'bg-blue-600 text-white'
                : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Active Session ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('performance')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'performance'
                ? 'bg-blue-600 text-white'
                : 'text-[var(--text-muted)] hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Topic Performance Stats ({performance.length})
          </button>
        </div>

        {/* Tab 1: Practice Session */}
        {activeTab === 'practice' && (
          <div>
            {/* Empty State */}
            {questions.length === 0 && !loading && (
              <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-lg mx-auto shadow-sm space-y-4">
                {isExhausted ? (
                  <>
                    <Award size={40} className="text-amber-500 mx-auto" />
                    <h3 className="font-extrabold text-lg">Question Bank Completed!</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      You have completed all available practice questions for {selectedSkill}. Switch to another skill or reset attempt history to practice again.
                    </p>
                    <button
                      onClick={() => handleStartSession(true)}
                      disabled={generating}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      <RotateCcw size={14} />
                      <span>Reset History & Practice Again</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Cpu size={36} className="text-blue-600 mx-auto" />
                    <h3 className="font-bold text-base">Ready for Targeted Practice?</h3>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                      Select your desired category, skill, difficulty, and question count above, then launch your practice session.
                    </p>
                    <button
                      onClick={() => handleStartSession(false)}
                      disabled={generating}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs"
                    >
                      Start {selectedSkill} Session
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Session Complete Card (Shown ONLY when all questions are completed) */}
            {isSessionComplete && (
              <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-6 text-center max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle size={36} />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold tracking-tight">Session Completed!</h2>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    You have finished all questions in this {selectedSkill} practice session.
                  </p>
                </div>

                {/* Final Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                  <div className="p-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Total</span>
                    <div className="text-xl font-extrabold text-[var(--text-primary)] mt-0.5">{questions.length}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase">Correct</span>
                    <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-0.5">{correctCount}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500/30">
                    <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 uppercase">Incorrect</span>
                    <div className="text-xl font-extrabold text-rose-700 dark:text-rose-300 mt-0.5">{incorrectCount}</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-500/30">
                    <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase">Accuracy</span>
                    <div className="text-xl font-extrabold text-blue-700 dark:text-blue-300 mt-0.5">{accuracyPercentage}%</div>
                  </div>
                </div>

                {/* Navigation and Call to Action */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => handleStartSession(false)}
                    disabled={generating}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
                    <span>Practice Again</span>
                  </button>

                  <Link
                    to={`/app/${applicationId}/checklist`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[var(--text-primary)] font-bold text-xs sm:text-sm transition-all"
                  >
                    <span>View Updated Readiness Score</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Active Question View */}
            {!isSessionComplete && currentQ && (
              <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
                {/* Question Header & Breadcrumbs */}
                <div className="flex justify-between items-center pb-3.5 border-b border-[var(--border-subtle)]">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Question {currentIndex + 1} of {questions.length} • {currentQ.mode === 'coding_challenges' ? 'Coding Challenge' : (currentQ.type || 'MCQ').replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 capitalize">
                      {currentQ.difficulty}
                    </span>
                    <span className="text-[var(--text-muted)]">{currentQ.skill}</span>
                  </div>
                </div>

                {/* MODE: CODING CHALLENGE */}
                {currentQ.mode === 'coding_challenges' || currentQ.type === 'code_writing' ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm sm:text-base font-extrabold leading-relaxed text-[var(--text-primary)]">
                        {currentQ.problemStatement || currentQ.question}
                      </h3>
                    </div>

                    {currentQ.inputDescription && (
                      <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs space-y-1">
                        <span className="font-bold text-[var(--text-muted)]">Input: </span>
                        <span>{currentQ.inputDescription}</span>
                      </div>
                    )}

                    {currentQ.outputDescription && (
                      <div className="p-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] text-xs space-y-1">
                        <span className="font-bold text-[var(--text-muted)]">Output: </span>
                        <span>{currentQ.outputDescription}</span>
                      </div>
                    )}

                    {/* Examples */}
                    {currentQ.examples && currentQ.examples.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase">Examples:</span>
                        {currentQ.examples.map((ex, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs space-y-1 border border-slate-800">
                            <div><span className="text-slate-400 font-sans">Input:</span> {ex.input}</div>
                            <div><span className="text-slate-400 font-sans">Output:</span> {ex.output}</div>
                            {ex.explanation && (
                              <div className="text-slate-400 text-[11px] font-sans pt-1">
                                <span className="font-semibold">Explanation:</span> {ex.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Constraints */}
                    {currentQ.constraints && currentQ.constraints.length > 0 && (
                      <div className="text-xs text-[var(--text-muted)] space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[10px]">Constraints:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          {currentQ.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Code Editor Area */}
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-[var(--text-muted)]">Your Code Solution:</span>
                        <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">{currentQ.skill}</span>
                      </div>
                      <textarea
                        rows={10}
                        value={codeAnswer}
                        disabled={!!submissionResult}
                        onChange={(e) => setCodeAnswer(e.target.value)}
                        placeholder="Write your code solution here..."
                        className="w-full p-4 rounded-xl font-mono text-xs bg-slate-950 text-slate-100 border border-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed disabled:opacity-80"
                      />
                    </div>

                    {/* Revealed Reference Solution Card (Does not overwrite editor code) */}
                    {revealedSolution && (
                      <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/40 text-slate-100 space-y-2.5 mt-3 shadow-md">
                        <div className="flex items-center justify-between text-xs font-bold text-blue-400 border-b border-slate-800 pb-2">
                          <span className="flex items-center gap-1.5">
                            <Key size={14} className="text-blue-400" />
                            Official Reference Solution ({currentQ.skill})
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">Reference Only (Your editor code is preserved)</span>
                        </div>
                        <pre className="p-3.5 rounded-lg bg-slate-950 font-mono text-xs overflow-x-auto text-emerald-400 leading-relaxed border border-slate-800">
                          {revealedSolution.solution}
                        </pre>
                        {revealedSolution.explanation && (
                          <div className="text-xs text-slate-300 leading-relaxed pt-1">
                            <span className="font-bold text-slate-200">Approach & Complexity: </span>
                            {revealedSolution.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  /* MODE: MCQ */
                  <div className="space-y-4">
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
                              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 font-medium'
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
                  </div>
                )}

                {/* Submit / Action Buttons */}
                {!submissionResult ? (
                  <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                    {(currentQ.mode === 'coding_challenges' || currentQ.type === 'code_writing') ? (
                      <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                        <Key size={13} className="text-slate-400 shrink-0" />
                        <span>Reference solution is locked until you submit your attempt.</span>
                      </div>
                    ) : (
                      <div />
                    )}

                    <button
                      onClick={handleSubmitAnswer}
                      disabled={
                        submitting ||
                        (currentQ.mode === 'coding_challenges' || currentQ.type === 'code_writing'
                          ? !codeAnswer.trim()
                          : !selectedAnswer)
                      }
                      className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                    >
                      {submitting ? 'Auto-Grading On Server...' : 'Submit & Check Answer'}
                    </button>
                  </div>
                ) : (
                  /* Post-Submission Feedback */
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
                      <div className="text-xs space-y-1.5 flex-1">
                        <div className="font-extrabold text-sm sm:text-base">
                          {submissionResult.isCorrect ? 'Well done! Keep going.' : 'Incorrect'}
                        </div>

                        {!submissionResult.isCorrect && submissionResult.correctAnswer && currentQ.mode !== 'coding_challenges' && currentQ.type !== 'code_writing' && (
                          <div className="pt-1">
                            <span className="font-bold">Correct Solution / Answer: </span>
                            <pre className="mt-1 p-2 rounded bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto">
                              {submissionResult.correctAnswer}
                            </pre>
                          </div>
                        )}

                        {submissionResult.explanation && (
                          <div className="mt-1">
                            <span className="font-bold">Explanation: </span>
                            {submissionResult.explanation}
                          </div>
                        )}

                        {/* Test Cases Execution Table for Coding Challenges */}
                        {submissionResult.testResults && (
                          <div className="mt-2 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <span className="font-bold text-[11px] uppercase tracking-wider">Test Cases Validation:</span>
                            <div className="space-y-1">
                              {submissionResult.testResults.map((tr, idx) => (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-lg text-[11px] flex items-center justify-between font-mono ${
                                    tr.passed
                                      ? 'bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-rose-100/60 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300'
                                  }`}
                                >
                                  <span>Test Case #{tr.testCaseIndex}</span>
                                  <span>{tr.passed ? 'PASSED' : 'FAILED'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {submissionResult.adaptiveEvaluation && (
                          <div className="pt-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                            Adaptive Engine: {submissionResult.adaptiveEvaluation.reason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Navigation between questions */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-xs text-[var(--text-muted)] font-semibold">
                        {currentIndex < questions.length - 1
                          ? `Question ${currentIndex + 1} completed`
                          : 'All questions in this session answered'}
                      </div>
                      <div className="flex items-center gap-3">
                        {(currentQ.mode === 'coding_challenges' || currentQ.type === 'code_writing') && !revealedSolution && (
                          <button
                            onClick={handleRevealSolution}
                            disabled={revealing}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors"
                          >
                            <Eye size={14} className={revealing ? "animate-spin" : ""} />
                            <span>{revealing ? 'Unlocking Solution...' : 'Show Reference Solution'}</span>
                          </button>
                        )}
                        <button
                          onClick={handleNextQuestion}
                          className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all"
                        >
                          {currentIndex < questions.length - 1 ? 'Next Question →' : 'View Session Summary'}
                        </button>
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
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{item.accuracy}% Accuracy</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${item.accuracy}%` }} />
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
