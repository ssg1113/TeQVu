'use client';

import React, { useState } from 'react';
import {
  Mail,
  ShieldCheck,
  Bell,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Sliders,
  Send,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAppStore } from '../../lib/store/useAppStore';

export default function NewsletterPage() {
  const { newsletterPrefs, updateNewsletterPrefs, currentUser } = useAppStore();
  const [testSent, setTestSent] = useState(false);

  const categories = [
    'AI/ML',
    'Languages',
    'Cloud Computing',
    'Cybersecurity',
    'DevOps',
    'Databases',
    'Software Engineering',
    'Systems Programming',
    'Quantum Computing',
  ];

  const handleToggleCategory = (cat: string) => {
    const exists = newsletterPrefs.categories.includes(cat);
    const updated = exists
      ? newsletterPrefs.categories.filter((c) => c !== cat)
      : [...newsletterPrefs.categories, cat];
    updateNewsletterPrefs({ categories: updated });
  };

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-10">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
            <Mail className="w-4 h-4" />
            <span>Intelligent Email Dispatch & Anti-Spam</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Newsletter & Smart Alert Governance
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Control your digest frequency, topical filtering, and strict anti-spam thresholds. We never spam your inbox.
          </p>
        </div>

        {/* 2-Column Grid: Settings & Live Email Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Frequency Selector */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Digest Delivery Frequency
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select how often you wish to receive your personalized briefing.
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-semibold uppercase">
                  {newsletterPrefs.frequency}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['daily', 'weekly', 'monthly', 'disabled'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => updateNewsletterPrefs({ frequency: freq })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition border ${
                      newsletterPrefs.frequency === freq
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            {/* Topical Categories */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Included Newsletter Domains
              </h3>
              <p className="text-xs text-slate-400">
                Only developments from selected domains will be compiled into your email.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {categories.map((cat) => {
                  const active = newsletterPrefs.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                        active
                          ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-400'
                      }`}
                    >
                      {active ? '✓ ' : '+ '}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Smart Anti-Spam & Quiet Hours Engine */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Smart Alert Throttles & Verification
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Guaranteed prevention of notification fatigue.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                {/* Max alerts per day */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Maximum Alerts Per Day
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Strict hard ceiling for critical breaking signals.
                    </span>
                  </div>
                  <select
                    value={newsletterPrefs.maxAlertsPerDay}
                    onChange={(e) =>
                      updateNewsletterPrefs({ maxAlertsPerDay: Number(e.target.value) })
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-lg text-xs font-mono font-bold"
                  >
                    <option value={1}>1 Alert / Day (Recommended)</option>
                    <option value={2}>2 Alerts / Day</option>
                    <option value={3}>3 Alerts / Day</option>
                  </select>
                </div>

                {/* Quiet Hours */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Quiet Hours (Do Not Disturb)
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      No alerts will be delivered between these hours.
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <input
                      type="text"
                      value={newsletterPrefs.quietHoursStart}
                      onChange={(e) =>
                        updateNewsletterPrefs({ quietHoursStart: e.target.value })
                      }
                      className="w-16 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                    />
                    <span>to</span>
                    <input
                      type="text"
                      value={newsletterPrefs.quietHoursEnd}
                      onChange={(e) => updateNewsletterPrefs({ quietHoursEnd: e.target.value })}
                      className="w-16 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Test Email Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSendTest}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-md shadow-cyan-500/20 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Sample Newsletter Preview</span>
              </button>
              {testSent && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  Sent test sample to {currentUser.email}
                </span>
              )}
            </div>
          </div>

          {/* Email Preview Mockup Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs font-sans space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Live Rendered Email Preview
                </span>
                <span className="text-[10px] font-mono text-slate-400">Next.js + Resend</span>
              </div>

              {/* Email Content Container */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-cyan-500 flex items-center justify-center text-white font-bold text-xs">
                      T
                    </div>
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                      TeQVu Brief
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Issue #248</span>
                </div>

                {/* Section 1: Top Developments */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-purple-400 font-bold mb-1">
                    1. Top Developments
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
                    Anthropic Releases Claude 4 with 200K Context
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Extended reasoning and autonomous tool use capabilities merged for production workflows.
                  </p>
                </div>

                {/* Section 2: Emerging Technologies */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1">
                    2. Emerging Signal Detected
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    Rust Systems Drivers in Mainline Linux (+31%)
                  </div>
                  <span className="text-[10px] text-slate-400">38 independent sources confirmed</span>
                </div>

                {/* Section 3: Research Spotlight */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1">
                    3. Research Worth Reading
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    FlashAttention-3: Asynchronous Hardware Kernels
                  </div>
                  <span className="text-[10px] text-slate-400">arXiv CS.LG • 890 citations</span>
                </div>

                {/* Section 4: Watchlist summary */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Your Watchlist:</span>
                  <span className="text-emerald-400 font-bold">5 techs active</span>
                </div>
              </div>

              {/* Unsubscribe footer */}
              <div className="text-center pt-2 text-[10px] text-slate-400 space-y-1">
                <div>You are receiving this because you subscribed to TeQVu.</div>
                <div className="text-cyan-400 cursor-pointer hover:underline">
                  Manage Preferences • 1-Click Unsubscribe
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ALERT DISPATCH HISTORY */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Dispatched Alerts Log (Anti-Spam Verification)
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Trigger Reason</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Sources Corroborated</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {[
                  {
                    time: 'Today, 08:30 AM',
                    reason: 'Velocity > 100% threshold',
                    subject: 'Breakthrough: LLM Agents Autonomous Workflows',
                    sources: '74 independent sources',
                    status: 'Delivered',
                  },
                  {
                    time: 'Yesterday, 14:15 PM',
                    reason: 'Watchlist Tech Priority Update',
                    subject: 'Rust Production Drivers Merged into Linux',
                    sources: '38 independent sources',
                    status: 'Delivered',
                  },
                  {
                    time: 'Sep 21, 2026',
                    reason: 'Suppressed by Quiet Hours Filter',
                    subject: 'Quantum Computing Surface Code Breakthrough',
                    sources: '12 independent sources',
                    status: 'Suppressed (Anti-Spam)',
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 font-mono">
                    <td className="py-3 px-4 text-slate-400">{row.time}</td>
                    <td className="py-3 px-4 text-slate-300">{row.reason}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white font-sans">
                      {row.subject}
                    </td>
                    <td className="py-3 px-4 text-cyan-400">{row.sources}</td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          row.status.includes('Suppressed')
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
