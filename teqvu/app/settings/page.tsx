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
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAppStore } from '../../lib/store/useAppStore';

export default function SettingsPage() {
  const { isDark, toggleTheme, newsletterPrefs, updateNewsletterPrefs, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'privacy' | 'security'>('appearance');
  const [saved, setSaved] = useState(false);

  // Notification toggles
  const [emailDigest, setEmailDigest] = useState(true);
  const [trendAlerts, setTrendAlerts] = useState(true);
  const [watchlistAlerts, setWatchlistAlerts] = useState(true);
  const [researchUpdates, setResearchUpdates] = useState(false);

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
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Security & Authentication</h3>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">OAuth Providers Linked</span>
                <span className="text-slate-400 text-[11px]">Google & GitHub SSO active</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">Connected</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Two-Factor Authentication</span>
                <span className="text-slate-400 text-[11px]">Protect account with authenticator app</span>
              </div>
              <button className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:text-cyan-400">
                Configure 2FA
              </button>
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
