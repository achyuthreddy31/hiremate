import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  Building2,
  CheckCircle,
  ExternalLink,
  RefreshCw,
  Package,
  Cpu,
  Users,
  Handshake,
  Briefcase,
  TrendingUp,
  Globe,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

const HUB_SECTIONS = [
  { id: 'all', title: 'All Hub Areas', icon: Globe, description: 'Complete intelligence dossier across all 7 research categories' },
  { id: 'overview_milestones', title: 'Overview & Milestones', icon: Building2, description: 'Founding history, global scale, headquarters, and key company milestones' },
  { id: 'products_business_model', title: 'Products & Business Model', icon: Package, description: 'Core product offerings, monetization structure, and customer segments' },
  { id: 'tech_innovation', title: 'Technology & Innovation', icon: Cpu, description: 'Engineering tech stack, distributed cloud systems, and development practices' },
  { id: 'founders_leadership', title: 'Founders & Leadership', icon: Users, description: 'Executive leadership team, strategic vision, and engineering stewardship' },
  { id: 'culture_values', title: 'Culture & Values', icon: Handshake, description: 'Workplace principles, engineering autonomy, flexibility, and team growth' },
  { id: 'careers_recruitment', title: 'Careers & Recruitment', icon: Briefcase, description: 'Hiring stages, candidate evaluation standards, and interview expectations' },
  { id: 'financial_market', title: 'Financial & Market Position', icon: TrendingUp, description: 'Market competitors, competitive differentiators, and growth trajectory' }
];

export const normalizeCategory = (cat) => {
  if (!cat) return 'overview_milestones';
  const c = String(cat).toLowerCase().trim();
  if (c === 'overview' || c.startsWith('overview')) return 'overview_milestones';
  if (c === 'products' || c === 'products_news' || c.startsWith('product')) return 'products_business_model';
  if (c === 'tech_stack' || c.startsWith('tech')) return 'tech_innovation';
  if (c === 'leadership' || c.startsWith('founder') || c.startsWith('leader')) return 'founders_leadership';
  if (c === 'culture' || c.startsWith('culture')) return 'culture_values';
  if (c === 'interview_process' || c.startsWith('career') || c.startsWith('interview')) return 'careers_recruitment';
  if (c === 'financial' || c.startsWith('financial') || c === 'recent_developments') return 'financial_market';
  return c;
};

export default function CompanyResearchPage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [research, setResearch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeSection, setActiveSection] = useState('all');
  const [error, setError] = useState('');

  // Reset and fetch immediately when applicationId changes to prevent stale data
  useEffect(() => {
    setResearch(null);
    setLoading(true);
    setError('');
    setActiveSection('all');
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
    const canonicalCategory = normalizeCategory(category);
    try {
      const res = await apiClient.post(`/company/review/${applicationId}`, {
        category: canonicalCategory,
        reviewed: !currentStatus
      });
      setResearch(prev => ({ ...prev, sectionsReviewed: res.data }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Robust deduplication and normalization of items
  const normalizedItems = [];
  const seenTexts = new Set();

  for (const item of research?.items || []) {
    const rawText = item.information || '';
    const textKey = rawText.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    if (!textKey || seenTexts.has(textKey)) continue;
    seenTexts.add(textKey);

    normalizedItems.push({
      ...item,
      category: normalizeCategory(item.category)
    });
  }

  // Canonical list of the 7 sections
  const canonicalSections = HUB_SECTIONS.filter(s => s.id !== 'all');
  const sectionsList = research?.sectionsReviewed || [];

  const isSectionReviewed = (secId) => {
    const record = sectionsList.find(s => normalizeCategory(s.category) === secId);
    return !!record?.reviewed;
  };

  const reviewedCount = canonicalSections.filter(s => isSectionReviewed(s.id)).length;
  const totalSections = canonicalSections.length;
  const reviewProgressPct = Math.round((reviewedCount / totalSections) * 100);

  // Group items by category for clear presentation
  const itemsByCategory = {};
  for (const sec of canonicalSections) {
    itemsByCategory[sec.id] = [];
  }
  for (const item of normalizedItems) {
    if (itemsByCategory[item.category]) {
      itemsByCategory[item.category].push(item);
    } else {
      // Fallback into overview if unknown
      itemsByCategory['overview_milestones'].push(item);
    }
  }

  const sectionsToRender = activeSection === 'all'
    ? canonicalSections
    : canonicalSections.filter(s => s.id === activeSection);

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Company Research Hub</h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Grounded company intelligence and strategic breakdown for <span className="font-bold text-[var(--text-primary)]">{app?.companyName || 'your target company'}</span>.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50 shrink-0"
          >
            <RefreshCw size={15} className={generating ? "animate-spin" : ""} />
            <span>{generating ? 'Conducting Grounded Research...' : 'Refresh Research Hub'}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!research && !loading && (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] max-w-lg mx-auto shadow-sm space-y-4">
            <Building2 size={40} className="text-indigo-600 mx-auto" />
            <h3 className="font-extrabold text-lg">No Company Intelligence Loaded</h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Generate a comprehensive company research dossier covering overview, products, tech stack, leadership, culture, careers, and financial position.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow hover:shadow-indigo-500/20"
            >
              Build Research Hub for {app?.companyName || 'Company'}
            </button>
          </div>
        )}

        {research && (
          <div className="space-y-6">
            {/* Overall Research Review Progress Bar & Category Quick Toggles */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="font-extrabold text-base">Company Knowledge Readiness Progress</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Review each of the 7 strategic hub areas below to maximize your Interview Readiness score.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    {reviewedCount} of {totalSections} Sections Reviewed ({reviewProgressPct}%)
                  </span>
                  <Link
                    to={`/app/${applicationId}/checklist`}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    <span>Readiness Score</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${reviewProgressPct}%` }}
                />
              </div>

              {/* 7 Section Quick Toggles */}
              <div className="flex flex-wrap gap-2 pt-1">
                {canonicalSections.map(sec => {
                  const reviewed = isSectionReviewed(sec.id);
                  const Icon = sec.icon;

                  return (
                    <button
                      key={sec.id}
                      onClick={() => handleToggleReviewed(sec.id, reviewed)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        reviewed
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/80 text-emerald-700 dark:text-emerald-300'
                          : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-slate-400 hover:text-[var(--text-primary)]'
                      }`}
                      title={reviewed ? 'Marked as Reviewed' : 'Click to Mark Reviewed'}
                    >
                      <CheckCircle size={13} className={reviewed ? "text-emerald-500" : "text-slate-400"} />
                      <span>{sec.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hub Area Navigation Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[var(--border-subtle)]">
              {HUB_SECTIONS.map(sec => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                const count = sec.id === 'all'
                  ? normalizedItems.length
                  : (itemsByCategory[sec.id] || []).length;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveSection(sec.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:border-slate-400 hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Icon size={14} />
                    <span>{sec.title}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Grouped Category Sections */}
            <div className="space-y-6">
              {sectionsToRender.map(sec => {
                const Icon = sec.icon;
                const items = itemsByCategory[sec.id] || [];
                const reviewed = isSectionReviewed(sec.id);

                return (
                  <div
                    key={sec.id}
                    className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-sm"
                  >
                    {/* Section Header with Icon, Description, and Review Action */}
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-[var(--border-subtle)]">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900">
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                              {sec.title}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)]">
                              {items.length} {items.length === 1 ? 'Fact' : 'Facts'}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            {sec.description}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleReviewed(sec.id, reviewed)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all shrink-0 ${
                          reviewed
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                            : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-slate-400 hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <CheckCircle size={14} className={reviewed ? "text-emerald-500" : "text-slate-400"} />
                        <span>{reviewed ? 'Section Reviewed' : 'Mark as Reviewed'}</span>
                      </button>
                    </div>

                    {/* Section Content Cards */}
                    {items.length === 0 ? (
                      <div className="p-4 rounded-xl bg-[var(--bg-primary)] border border-dashed border-[var(--border-subtle)] text-xs text-[var(--text-muted)] text-center py-6">
                        Information not yet verified for this category. Click "Refresh Research Hub" to query fresh intelligence.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-4 sm:p-5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] space-y-3 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors flex flex-col justify-between"
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                                    item.label === 'verified'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[var(--border-subtle)]'
                                  }`}
                                >
                                  {item.label}
                                </span>
                                <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                  Confidence: {Math.round((item.confidence || 0.8) * 100)}%
                                </span>
                              </div>

                              <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-primary)] font-medium">
                                {item.information}
                              </p>
                            </div>

                            {item.sourceUrl && (
                              <div className="pt-2.5 border-t border-[var(--border-subtle)]">
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                >
                                  <span>Official Information Citation</span>
                                  <ExternalLink size={12} />
                                </a>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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
