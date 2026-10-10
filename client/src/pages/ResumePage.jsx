import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import {
  Upload,
  CheckCircle,
  AlertTriangle,
  FileText,
  Check,
  ShieldCheck,
  XCircle,
  RefreshCw,
  ArrowRight,
  Info
} from 'lucide-react';

export default function ResumePage() {
  const { applicationId } = useParams();
  const [app, setApp] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApplicationAndResume();
  }, [applicationId]);

  const fetchApplicationAndResume = async () => {
    try {
      const [appRes, resumeRes] = await Promise.all([
        apiClient.get(`/applications/${applicationId}`),
        apiClient.get(`/resumes/${applicationId}`).catch(() => ({ data: null }))
      ]);
      setApp(appRes.data);
      setResumeData(resumeRes.data);
    } catch (err) {
      setError(err.message || 'Failed to load resume details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF resumes (.pdf) are permitted.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB limit.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('applicationId', applicationId);

    try {
      const res = await apiClient.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('PDF resume uploaded and analyzed in-memory successfully!');
      fetchApplicationAndResume();
    } catch (err) {
      setError(err.message || 'Failed to parse resume');
    } finally {
      setUploading(false);
    }
  };

  const handleSkillVerificationToggle = async (skillIndex) => {
    if (!resumeData?.parsedData?.skills) return;
    const updatedSkills = [...resumeData.parsedData.skills];
    updatedSkills[skillIndex].userVerified = !updatedSkills[skillIndex].userVerified;

    try {
      const res = await apiClient.put(`/resumes/${applicationId}`, {
        parsedData: {
          ...resumeData.parsedData,
          skills: updatedSkills
        }
      });
      setResumeData(res.data);
    } catch (err) {
      setError(`Failed to update skill verification: ${err.message}`);
    }
  };

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Resume & In-Memory Analysis</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Processed strictly in memory with %PDF- header verification. Analyzes bullet action verbs, contact details, and ATS structure.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm flex items-start gap-2.5">
            <XCircle size={17} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle size={17} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Upload Box */}
        <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border-2 border-dashed border-[var(--border-subtle)] hover:border-indigo-500/60 transition-colors text-center relative shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 border border-indigo-100 dark:border-indigo-900">
            {uploading ? <RefreshCw size={24} className="animate-spin" /> : <Upload size={24} />}
          </div>
          <h3 className="font-bold text-base sm:text-lg">
            {resumeData ? 'Upload New or Updated PDF Resume' : 'Upload Target Resume (PDF)'}
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-1.5 mb-5 max-w-md mx-auto leading-relaxed">
            Standard PDF format only (Max 5 MB). File is evaluated in memory and discarded—never written to persistent disk or exposed publicly.
          </p>

          <label className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm cursor-pointer transition-all shadow hover:shadow-indigo-500/20 active:scale-95">
            <span>{uploading ? 'Extracting Text In Memory...' : 'Select PDF File'}</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {resumeData?.originalFilename && (
            <div className="mt-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center gap-1.5">
              <FileText size={14} />
              <span>Current file: {resumeData.originalFilename} ({(resumeData.fileSize / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {/* Resume Quality Checklist Breakdown */}
        {resumeData?.qualityChecklist && (
          <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-4 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="font-extrabold text-base">Deterministic Quality Checklist</h3>
                <p className="text-xs text-[var(--text-muted)]">Rule-based scoring formula evaluating resume construction</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Action Verb Ratio: {Math.round((resumeData.qualityChecklist.actionVerbRatio || 0) * 100)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] flex items-center gap-2.5">
                <ShieldCheck size={18} className={resumeData.qualityChecklist.hasContactDetails ? "text-emerald-500" : "text-slate-400"} />
                <span className="font-medium">Contact Details (10 pts)</span>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] flex items-center gap-2.5">
                <ShieldCheck size={18} className={resumeData.qualityChecklist.hasSkillsSection ? "text-emerald-500" : "text-slate-400"} />
                <span className="font-medium">Skills Section (15 pts)</span>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] flex items-center gap-2.5">
                <ShieldCheck size={18} className={resumeData.qualityChecklist.hasProjectsOrExperience ? "text-emerald-500" : "text-slate-400"} />
                <span className="font-medium">Projects / Experience (15 pts)</span>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] flex items-center gap-2.5">
                <ShieldCheck size={18} className={resumeData.qualityChecklist.hasEducation ? "text-emerald-500" : "text-slate-400"} />
                <span className="font-medium">Education Listed (10 pts)</span>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] flex items-center gap-2.5">
                <ShieldCheck size={18} className={resumeData.qualityChecklist.actionVerbRatio >= 0.6 ? "text-emerald-500" : "text-slate-400"} />
                <span className="font-medium">≥ 60% Action Verb Bullets (20 pts)</span>
              </div>
              <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] flex items-center gap-2.5">
                <ShieldCheck size={18} className={resumeData.qualityChecklist.hasProfessionalLinks ? "text-emerald-500" : "text-slate-400"} />
                <span className="font-medium">Professional Links (10 pts)</span>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Skills with Manual Correction Toggles */}
        {resumeData?.parsedData?.skills && resumeData.parsedData.skills.length > 0 && (
          <div className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4 shadow-sm">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="font-extrabold text-base">Extracted Candidate Skills</h3>
                <p className="text-xs text-[var(--text-muted)]">Click any skill to verify or flag correction (user-verified edits take precedence)</p>
              </div>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {resumeData.parsedData.skills.length} skills detected
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5 pt-1">
              {resumeData.parsedData.skills.map((skill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSkillVerificationToggle(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                    skill.userVerified
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                      : 'bg-[var(--bg-primary)] border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-slate-400'
                  }`}
                  title="Click to toggle user verification status"
                >
                  <span>{skill.normalizedName || skill.name}</span>
                  {skill.userVerified ? (
                    <Check size={12} className="text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <span className="text-[10px] text-slate-400">Unverified</span>
                  )}
                </button>
              ))}
            </div>

            <div className="pt-3 flex justify-end">
              <Link
                to={`/app/${applicationId}/match`}
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-bold hover:underline"
              >
                <span>Proceed to Target Job Alignment →</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
