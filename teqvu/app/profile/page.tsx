'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Briefcase,
  Calendar,
  CheckCircle2,
  Shield,
  Eye,
  Bookmark,
  Save,
  Clock,
  Send,
  Play,
  RotateCw,
  Loader2,
  AlertCircle,
  HelpCircle,
  Info,
  ExternalLink,
  Sparkles,
  Lock,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAppStore } from '../../lib/store/useAppStore';
import { DeleteAccountModal } from '../../components/ui/DeleteAccountModal';
import { INTEREST_OPTIONS } from '../../lib/utils';
import type { Technology, DeliveryLog } from '../../lib/types';

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

export default function ProfilePage() {
  const {
    currentUser,
    isAuthenticated,
    updateUser,
    interests,
    toggleInterest,
    watchlistIds,
    bookmarkedIds,
    newsletterPrefs,
    updateNewsletterPrefs,
  } = useAppStore();

  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState(currentUser.name || '');
  const [occupation, setOccupation] = useState(currentUser.occupation || 'Software Engineer');
  const [saved, setSaved] = useState(false);
  const [techList, setTechList] = useState<Technology[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentUser.name) setName(currentUser.name);
    if (currentUser.occupation) setOccupation(currentUser.occupation);
  }, [currentUser.name, currentUser.occupation]);

  // Delivery schedule state
  const [targetEmail, setTargetEmail] = useState(
    newsletterPrefs.scheduledEmail || currentUser.email || ''
  );
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'disabled'>(
    newsletterPrefs.frequency || 'daily'
  );
  const [deliveryTime, setDeliveryTime] = useState(newsletterPrefs.deliveryTime || '08:00');
  const [deliveryDayOfWeek, setDeliveryDayOfWeek] = useState(newsletterPrefs.deliveryDayOfWeek ?? 1);
  const [deliveryDayOfMonth, setDeliveryDayOfMonth] = useState(newsletterPrefs.deliveryDayOfMonth ?? 1);
  const [scheduleEnabled, setScheduleEnabled] = useState(newsletterPrefs.scheduleEnabled ?? true);

  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [isSendingSample, setIsSendingSample] = useState(false);
  const [isTriggeringScheduled, setIsTriggeringScheduled] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Sync state if store hydrated from localStorage with user preferences
  useEffect(() => {
    if (newsletterPrefs.deliveryTime) {
      setDeliveryTime((prev) => (prev !== newsletterPrefs.deliveryTime ? newsletterPrefs.deliveryTime! : prev));
    }
    if (newsletterPrefs.frequency) {
      setFrequency((prev) => (prev !== newsletterPrefs.frequency ? newsletterPrefs.frequency! : prev));
    }
    if (newsletterPrefs.scheduledEmail) {
      setTargetEmail((prev) => (prev !== newsletterPrefs.scheduledEmail ? newsletterPrefs.scheduledEmail! : prev));
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
  }, [
    newsletterPrefs.deliveryTime,
    newsletterPrefs.frequency,
    newsletterPrefs.scheduledEmail,
    newsletterPrefs.deliveryDayOfWeek,
    newsletterPrefs.deliveryDayOfMonth,
    newsletterPrefs.scheduleEnabled,
  ]);

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

  // Sync with currentUser
  useEffect(() => {
    if (currentUser?.email && !targetEmail) {
      setTargetEmail(currentUser.email);
    }
  }, [currentUser?.email, targetEmail]);

  // Load trends for watchlist display
  useEffect(() => {
    fetch('/api/trends')
      .then((r) => r.json())
      .then((d) => {
        if (d.technologies && Array.isArray(d.technologies)) {
          setTechList(d.technologies);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch backend schedule & delivery logs
  const fetchScheduleAndLogs = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch(`/api/newsletter/schedule?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.schedule) {
          if (data.schedule.email) setTargetEmail(data.schedule.email);
          if (data.schedule.frequency) setFrequency(data.schedule.frequency);
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
  }, [updateNewsletterPrefs]);

  useEffect(() => {
    fetchScheduleAndLogs();
  }, [fetchScheduleAndLogs]);

  const occupations = ['Student', 'Software Engineer', 'Researcher', 'Academic', 'IT Professional', 'Other'];
  const watchedTechs = techList.filter((t) => watchlistIds.includes(t.id) || watchlistIds.includes(t.slug));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, occupation });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleTimeChange = (newTime: string) => {
    setDeliveryTime(newTime);
    if (newTime && newTime.includes(':')) {
      updateNewsletterPrefs({ deliveryTime: newTime });
    }
  };

  // Save Automated Delivery Schedule
  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    setSaveFeedback(null);

    const userTimezone =
      typeof Intl !== 'undefined'
        ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
        : 'UTC';

    const payload = {
      email: targetEmail,
      frequency,
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
          frequency: data.schedule?.frequency || frequency,
          deliveryTime: confirmedTime,
          deliveryDayOfWeek: data.schedule?.deliveryDayOfWeek ?? deliveryDayOfWeek,
          deliveryDayOfMonth: data.schedule?.deliveryDayOfMonth ?? deliveryDayOfMonth,
          scheduledEmail: data.schedule?.email || targetEmail,
          scheduleEnabled: data.schedule?.enabled ?? scheduleEnabled,
          timezone: userTimezone,
        });
        setSaveFeedback('Delivery schedule saved and active!');
        setTimeout(() => setSaveFeedback(null), 5000);

        // Refresh delivery logs only without risking stale GET overwriting the schedule
        try {
          const logsRes = await fetch(`/api/newsletter/schedule?_t=${Date.now()}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (logsRes.ok) {
            const logsData = await logsRes.json();
            if (Array.isArray(logsData.logs)) {
              setDeliveryLogs(logsData.logs);
            }
          }
        } catch {
          // ignore
        }
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
          message: `Scheduled ${frequency} briefing compiled with real-time intelligence and delivered to ${data.result?.deliveredTo}!`,
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
          frequency,
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

  // Calculate friendly next delivery time
  const getNextDeliveryDescription = () => {
    if (!scheduleEnabled || frequency === 'disabled') {
      return 'Automated email delivery is currently paused.';
    }

    const [hh, mm] = (deliveryTime || '08:00').split(':').map(Number);
    const validHh = isNaN(hh) ? 8 : hh;
    const validMm = isNaN(mm) ? 0 : mm;
    const timeFormatted = `${((validHh % 12) || 12)}:${String(validMm).padStart(2, '0')} ${validHh >= 12 ? 'PM' : 'AM'}`;

    if (frequency === 'daily') {
      return `Daily at ${timeFormatted} to ${targetEmail}`;
    }

    if (frequency === 'weekly') {
      const dayObj = DAYS_OF_WEEK.find((d) => d.value === deliveryDayOfWeek) || DAYS_OF_WEEK[0];
      return `Weekly every ${dayObj.name} at ${timeFormatted} to ${targetEmail}`;
    }

    if (frequency === 'monthly') {
      const dayLabel = deliveryDayOfMonth === 1 ? '1st' : deliveryDayOfMonth === 15 ? '15th' : '28th';
      return `Monthly on the ${dayLabel} at ${timeFormatted} to ${targetEmail}`;
    }

    return `At ${timeFormatted} to ${targetEmail}`;
  };

  if (mounted && !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Authentication Required
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
              Account Profile Protected
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Please sign in to access your intelligence profile, professional role, and automated newsletter dispatch schedule.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <Link
              href="/signin?notice=auth_required&returnUrl=/profile"
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-lg shadow-cyan-500/20 transition"
            >
              <span>Sign In to Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/home"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-white"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
            <User className="w-4 h-4" />
            <span>Developer Profile & Automation Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Account & Intelligence Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your credentials, professional role, automated summary email timers, and customized topic tags.
          </p>
        </div>

        {/* 1. Profile Details Form */}
        <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
          <div className="flex items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-500/20">
              {name.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{name}</h2>
              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span className="text-purple-400 font-mono font-bold capitalize">{currentUser.role} Role</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Occupation / Role
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
              >
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {saved ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
              </span>
            ) : <div />}

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition shadow-md shadow-cyan-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>

        {/* 2. AUTOMATED EMAIL DELIVERY SCHEDULE & TIMER */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0f1629] border border-cyan-500/40 dark:border-cyan-500/30 shadow-xl shadow-cyan-500/5 space-y-6">
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
                    Live Dispatch Engine
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recipient Email Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Recipient Email Address
                </label>
                {currentUser?.email && (
                  <button
                    type="button"
                    onClick={() => {
                      setTargetEmail(currentUser.email);
                      updateNewsletterPrefs({ scheduledEmail: currentUser.email });
                    }}
                    className="text-[11px] font-mono text-cyan-500 hover:underline"
                  >
                    Use Profile Email
                  </button>
                )}
              </div>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => {
                  setTargetEmail(e.target.value);
                  updateNewsletterPrefs({ scheduledEmail: e.target.value });
                }}
                placeholder="your-email@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              <p className="text-[11px] text-slate-400">
                Your briefing summaries will be sent to this destination.
              </p>
            </div>

            {/* Cadence Frequency Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Update Cadence
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                  <button
                    type="button"
                    key={freq}
                    onClick={() => {
                      setFrequency(freq);
                      updateNewsletterPrefs({ frequency: freq });
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize transition border text-center ${frequency === freq
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                      }`}
                  >
                    <div>{freq}</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">
                      {freq === 'daily' ? '24h signals' : freq === 'weekly' ? '7-day digest' : '30-day radar'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preferred Delivery Time Selector */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white border border-transparent'
                      }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Weekly Cadence: Day of Week Picker */}
          {frequency === 'weekly' && (
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
                        ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-400'
                      }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Cadence: Day of Month Picker */}
          {frequency === 'monthly' && (
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
                        ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-purple-400'
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
              <div className={`w-3 h-3 rounded-full ${scheduleEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
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
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
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
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition disabled:opacity-50"
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
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
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

          {/* Feedback Card after test dispatch */}
          {sendResult && (
            <div
              className={`p-4 rounded-xl border text-xs space-y-2 animate-fade-in ${!sendResult.success
                  ? 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                }`}
            >
              <div className="flex items-start gap-2">
                {!sendResult.success ? (
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="space-y-1.5 w-full">
                  <div className="font-bold text-sm">
                    {!sendResult.success
                      ? 'Dispatch Error'
                      : `Email Delivered to ${sendResult.deliveredTo}`}
                  </div>
                  <p className="leading-relaxed opacity-90">{sendResult.message || sendResult.error}</p>

                  {sendResult.success && sendResult.mode === 'resend' && (
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-100 flex items-start gap-2 text-[11px]">
                      <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong>Inbox Verification:</strong> If this email does not appear in your Primary inbox, please check your <strong>Spam / Junk</strong> folder or <strong>Promotions tab</strong>.
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

          {/* Audit Log Table */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Recent Automated & Dispatched Deliveries Log
              </span>
              <button
                type="button"
                onClick={fetchScheduleAndLogs}
                disabled={isLoadingLogs}
                className="text-xs font-mono text-cyan-500 hover:text-cyan-400 flex items-center gap-1 transition"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isLoadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh Log</span>
              </button>
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/60 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Recipient</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                  {deliveryLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400">
                        No dispatches recorded yet. Use the buttons above to test delivery.
                      </td>
                    </tr>
                  ) : (
                    deliveryLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-white dark:hover:bg-slate-900/60">
                        <td className="py-2.5 px-3 text-slate-400">
                          {new Date(log.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 font-bold capitalize text-cyan-400">
                          {log.frequency}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 truncate max-w-[130px]">
                          {log.email}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white font-sans truncate max-w-[200px]">
                          {log.subject}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${log.status === 'delivered'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 3. Interests Editor */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monitored Technology Domains ({interests.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any domain tag to customize the topics included in your automated summary email.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {INTEREST_OPTIONS.map((item) => {
              const selected = interests.includes(item.id);
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => toggleInterest(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${selected
                      ? 'bg-cyan-500 text-white border-cyan-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-500'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Quick Stats Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/watchlist"
            className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  Followed Technologies
                </span>
                <span className="text-xs text-slate-400">{watchedTechs.length} technologies tracked</span>
              </div>
            </div>
            <span className="text-xs font-mono text-cyan-400">View →</span>
          </Link>

          <Link
            href="/bookmarks"
            className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 hover:border-cyan-500/40 transition flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-5 h-5 text-purple-400" />
              <div>
                <span className="font-bold text-sm text-slate-900 dark:text-white block">
                  Saved Bookmarks
                </span>
                <span className="text-xs text-slate-400">{bookmarkedIds.length} items saved</span>
              </div>
            </div>
            <span className="text-xs font-mono text-purple-400">View →</span>
          </Link>
        </div>

        {/* 5. Danger Zone: Permanent Account Deletion */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#0f1629] border border-red-500/30 dark:border-red-500/20 shadow-xl shadow-red-500/5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0 mt-0.5">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Danger Zone: Delete Account
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                    Irreversible
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl leading-relaxed">
                  Permanently erase your TeQVu account, personalized briefings, monitored technologies, and bookmarks. A system-generated verification word is required to confirm.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold transition flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Account Deletion Modal */}
        <DeleteAccountModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      </div>
    </DashboardLayout>
  );
}
