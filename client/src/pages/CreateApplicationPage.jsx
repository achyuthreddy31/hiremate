import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { Briefcase, ArrowRight } from 'lucide-react';

export default function CreateApplicationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    jobUrl: '',
    location: '',
    employmentType: 'full_time',
    experienceLevel: 'entry_level',
    interviewDate: '',
    availableDays: 14,
    dailyPreparationMinutes: 60
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        interviewDate: formData.interviewDate ? new Date(formData.interviewDate).toISOString() : null
      };
      const res = await apiClient.post('/applications', payload);
      const newApp = res.data;
      navigate(`/app/${newApp._id}/dashboard`);
    } catch (err) {
      setError(err.message || 'Failed to create application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Target Application</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Provide the company details, real job description, and your study time to build your roadmap.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Company Name *</label>
              <input
                type="text"
                name="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Acme Corp"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Job Title *</label>
              <input
                type="text"
                name="jobTitle"
                required
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Full Stack Engineer"
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Real Job Description *</label>
            <textarea
              name="jobDescription"
              required
              rows={6}
              value={formData.jobDescription}
              onChange={handleChange}
              placeholder="Paste the full job posting text here. HireMate AI will extract requirements, technical skills, and ATS keywords."
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Target Interview Date</label>
              <input
                type="date"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Available Prep Days</label>
              <input
                type="number"
                name="availableDays"
                min={1}
                max={180}
                value={formData.availableDays}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">Daily Study Time (mins)</label>
              <input
                type="number"
                name="dailyPreparationMinutes"
                min={20}
                max={480}
                step={10}
                value={formData.dailyPreparationMinutes}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create & Proceed'}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
