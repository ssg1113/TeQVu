'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Mail,
  ShieldCheck,
  Bell,
  Clock,
  CheckCircle2,
  Calendar,
  Send,
  Eye,
  ExternalLink,
  Loader2,
  AlertCircle,
  HelpCircle,
  Flame,
  BookOpen,
  Info,
  Play,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAppStore } from '../../lib/store/useAppStore';
import { Logo } from '../../components/ui/Logo';
import type { DeliveryLog } from '../../lib/types';

export default function NewsletterPage() {
  const { newsletterPrefs, updateNewsletterPrefs, currentUser } = useAppStore();

  const [targetEmail, setTargetEmail] = useState(
    newsletterPrefs.scheduledEmail || currentUser?.email || 'sgdesilva1113@gmail.com'
  );

  const [isSendingSample, setIsSendingSample] = useState(false);
  const [isTriggeringScheduled, setIsTriggeringScheduled] = useState(false);

  const [sendResult, setSendResult] = useState<{
    success: boolean;
    mode?: string;
    deliveredTo?: string;
    message?: string;
    previewUrl?: string;
    error?: string;
  } | null>(null);

  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Live preview items for the mockup card
  const [previewArticle, setPreviewArticle] = useState<any>({
    title: 'Anthropic Unveils Claude 3.7 Sonnet with Hybrid Reasoning Architecture',
    summary:
      'Seamlessly toggles between instantaneous standard responses and extended dynamic chain-of-thought reflection, setting state-of-the-art SWE-bench records.',
    source: { name: 'Anthropic' },
    category: 'AI/ML',
  });
  const [previewTech, setPreviewTech] = useState<any>({
    name: 'vllm-project/vllm',
    growth: 86,
    mentions: 38400,
    description: 'High-throughput and memory-efficient LLM inference engine supporting PagedAttention and continuous batching.',
  });
  const [previewPaper, setPreviewPaper] = useState<any>({
    title: 'DeepSeek-R1: Incentivizing Reasoning Capability via Pure Reinforcement Learning',
    authors: ['DeepSeek-AI Research'],
    summary: 'Demonstrates emergent chain-of-thought and self-verification directly from large-scale RL without supervised reasoning demonstrations.',
    source: 'arXiv CS.AI',
  });

  // Fetch backend schedule & delivery logs on mount
  const fetchScheduleAndLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch('/api/newsletter/schedule');
      if (res.ok) {
        const data = await res.json();
        if (data.schedule?.email) {
          setTargetEmail(data.schedule.email);
        }
        if (Array.isArray(data.logs)) {
          setDeliveryLogs(data.logs);
        }
      }
    } catch (e) {
      console.warn('Could not load schedule logs:', e);
    } finally {
      setIsLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchScheduleAndLogs();
  }, [fetchScheduleAndLogs]);

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

  // Send Sample Newsletter Preview
  const handleSendSample = async () => {
    setIsSendingSample(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/newsletter/send-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          categories: newsletterPrefs.categories,
          frequency: newsletterPrefs.frequency,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({
          success: true,
          mode: data.mode,
          deliveredTo: data.deliveredTo,
          message: data.message,
          previewUrl: data.previewUrl,
        });
        fetchScheduleAndLogs();
      } else {
        setSendResult({
          success: false,
          error: data.error || 'Failed to dispatch sample email.',
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        error: err.message || 'Network error while attempting to dispatch email.',
      });
    } finally {
      setIsSendingSample(false);
    }
  };

  // Trigger Scheduled Dispatch Now (Manual Test Run of Scheduled Email)
  const handleTriggerScheduledNow = async () => {
    setIsTriggeringScheduled(true);
    setSendResult(null);

    try {
      const res = await fetch('/api/newsletter/schedule', {
        method: 'PUT',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSendResult({
          success: true,
          mode: data.result?.mode,
          deliveredTo: data.result?.deliveredTo,
          message: `Scheduled ${newsletterPrefs.frequency} briefing triggered and delivered to ${data.result?.deliveredTo}!`,
          previewUrl: data.result?.previewUrl,
        });
        fetchScheduleAndLogs();
      } else {
        setSendResult({
          success: false,
          error: data.error || 'Failed to trigger scheduled email.',
        });
      }
    } catch (err: any) {
      setSendResult({
        success: false,
        error: err.message || 'Network error executing scheduled dispatch.',
      });
    } finally {
      setIsTriggeringScheduled(false);
    }
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
            Configure topical categories, test live email dispatches, and inspect anti-spam rules. Automated delivery schedules & timers are managed in your Developer Profile.
          </p>
        </div>

        {/* 2-Column Grid: Settings & Live Email Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Target Email Selector Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-cyan-500/30 dark:border-cyan-500/30 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-cyan-500" />
                    Recipient Email Address
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enter the email address where your automated briefs and sample previews will be delivered.
                  </p>
                </div>
                {currentUser?.email && (
                  <button
                    onClick={() => setTargetEmail(currentUser.email)}
                    className="text-[11px] font-mono text-cyan-500 hover:underline"
                  >
                    Use Account Email
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                <input
                  type="email"
                  value={targetEmail}
                  onChange={(e) => setTargetEmail(e.target.value)}
                  placeholder="your-email@gmail.com"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Frequency Selector */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-500" />
                    Digest Delivery Frequency
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select your preferred cadence for automated email summaries.
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
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition border text-left flex flex-col justify-between ${
                      newsletterPrefs.frequency === freq
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                    }`}
                  >
                    <span>{freq}</span>
                    <span className={`text-[10px] font-normal mt-0.5 opacity-80`}>
                      {freq === 'daily'
                        ? '24h signals'
                        : freq === 'weekly'
                        ? '7-day digest'
                        : freq === 'monthly'
                        ? '30-day radar'
                        : 'Paused'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Automated Delivery Schedule & Timer Profile Link */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-blue-500/10 border border-cyan-500/30 dark:border-cyan-500/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 dark:bg-cyan-500/25 text-cyan-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Automated Delivery Schedule & Delivery Timer
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30">
                      Profile Feature
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure your preferred daily, weekly, or monthly delivery time in your Developer Profile.
                  </p>
                </div>
              </div>
              <Link
                href="/profile"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 whitespace-nowrap shrink-0"
              >
                <span>Configure Timer in Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
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

            {/* Test Email Action Buttons & Feedback Card */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Send Sample Newsletter Preview */}
                <button
                  onClick={handleSendSample}
                  disabled={isSendingSample || isTriggeringScheduled || !targetEmail}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingSample ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Compiling & Dispatching Sample...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Sample Newsletter Preview</span>
                    </>
                  )}
                </button>

                {/* Trigger Scheduled Delivery Now */}
                <button
                  onClick={handleTriggerScheduledNow}
                  disabled={isTriggeringScheduled || isSendingSample || !targetEmail}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition disabled:opacity-50"
                  title="Test the exact automated schedule dispatch right now"
                >
                  {isTriggeringScheduled ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span>Dispatching Scheduled Email...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-purple-400" />
                      <span>Trigger Scheduled Dispatch Now</span>
                    </>
                  )}
                </button>
              </div>

              {/* Delivery Success / Status Box */}
              {sendResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 animate-fade-in ${
                    !sendResult.success
                      ? 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
                      : sendResult.mode === 'ethereal_preview'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-200'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!sendResult.success ? (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    ) : sendResult.mode === 'ethereal_preview' ? (
                      <HelpCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1.5 w-full">
                      <div className="font-bold text-sm">
                        {!sendResult.success
                          ? 'Dispatch Error'
                          : sendResult.mode === 'ethereal_preview'
                          ? `Simulated Web Preview (No Live Provider Detected)`
                          : `Email Delivered to ${sendResult.deliveredTo}`}
                      </div>
                      <p className="leading-relaxed opacity-90">{sendResult.message || sendResult.error}</p>

                      {sendResult.success && sendResult.mode === 'resend' && (
                        <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 flex items-start gap-2 text-[11px]">
                          <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Check Gmail Spam or Promotions:</strong> Because Resend sends via its shared test domain (<code className="font-mono text-[10px]">onboarding@resend.dev</code>), Gmail often places this preview into your <strong>Spam / Junk</strong> folder or <strong>Promotions tab</strong>.
                          </div>
                        </div>
                      )}

                      {sendResult.previewUrl && (
                        <div className="pt-2">
                          <a
                            href={sendResult.previewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs transition shadow-sm"
                          >
                            <span>Open Sent Email in Web Mailbox</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Email Preview Mockup Column (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs font-sans space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-mono text-[10px] uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Live Compiled Email Preview
                </span>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                  {newsletterPrefs.frequency} Briefing
                </span>
              </div>

              {/* Email Content Container */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Logo variant="icon" size="xs" />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                      <span>Te</span>
                      <span className="bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Q</span>
                      <span>Vu {newsletterPrefs.frequency === 'weekly' ? 'Weekly' : newsletterPrefs.frequency === 'monthly' ? 'Monthly' : 'Daily'} Brief</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Section 1: Top Developments */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-purple-400 font-bold mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    1. Important Development &bull; {previewArticle.source.name}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug line-clamp-2">
                    {previewArticle.title}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {previewArticle.summary}
                  </p>
                </div>

                {/* Section 2: Emerging Technologies */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold mb-1 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-cyan-400" />
                    2. Trending Open-Source Velocity
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span>{previewTech.name}</span>
                    <span className="text-emerald-500 font-mono text-[11px] font-bold">
                      +{previewTech.growth}% Velocity
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    {previewTech.description}
                  </p>
                </div>

                {/* Section 3: Research Spotlight */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    3. Research Worth Reading
                  </div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {previewPaper.title}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">
                    {previewPaper.summary}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    {previewPaper.source} &bull; {previewPaper.authors[0]}
                  </span>
                </div>

                {/* Section 4: Target Recipient Notice */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Delivering to:</span>
                  <span className="text-cyan-400 font-bold truncate max-w-[170px]">{targetEmail}</span>
                </div>
              </div>

              {/* Unsubscribe footer */}
              <div className="text-center pt-2 text-[10px] text-slate-400 space-y-1">
                <div>
                  Cadence: <span className="text-cyan-400 font-medium capitalize">{newsletterPrefs.frequency} briefing</span> •{' '}
                  <Link href="/profile" className="text-cyan-500 hover:underline">
                    Edit delivery timer in Profile &rarr;
                  </Link>
                </div>
                <div className="text-slate-500">
                  Attribution: Content compiled dynamically from verified RSS feeds, GitHub, and arXiv.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ALERT DISPATCH HISTORY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Dispatched Briefings & Delivery Audit Log
              </h2>
            </div>
            <button
              onClick={fetchScheduleAndLogs}
              disabled={isLoadingLogs}
              className="text-xs font-mono text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type / Cadence</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Delivery Mode</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {deliveryLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-mono text-xs">
                      No email dispatches recorded yet. Use the buttons above to send a preview or activate automated schedule.
                    </td>
                  </tr>
                ) : (
                  deliveryLogs.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 font-mono">
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(row.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold capitalize text-cyan-400">
                        {row.frequency}
                      </td>
                      <td className="py-3 px-4 text-slate-400 truncate max-w-[150px]">
                        {row.email}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white font-sans truncate max-w-[280px]">
                        {row.subject}
                      </td>
                      <td className="py-3 px-4 text-slate-400 uppercase text-[10px]">
                        {row.mode}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            row.status === 'delivered'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : row.status === 'simulated'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
