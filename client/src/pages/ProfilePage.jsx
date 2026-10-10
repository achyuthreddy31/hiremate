import React, { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { User, Trash2, Save, AlertTriangle, ShieldCheck, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currentLevel: 'beginner',
    skills: [],
    links: { github: '', linkedin: '', portfolio: '' }
  });
  const [skillsText, setSkillsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/users/profile');
      if (res.data) {
        setProfile(res.data);
        setSkillsText((res.data.skills || []).join(', '));
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const parsedSkills = skillsText.split(',').map(s => s.trim()).filter(Boolean);
      const payload = {
        ...profile,
        skills: parsedSkills
      };
      await apiClient.put('/users/profile', payload);
      setMessage('Candidate profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you strictly sure you want to delete your entire account and all application data? This action permanently cascades across all records.')) {
      try {
        await apiClient.delete('/users/account');
        localStorage.clear();
        navigate('/login');
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Candidate Profile & Account Settings</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Manage your verified candidate skills, career level, and professional profiles.
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-2">
            <Check size={16} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profile.name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Candidate Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={profile.email || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                placeholder="candidate@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Experience Level</label>
            <select
              value={profile.currentLevel || 'beginner'}
              onChange={(e) => setProfile(prev => ({ ...prev, currentLevel: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            >
              <option value="beginner">Beginner (Entry Level / Student)</option>
              <option value="intermediate">Intermediate (Mid Level / 2-5 Years)</option>
              <option value="advanced">Advanced (Senior / 5+ Years)</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Verified Technical Skills</label>
              <span className="text-[11px] text-[var(--text-muted)]">Comma separated list</span>
            </div>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="e.g. JavaScript, React, Node.js, Docker, Python, MongoDB"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">GitHub Profile Link</label>
              <input
                type="text"
                value={profile.links?.github || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, links: { ...prev.links, github: e.target.value } }))}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">LinkedIn Profile Link</label>
              <input
                type="text"
                value={profile.links?.linkedin || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, links: { ...prev.links, linkedin: e.target.value } }))}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? 'Saving Profile...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-rose-200 dark:border-rose-900/50 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-base">
            <Trash2 size={18} />
            <span>Data Privacy & Complete Account Deletion</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Per product privacy guidelines, you may permanently purge your user profile, all applications, in-memory parsed resumes, quiz results, and preparation records.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors"
          >
            Permanently Purge All Data
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
