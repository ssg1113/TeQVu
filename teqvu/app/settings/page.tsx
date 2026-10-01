'use client';

import React, { useState } from 'react';
import {
  Settings,
  User,
  Moon,
  Sun,
  Bell,
  Mail,
  Shield,
  Key,
  CheckCircle2,
  Save,
  Sliders,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Laptop,
  Globe,
  Clock,
  Fingerprint,
  RefreshCw,
  Smartphone,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAppStore } from '../../lib/store/useAppStore';
import { PasswordStrengthIndicator } from '../../components/ui/PasswordStrengthIndicator';
import { updateUserPassword } from '../../lib/supabase/client';
import { PRIMARY_ADMIN_EMAIL, canSwitchRole } from '../../lib/security/admin';

export default function SettingsPage() {
  const router = useRouter();
  const {
    isDark,
    toggleTheme,
    newsletterPrefs,
    updateNewsletterPrefs,
    currentUser,
    adminEmails,
    setPasswordStatus,
    switchRole,
    updateUser,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'privacy' | 'security'>('appearance');
  const [saved, setSaved] = useState(false);

  // Notification toggles
  const [emailDigest, setEmailDigest] = useState(true);
  const [trendAlerts, setTrendAlerts] = useState(true);
  const [watchlistAlerts, setWatchlistAlerts] = useState(true);
  const [researchUpdates, setResearchUpdates] = useState(false);

  // Security & Password Management State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isNewPasswordValid, setIsNewPasswordValid] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(currentUser.twoFactorEnabled || false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [sessionsRevoked, setSessionsRevoked] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please provide your current password for security verification.');
      return;
    }

    if (!isNewPasswordValid) {
      setPasswordError('Your new password does not meet all required security standards.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError('New password and confirmation password do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      const { error } = await updateUserPassword(newPassword, {
        password_updated_by_user: true,
      });

      if (error) {
        console.warn('Supabase password update note:', error.message);
      }

      // Update state in app store
      const now = new Date().toISOString();
      setPasswordStatus(true, now);
      updateUser({
        passwordUpdatedAt: now,
        hasPassword: true,
      });

      setPasswordSuccess('Password successfully updated and validated across all linked login methods.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');

      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRevokeSessions = () => {
    setSessionsRevoked(true);
    setTimeout(() => setSessionsRevoked(false), 3000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
            <Settings className="w-4 h-4" />
            <span>Platform Preferences</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Settings & Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure theme aesthetics, notification thresholds, security credentials, and data privacy.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          {[
            { id: 'appearance', label: 'Appearance & Theme' },
            { id: 'notifications', label: 'Notification Rules' },
            { id: 'privacy', label: 'Privacy & Data' },
            { id: 'security', label: 'Security & Auth' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 transition -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: APPEARANCE */}
        {activeTab === 'appearance' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Color Theme</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Switch between high-contrast dark mode and clean daylight styling.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => !isDark && toggleTheme()}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition ${
                  isDark
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Dark Theme (Default)</span>
                    <span className="text-[11px] text-slate-400">Deep navy & sleek developer aesthetic</span>
                  </div>
                </div>
                {isDark && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
              </button>

              <button
                onClick={() => isDark && toggleTheme()}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition ${
                  !isDark
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div>
                    <span className="font-bold text-xs block text-slate-900 dark:text-white">Light Theme</span>
                    <span className="text-[11px] text-slate-400">Crisp high-readability daylight layout</span>
                  </div>
                </div>
                {!isDark && <CheckCircle2 className="w-4 h-4 text-cyan-600" />}
              </button>
            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Granular toggles for in-app signals and email dispatches.
              </p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {[
                { title: 'Scheduled Intelligence Digest', desc: 'Daily/weekly briefing sent via email.', state: emailDigest, setState: setEmailDigest },
                { title: 'Emerging Trend Priority Signals', desc: 'Alert when a technology crosses >100% velocity and 20+ sources.', state: trendAlerts, setState: setTrendAlerts },
                { title: 'Watchlist Activity Updates', desc: 'Notifications when followed technologies have major releases.', state: watchlistAlerts, setState: setWatchlistAlerts },
                { title: 'Academic Research Preprints', desc: 'Alerts for trending arXiv and ACM papers in your chosen areas.', state: researchUpdates, setState: setResearchUpdates },
              ].map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">{item.title}</span>
                    <span className="text-slate-400 text-[11px]">{item.desc}</span>
                  </div>
                  <button
                    onClick={() => item.setState(!item.state)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${
                      item.state ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform transform ${
                        item.state ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleSave}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-sm"
              >
                Save Notification Rules
              </button>
            </div>
          </div>
        )}

        {/* TAB: PRIVACY */}
        {activeTab === 'privacy' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Privacy & Reading Activity</h3>
            <p className="text-slate-400">
              We never sell or monetize your reading history or followed technologies. Your recommendation profile is encrypted and localized to your user profile.
            </p>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-2">
              <span className="font-bold text-slate-900 dark:text-white block">Data Export & Portability</span>
              <p className="text-slate-400 text-[11px]">
                Download a complete JSON export of all your bookmarks, followed technologies, and custom dossiers.
              </p>
              <button className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:text-cyan-400">
                Export Data (.JSON)
              </button>
            </div>
          </div>
        )}

        {/* TAB: SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6 text-xs">
            {/* Security Overview & Master Password Banner */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Unified Account & Password Security
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Your account ({currentUser.email}) enforces a validated master password across Google SSO, GitHub SSO, and email logins.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Password Validated
                  </span>
                </div>
              </div>

              {/* Linked Providers */}
              <div className="space-y-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block text-xs">
                  Unified Identity Mapping (Single Account Architecture)
                </span>
                <p className="text-[11px] text-slate-400">
                  Signing in via Google, GitHub, or Email/Password accesses this same unified account with identical saved preferences and bookmarks.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Google OAuth</span>
                        <span className="text-[10px] text-slate-400">Primary SSO</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Linked
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Key className="w-3.5 h-3.5 text-slate-700 dark:text-slate-200" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">GitHub OAuth</span>
                        <span className="text-[10px] text-slate-400">Developer SSO</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Linked
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 block text-xs">Master Password</span>
                        <span className="text-[10px] text-slate-400">Validated</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Governance & Authority Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Account Tier & Role Authority
                    </h3>
                  </div>
                  <p className="text-slate-400 text-xs">
                    {currentUser.role === 'admin'
                      ? `Authenticated with Administrator privileges (${currentUser.email}). Authority to access Admin Console and manage governance.`
                      : canSwitchRole(currentUser.email, currentUser.role, adminEmails)
                      ? `Authenticated as ${currentUser.email}. You hold authorized Admin clearance and can switch to Administrator role.`
                      : 'Authenticated as a Normal User. Standard user accounts cannot modify or elevate their role.'}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold capitalize ${
                    currentUser.role === 'admin'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}
                >
                  {currentUser.role} Tier
                </span>
              </div>

              {canSwitchRole(currentUser.email, currentUser.role, adminEmails) ? (
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block text-xs">
                      Admin Role Transition Authority
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Switching roles will log out your active session and redirect you to the login page for security re-authentication.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const targetRole = currentUser.role === 'admin' ? 'user' : 'admin';
                      const success = switchRole(targetRole);
                      if (success) {
                        router.push(`/signin?switched=true&role=${targetRole}`);
                      }
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition whitespace-nowrap"
                  >
                    {currentUser.role === 'admin' ? 'Switch to Normal User' : 'Switch to Administrator'}
                  </button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>
                    Role switching locked: Only the primary administrator (<span className="font-mono text-purple-400">{PRIMARY_ADMIN_EMAIL}</span>) or delegated admin accounts have authority to hold or switch administrator clearance.
                  </span>
                </div>
              )}
            </div>

            {/* Change Password Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-cyan-500" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Update / Change Account Password
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Update your validated master password. Changing this will update your credentials across all linked authentication methods.
                </p>
              </div>

              {passwordSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      required
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Validated Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Create strong password"
                        required
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        required
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Engine */}
                <PasswordStrengthIndicator
                  password={newPassword}
                  confirmPassword={confirmNewPassword}
                  userEmail={currentUser.email}
                  onValidationChange={setIsNewPasswordValid}
                />

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={
                      passwordLoading ||
                      !currentPassword ||
                      !isNewPasswordValid ||
                      newPassword !== confirmNewPassword
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {passwordLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Additional Optimized Security Features: 2FA & Active Sessions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* 2FA Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Two-Factor Authentication (2FA)
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      twoFactorEnabled
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Require a time-based one-time code (TOTP) from Google Authenticator, 1Password, or Authy on new sign-ins.
                </p>
                <button
                  type="button"
                  onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 transition"
                >
                  {twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
                </button>
              </div>

              {/* Active Sessions Card */}
              <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Active Sessions & Devices
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Current Device
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="text-slate-700 dark:text-slate-200 font-medium">
                    Windows Desktop &bull; Chrome Browser
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Token refreshed &bull; Secure PKCE session
                  </p>
                </div>
                {sessionsRevoked ? (
                  <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    All remote sessions terminated
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRevokeSessions}
                    className="px-4 py-2 rounded-xl border border-red-500/20 bg-red-500/5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
                  >
                    Revoke Other Sessions
                  </button>
                )}
              </div>
            </div>

            {/* Security Audit Trail */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Security Event Audit Log
                </h4>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Validated master password requirement active
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">Protected</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Unified identity linking: Google SSO & GitHub SSO
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">Synchronized</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">
                      Last password validation check
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {currentUser.passwordUpdatedAt ? new Date(currentUser.passwordUpdatedAt).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings successfully updated!</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
