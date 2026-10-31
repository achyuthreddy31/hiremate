import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Trash2,
  Save,
  AlertTriangle,
  ShieldCheck,
  Check,
  LogOut,
  Mail,
  ExternalLink,
  Lock
} from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

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
  const [signingOut, setSigningOut] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const defaultLinks = { github: '', linkedin: '', portfolio: '' };

  useEffect(() => {
    fetchProfile();
  }, []);

  const normalizeProfile = (data) => ({
    name: data?.name || '',
    email: data?.email || '',
    currentLevel: data?.currentLevel || 'beginner',
    skills: Array.isArray(data?.skills) ? data.skills : [],
    links: {
      github: data?.links?.github || '',
      linkedin: data?.links?.linkedin || '',
      portfolio: data?.links?.portfolio || ''
    }
  });

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/users/profile');
      if (res?.data) {
        const normalized = normalizeProfile(res.data);
        setProfile(normalized);
        setSkillsText((normalized.skills || []).join(', '));
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
      const parsedSkills = skillsText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const payload = {
        name: profile.name || '',
        email: profile.email || '',
        currentLevel: profile.currentLevel || 'beginner',
        skills: parsedSkills,
        links: {
          github: profile.links?.github || '',
          linkedin: profile.links?.linkedin || '',
          portfolio: profile.links?.portfolio || ''
        }
      };

      const res = await apiClient.put('/users/profile', payload);
      if (res?.data) {
        const updated = normalizeProfile(res.data);
        setProfile(updated);
        setSkillsText((updated.skills || []).join(', '));
      }
      setMessage('Candidate profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setError('');
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to sign out');
      setSigningOut(false);
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

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto h-64 flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-xs text-[var(--text-muted)]">Loading candidate profile...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Candidate Profile & Account</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Manage your verified skills, account credentials, and platform authentication.
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

        {/* Highlighted Profile & Account Session Card with Sign Out */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-50/80 via-blue-50/40 to-slate-50 dark:from-blue-950/40 dark:via-slate-900/80 dark:to-slate-900 border border-blue-200/90 dark:border-blue-800/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              {currentUser?.email ? currentUser.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-[var(--text-primary)]">
                  {profile.name || currentUser?.displayName || 'Active Candidate'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Authenticated
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5">
                <Mail size={12} className="text-blue-500" />
                <span>{currentUser?.email || profile.email || 'account@hiremate.ai'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm border border-rose-200 dark:border-rose-900/60 transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0"
          >
            <LogOut size={15} />
            <span>{signingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>

        {/* Profile Settings Form */}
        <form onSubmit={handleSave} className="p-6 sm:p-7 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="font-extrabold text-base">Candidate Information & Experience</h3>
            <span className="text-xs text-[var(--text-muted)]">Career Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profile.name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Candidate Full Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">Experience Level</label>
            <select
              value={profile.currentLevel || 'beginner'}
              onChange={(e) => setProfile(prev => ({ ...prev, currentLevel: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">GitHub Profile Link</label>
              <input
                type="text"
                value={profile.links?.github || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, links: { ...(prev.links || defaultLinks), github: e.target.value } }))}
                placeholder="https://github.com/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-1">LinkedIn Profile Link</label>
              <input
                type="text"
                value={profile.links?.linkedin || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, links: { ...(prev.links || defaultLinks), linkedin: e.target.value } }))}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all shadow hover:shadow-blue-500/20 active:scale-95 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        {/* Danger Zone: Account Purge */}
        <div className="p-6 rounded-2xl bg-[var(--bg-surface)] border border-rose-200 dark:border-rose-900/50 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-base">
            <Trash2 size={18} />
            <span>Permanent Account & Data Purge</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Permanently delete your user profile and all associated target job applications, resumes, practice attempts, and preparation records. This cannot be undone.
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
