import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { Upload, CheckCircle, AlertTriangle, FileText, Check, ShieldCheck } from 'lucide-react';

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
      setError(err.message);
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
      setSuccess('Resume uploaded and verified in-memory successfully!');
      fetchApplicationAndResume();
    } catch (err) {
      setError(err.message || 'Failed to parse resume');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout currentApplication={app}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resume & In-Memory Analysis</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Uploaded in memory only. We verify PDF signatures and evaluate action verbs, contact details, and ATS structure.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            <span>{success}</span>
          </div>
        )}

        {/* Upload Box */}
        <div className="p-8 rounded-2xl bg-[var(--bg-surface)] border-2 border-dashed border-[var(--border-subtle)] hover:border-indigo-500/60 transition-colors text-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <Upload size={22} />
          </div>
          <h3 className="font-semibold text-base">Upload Target PDF Resume</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 mb-4">
            PDF files only (max 5 MB). File is processed in-memory and not written to disk.
          </p>
          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm cursor-pointer transition-colors">
            <span>{uploading ? 'Processing in-memory...' : 'Select PDF File'}</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Resume Quality Checklist Breakdown */}
        {resumeData?.qualityChecklist && (
          <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="font-semibold text-base">Deterministic Quality Checklist</h3>
                <p className="text-xs text-[var(--text-muted)]">Checklist evaluation used directly in Job Match & Readiness scores</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                Action Verbs: {Math.round((resumeData.qualityChecklist.actionVerbRatio || 0) * 100)}%
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={resumeData.qualityChecklist.hasContactDetails ? "text-emerald-500" : "text-slate-400"} />
                <span>Contact Details (10 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={resumeData.qualityChecklist.hasSkillsSection ? "text-emerald-500" : "text-slate-400"} />
                <span>Skills Section Present (15 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={resumeData.qualityChecklist.hasProjectsOrExperience ? "text-emerald-500" : "text-slate-400"} />
                <span>Projects or Experience (15 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={resumeData.qualityChecklist.hasEducation ? "text-emerald-500" : "text-slate-400"} />
                <span>Education Details (10 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={resumeData.qualityChecklist.actionVerbRatio >= 0.6 ? "text-emerald-500" : "text-slate-400"} />
                <span>≥ 60% Action Verb Bullets (20 pts)</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className={resumeData.qualityChecklist.hasProfessionalLinks ? "text-emerald-500" : "text-slate-400"} />
                <span>Professional Links (GitHub/LinkedIn) (10 pts)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
