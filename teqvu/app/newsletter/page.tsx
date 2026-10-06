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
  RotateCw,
  Sparkles,
  Save,
  Play,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAppStore } from '../../lib/store/useAppStore';
import { Logo } from '../../components/ui/Logo';
import type { DeliveryLog, NewsletterSchedule } from '../../lib/types';

const DAYS_OF_WEEK = [
  { label: 'Mon', value: 1, name: 'Monday' },
  { label: 'Tue', value: 2, name: 'Tuesday' },
  { label: 'Wed', value: 3, name: 'Wednesday' },
  { label: 'Thu', value: 4, name: 'Thursday' },
  { label: 'Fri', value: 5, name: 'Friday' },
  { label: 'Sat', value: 6, name: 'Saturday' },
  { label: 'Sun', value: 0, name: 'Sunday' },
];

const DAYS_OF_MONTH = [
  { label: '1st of month', value: 1 },
  { label: '15th of month', value: 15 },
  { label: 'End of month (28th)', value: 28 },
];

const TIME_PRESETS = [
  { label: '08:00 AM (Morning)', value: '08:00' },
  { label: '09:30 AM (Workday)', value: '09:30' },
  { label: '13:00 PM (Midday)', value: '13:00' },
  { label: '18:00 PM (Wrap-up)', value: '18:00' },
];

export default function NewsletterPage() {
  const { newsletterPrefs, updateNewsletterPrefs, currentUser, isAuthenticated } = useAppStore();
  const [mounted, setMounted] = useState(false);

  const [targetEmail, setTargetEmail] = useState(
    currentUser?.email || newsletterPrefs.scheduledEmail || ''
  );
  const [deliveryTime, setDeliveryTime] = useState(
    newsletterPrefs.deliveryTime || '08:00'
  );
  const [deliveryDayOfWeek, setDeliveryDayOfWeek] = useState(
    newsletterPrefs.deliveryDayOfWeek ?? 1
  );
  const [deliveryDayOfMonth, setDeliveryDayOfMonth] = useState(
    newsletterPrefs.deliveryDayOfMonth ?? 1
  );
  const [scheduleEnabled, setScheduleEnabled] = useState(
    newsletterPrefs.scheduleEnabled ?? true
  );
  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [isTriggeringScheduled, setIsTriggeringScheduled] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const [serverSchedule, setServerSchedule] = useState<NewsletterSchedule | null>(null);
  const [isSendingSample, setIsSendingSample] = useState(false);

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentUser?.email && !targetEmail) {
      setTargetEmail(currentUser.email);
    }
  }, [currentUser?.email, targetEmail]);

  // Sync state if store hydrated from localStorage with user preferences
  useEffect(() => {
    if (newsletterPrefs.deliveryTime) {
      setDeliveryTime((prev) => (prev !== newsletterPrefs.deliveryTime ? newsletterPrefs.deliveryTime! : prev));
    }
    if (typeof newsletterPrefs.deliveryDayOfWeek === 'number') {
      setDeliveryDayOfWeek(newsletterPrefs.deliveryDayOfWeek);
    }
    if (typeof newsletterPrefs.deliveryDayOfMonth === 'number') {
      setDeliveryDayOfMonth(newsletterPrefs.deliveryDayOfMonth);
    }
    if (typeof newsletterPrefs.scheduleEnabled === 'boolean') {
      setScheduleEnabled(newsletterPrefs.scheduleEnabled);
    }
  }, [newsletterPrefs]);

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
    if (!isAuthenticated) return;
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/newsletter/schedule?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.schedule) {
          setServerSchedule(data.schedule);
          if (data.schedule.email && !targetEmail) {
            setTargetEmail(data.schedule.email);
          }
          if (data.schedule.deliveryTime) {
            setDeliveryTime(data.schedule.deliveryTime);
            updateNewsletterPrefs({ deliveryTime: data.schedule.deliveryTime });
          }
          if (typeof data.schedule.deliveryDayOfWeek === 'number') {
            setDeliveryDayOfWeek(data.schedule.deliveryDayOfWeek);
          }
          if (typeof data.schedule.deliveryDayOfMonth === 'number') {
            setDeliveryDayOfMonth(data.schedule.deliveryDayOfMonth);
          }
          if (typeof data.schedule.enabled === 'boolean') {
            setScheduleEnabled(data.schedule.enabled);
            updateNewsletterPrefs({ scheduleEnabled: data.schedule.enabled });
          }
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
  }, [targetEmail, isAuthenticated, updateNewsletterPrefs]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchScheduleAndLogs();
    }
  }, [fetchScheduleAndLogs, isAuthenticated]);

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

  const handleTimeChange = (newTime: string) => {
    setDeliveryTime(newTime);
    if (newTime && newTime.includes(':')) {
      updateNewsletterPrefs({ deliveryTime: newTime });
    }
  };

  // Save Automated Delivery Schedule directly from Newsletter page
  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    setSaveFeedback(null);

    const userTimezone =
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        : 'UTC';

    const payload = {
      email: targetEmail,
      frequency: newsletterPrefs.frequency,
      deliveryTime,
      deliveryDayOfWeek,
      deliveryDayOfMonth,
      categories: newsletterPrefs.categories,
      enabled: scheduleEnabled,
      timezone: userTimezone,
    };

    try {
      const res = await fetch('/api/newsletter/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const confirmedTime = data.schedule?.deliveryTime || deliveryTime;
        setDeliveryTime(confirmedTime);
        updateNewsletterPrefs({
          deliveryTime: confirmedTime,
          deliveryDayOfWeek: data.schedule?.deliveryDayOfWeek ?? deliveryDayOfWeek,
          deliveryDayOfMonth: data.schedule?.deliveryDayOfMonth ?? deliveryDayOfMonth,
          scheduledEmail: data.schedule?.email || targetEmail,
          scheduleEnabled: data.schedule?.enabled ?? scheduleEnabled,
          timezone: userTimezone,
        });
        setSaveFeedback('Automated delivery schedule saved and active!');
        setTimeout(() => setSaveFeedback(null), 5000);
        fetchScheduleAndLogs();
      } else {
        setSaveFeedback(data.error || 'Failed to save delivery schedule.');
      }
    } catch (err: any) {
      setSaveFeedback(err.message || 'Network error saving delivery schedule.');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  // Trigger Scheduled Dispatch Now (Manual Test of Scheduled Email)
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
          message: `Scheduled ${newsletterPrefs.frequency} briefing compiled with real-time intelligence and delivered to ${data.result?.deliveredTo}!`,
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

  // Calculate human friendly next scheduled time
  const getNextDeliveryDescription = () => {
    if (!scheduleEnabled || newsletterPrefs.frequency === 'disabled') {
      return 'Automation is currently paused.';
    }

    const [hh, mm] = (deliveryTime || '08:00').split(':').map(Number);
    const validHh = isNaN(hh) ? 8 : hh;
    const validMm = isNaN(mm) ? 0 : mm;
    const timeFormatted = `${((validHh % 12) || 12)}:${String(validMm).padStart(2, '0')} ${validHh >= 12 ? 'PM' : 'AM'}`;

    if (newsletterPrefs.frequency === 'daily') {
      return `Daily at ${timeFormatted}`;
    }
    if (newsletterPrefs.frequency === 'weekly') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return `Weekly on ${days[deliveryDayOfWeek ?? 1]} at ${timeFormatted}`;
    }
    if (newsletterPrefs.frequency === 'monthly') {
      const dayLabel = deliveryDayOfMonth === 1 ? '1st' : deliveryDayOfMonth === 15 ? '15th' : '28th';
      return `Monthly on the ${dayLabel} at ${timeFormatted}`;
    }
    return `At ${timeFormatted}`;
  };

  if (mounted && !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="py-20 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-cyan-100 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-center text-cyan-700 dark:text-cyan-400 shadow-xl shadow-cyan-500/10">
            <Mail className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 text-cyan-800 border border-cyan-300/80 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20">
              Personalized Intelligence Dispatch
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
              Sign In to Configure Newsletter & Alerts
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Tailor your automated delivery schedule, topical categories, anti-spam filters, and instant developer alerts to your verified email account.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <Link
              href="/signin?notice=auth_required&returnUrl=/newsletter"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-600/20 transition"
            >
              <span>Sign In to Newsletter</span>
            </Link>

            <Link
              href="/trending"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition"
            >
              Explore Trending
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
            Configure your automated digest schedule, preferred time of delivery, topical categories, and anti-spam controls.
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
                    <Mail className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    Recipient Email Address
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Enter the email address where your automated briefs and sample previews will be delivered.
                  </p>
                </div>
                {currentUser?.email && (
                  <button
                    onClick={() => setTargetEmail(currentUser.email)}
                    className="text-[11px] font-mono font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Frequency Selector */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    Digest Delivery Frequency
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Select your preferred cadence for automated email summaries.
                  </p>
                </div>
                <span className="text-xs font-mono text-cyan-700 dark:text-cyan-400 font-bold uppercase">
                  {newsletterPrefs.frequency}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['daily', 'weekly', 'monthly', 'disabled'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => updateNewsletterPrefs({ frequency: freq })}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold capitalize transition border text-left flex flex-col justify-between ${newsletterPrefs.frequency === freq
                        ? 'bg-cyan-600 dark:bg-cyan-500 text-white border-cyan-600 dark:border-cyan-500 shadow-md shadow-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/80 dark:bg-slate-900/30'
                      }`}
                  >
                    <span>{freq}</span>
                    <span className={`text-[10px] font-normal mt-0.5 ${newsletterPrefs.frequency === freq ? 'text-cyan-100 opacity-95' : 'text-slate-500 dark:text-slate-400'}`}>
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

            {/* Automated Summary Delivery Schedule & Timer Controls */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-cyan-500/40 dark:border-cyan-500/30 shadow-xl shadow-cyan-500/5 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-500 flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-base text-slate-900 dark:text-white">
                        Delivery Time & Automated Schedule
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        Live Auto-Engine
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                      Set the exact time of day when your summary should automatically arrive.
                    </p>
                  </div>
                </div>

                {/* Automation Active Toggle */}
                <label className="flex items-center gap-2.5 cursor-pointer text-xs self-start sm:self-auto bg-slate-50 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-slate-700 dark:text-slate-300 text-xs font-bold">
                    {scheduleEnabled ? 'Automation Active' : 'Automation Paused'}
                  </span>
                  <input
                    type="checkbox"
                    checked={scheduleEnabled}
                    onChange={(e) => {
                      setScheduleEnabled(e.target.checked);
                      updateNewsletterPrefs({ scheduleEnabled: e.target.checked });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Preferred Delivery Time Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Preferred Time of Day:
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
                  />

                  <div className="flex flex-wrap gap-1.5">
                    {TIME_PRESETS.map((preset) => (
                      <button
                        type="button"
                        key={preset.value}
                        onClick={() => handleTimeChange(preset.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${deliveryTime === preset.value
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40 font-bold shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                          }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Weekly Cadence: Day of Week Picker */}
              {newsletterPrefs.frequency === 'weekly' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Weekly Delivery Day:
                  </label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        type="button"
                        key={day.value}
                        onClick={() => {
                          setDeliveryDayOfWeek(day.value);
                          updateNewsletterPrefs({ deliveryDayOfWeek: day.value });
                        }}
                        className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${deliveryDayOfWeek === day.value
                            ? 'bg-purple-600 dark:bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 bg-slate-50/80 dark:bg-slate-900/30'
                          }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Monthly Cadence: Day of Month Picker */}
              {newsletterPrefs.frequency === 'monthly' && (
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Monthly Delivery Day:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {DAYS_OF_MONTH.map((d) => (
                      <button
                        type="button"
                        key={d.value}
                        onClick={() => {
                          setDeliveryDayOfMonth(d.value);
                          updateNewsletterPrefs({ deliveryDayOfMonth: d.value });
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition border text-center ${deliveryDayOfMonth === d.value
                            ? 'bg-purple-600 dark:bg-purple-600 text-white border-purple-600 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 bg-slate-50/80 dark:bg-slate-900/30'
                          }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Scheduled Status Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-3 h-3 rounded-full ${scheduleEnabled && newsletterPrefs.frequency !== 'disabled' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    <strong>Scheduled Delivery:</strong> {getNextDeliveryDescription()}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Save & Trigger */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  disabled={isSavingSchedule || !targetEmail}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {isSavingSchedule ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Schedule...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save & Activate Schedule</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleTriggerScheduledNow}
                  disabled={isTriggeringScheduled || !targetEmail}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition disabled:opacity-50"
                  title="Test the exact automated schedule dispatch right now"
                >
                  {isTriggeringScheduled ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span>Sending Scheduled Brief...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 text-purple-400" />
                      <span>Trigger Scheduled Dispatch Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendSample}
                  disabled={isSendingSample || !targetEmail}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                >
                  {isSendingSample ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <Send className="w-4 h-4 text-cyan-400" />
                  )}
                  <span>Send Sample Preview</span>
                </button>

                {saveFeedback && (
                  <span className="text-xs text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    {saveFeedback}
                  </span>
                )}
              </div>
            </div>

            {/* Topical Categories */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Included Newsletter Domains
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Only developments from selected domains will be compiled into your email.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {categories.map((cat) => {
                  const active = newsletterPrefs.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${active
                          ? 'bg-purple-600 dark:bg-purple-600 text-white border-purple-600 shadow-sm font-semibold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300 dark:hover:border-purple-500/40 bg-slate-50/80 dark:bg-slate-900/30'
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
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Smart Alert Throttles & Verification
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Guaranteed prevention of notification fatigue.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-xs">
                {/* Max alerts per day */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Maximum Alerts Per Day
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                      Strict hard ceiling for critical breaking signals.
                    </span>
                  </div>
                  <select
                    value={newsletterPrefs.maxAlertsPerDay}
                    onChange={(e) =>
                      updateNewsletterPrefs({ maxAlertsPerDay: Number(e.target.value) })
                    }
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 shadow-sm"
                  >
                    <option value={1}>1 Alert / Day (Recommended)</option>
                    <option value={2}>2 Alerts / Day</option>
                    <option value={3}>3 Alerts / Day</option>
                  </select>
                </div>

                {/* Quiet Hours */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block">
                      Quiet Hours (Do Not Disturb)
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px]">
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
                      className="w-16 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold text-slate-900 dark:text-slate-100 shadow-sm"
                    />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">to</span>
                    <input
                      type="text"
                      value={newsletterPrefs.quietHoursEnd}
                      onChange={(e) => updateNewsletterPrefs({ quietHoursEnd: e.target.value })}
                      className="w-16 px-2 py-1 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-bold text-slate-900 dark:text-slate-100 shadow-sm"
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
                  disabled={isSendingSample || !targetEmail}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-600/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>

              {/* Delivery Success / Status Box */}
              {sendResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-2 animate-fade-in ${!sendResult.success
                      ? 'bg-red-50 text-red-900 border-red-200 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-200'
                      : sendResult.mode === 'ethereal_preview'
                        ? 'bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-200'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-200'
                    }`}
                >
                  <div className="flex items-start gap-2">
                    {!sendResult.success ? (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    ) : sendResult.mode === 'ethereal_preview' ? (
                      <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
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
                        <div className="mt-2 p-2.5 rounded-lg bg-emerald-100/70 border border-emerald-300 text-emerald-950 dark:bg-emerald-500/15 dark:border-emerald-500/30 dark:text-emerald-100 flex items-start gap-2 text-[11px]">
                          <Info className="w-4 h-4 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <strong>Check Gmail Spam or Promotions.</strong> Because Resend sends via its shared test domain (<code className="font-mono text-[10px]">onboarding@resend.dev</code>), Gmail often places this preview into your <strong>Spam / Junk</strong> folder or <strong>Promotions tab</strong>.
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
            <div className="sticky top-24 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 shadow-xl p-6 text-xs font-sans space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-mono text-[10px] uppercase text-cyan-700 dark:text-cyan-400 font-bold flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  Live Compiled Email Preview
                </span>
                <span className="text-[10px] font-mono text-purple-700 dark:text-purple-400 font-bold uppercase">
                  {newsletterPrefs.frequency} Briefing
                </span>
              </div>

              {/* Email Content Container */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/60 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Logo variant="icon" size="xs" />
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1">
                      <span>Te</span>
                      <span className="bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Q</span>
                      <span>Vu {newsletterPrefs.frequency === 'weekly' ? 'Weekly' : newsletterPrefs.frequency === 'monthly' ? 'Monthly' : 'Daily'} Brief</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {/* Section 1: Top Developments */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-purple-700 dark:text-purple-400 font-bold mb-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                    1. Important Development &bull; {previewArticle.source.name}
                  </div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug line-clamp-2">
                    {previewArticle.title}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed line-clamp-2">
                    {previewArticle.summary}
                  </p>
                </div>

                {/* Section 2: Emerging Technologies */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-cyan-700 dark:text-cyan-400 font-bold mb-1 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
                    2. Trending Open-Source Velocity
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                    <span>{previewTech.name}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                      +{previewTech.growth}% Velocity
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {previewTech.description}
                  </p>
                </div>

                {/* Section 3: Research Spotlight */}
                <div>
                  <div className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    3. Research Worth Reading
                  </div>
                  <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {previewPaper.title}
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {previewPaper.summary}
                  </p>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-1">
                    {previewPaper.source} &bull; {previewPaper.authors[0]}
                  </span>
                </div>

                {/* Section 4: Target Recipient Notice */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
                  <span>Delivering to:</span>
                  <span className="text-cyan-700 dark:text-cyan-400 font-bold truncate max-w-[170px]">{targetEmail}</span>
                </div>
              </div>

              {/* Unsubscribe footer */}
              <div className="text-center pt-2 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
                <div>Automated schedule: <span className="text-cyan-700 dark:text-cyan-400 font-semibold">{getNextDeliveryDescription()}</span></div>
                <div className="text-slate-500">
                  Attribution: Content verified from official RSS feeds and APIs.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ALERT DISPATCH HISTORY */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Recent Dispatched Briefings & Delivery Audit Log
              </h2>
            </div>
            <button
              onClick={fetchScheduleAndLogs}
              disabled={isLoadingLogs}
              className="text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
              <span>Refresh Log</span>
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1629] overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-mono uppercase tracking-wider text-[10px] font-bold">
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
                    <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400 font-mono text-xs">
                      No email dispatches recorded yet. Use the buttons above to send a preview or activate automated schedule.
                    </td>
                  </tr>
                ) : (
                  deliveryLogs.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 font-mono">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {new Date(row.timestamp).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold capitalize text-cyan-700 dark:text-cyan-400">
                        {row.frequency}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                        {row.email}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white font-sans truncate max-w-[280px]">
                        {row.subject}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 uppercase text-[10px] font-medium">
                        {row.mode}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${row.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/80 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                              : row.status === 'simulated'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300/80 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                : 'bg-red-100 text-red-800 border border-red-300/80 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20'
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
