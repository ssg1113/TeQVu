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
  Play,
  Loader2,
  Sparkles,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAppStore } from '../../lib/store/useAppStore';
import { INTEREST_OPTIONS } from '../../lib/utils';
import type { Technology } from '../../lib/types';

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
    updateUser,
    interests,
    toggleInterest,
    watchlistIds,
    bookmarkedIds,
    newsletterPrefs,
    updateNewsletterPrefs,
  } = useAppStore();

  const [name, setName] = useState(currentUser.name);
  const [occupation, setOccupation] = useState(currentUser.occupation);
  const [saved, setSaved] = useState(false);
  const [techList, setTechList] = useState<Technology[]>([]);

  // Automated Email Schedule Settings State
  const [scheduledEmail, setScheduledEmail] = useState(
    newsletterPrefs.scheduledEmail || currentUser?.email || 'sgdesilva1113@gmail.com'
  );
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'disabled'>(
    newsletterPrefs.frequency || 'daily'
  );
  const [deliveryTime, setDeliveryTime] = useState(newsletterPrefs.deliveryTime || '08:30');
  const [deliveryDayOfWeek, setDeliveryDayOfWeek] = useState(newsletterPrefs.deliveryDayOfWeek ?? 1);
  const [deliveryDayOfMonth, setDeliveryDayOfMonth] = useState(newsletterPrefs.deliveryDayOfMonth ?? 1);
  const [scheduleEnabled, setScheduleEnabled] = useState(newsletterPrefs.scheduleEnabled ?? true);

  const [isSavingSchedule, setIsSavingSchedule] = useState(false);
  const [saveScheduleFeedback, setSaveScheduleFeedback] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerFeedback, setTriggerFeedback] = useState<{
    success: boolean;
    message: string;
    previewUrl?: string;
  } | null>(null);

  // Load tech list for watched techs count
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

  // Fetch server schedule on mount
  useEffect(() => {
    async function loadSchedule() {
      try {
        const res = await fetch('/api/newsletter/schedule');
        if (res.ok) {
          const data = await res.json();
          if (data.schedule) {
            if (data.schedule.email) setScheduledEmail(data.schedule.email);
            if (data.schedule.frequency) setFrequency(data.schedule.frequency);
            if (data.schedule.deliveryTime) setDeliveryTime(data.schedule.deliveryTime);
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
        }
      } catch (err) {
        console.warn('Could not load server schedule:', err);
      }
    }
    loadSchedule();
  }, []);

  const occupations = ['Student', 'Software Engineer', 'Researcher', 'Academic', 'IT Professional', 'Other'];
  const watchedTechs = techList.filter((t) => watchlistIds.includes(t.id) || watchlistIds.includes(t.slug));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, occupation });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveSchedule = async () => {
    setIsSavingSchedule(true);
    setSaveScheduleFeedback(null);

    const payload = {
      email: scheduledEmail,
      frequency,
      deliveryTime,
      deliveryDayOfWeek,
      deliveryDayOfMonth,
      categories: newsletterPrefs.categories,
      enabled: scheduleEnabled,
    };

    try {
      const res = await fetch('/api/newsletter/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        updateNewsletterPrefs({
          frequency,
          deliveryTime,
          deliveryDayOfWeek,
          deliveryDayOfMonth,
          scheduledEmail,
          scheduleEnabled,
        });
        setSaveScheduleFeedback('Automated schedule saved! Dispatches are active.');
        setTimeout(() => setSaveScheduleFeedback(null), 5000);
      } else {
        setSaveScheduleFeedback(data.error || 'Failed to save delivery schedule.');
      }
    } catch (err: any) {
      setSaveScheduleFeedback(err.message || 'Network error saving delivery schedule.');
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleTriggerScheduledNow = async () => {
    setIsTriggering(true);
    setTriggerFeedback(null);

    try {
      const res = await fetch('/api/newsletter/schedule', {
        method: 'PUT',
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTriggerFeedback({
          success: true,
          message: `Scheduled ${frequency} digest successfully compiled with real-time data and delivered to ${data.result?.deliveredTo}!`,
          previewUrl: data.result?.previewUrl,
        });
      } else {
        setTriggerFeedback({
          success: false,
          message: data.error || 'Failed to trigger scheduled dispatch.',
        });
      }
    } catch (err: any) {
      setTriggerFeedback({
        success: false,
        message: err.message || 'Network error triggering scheduled dispatch.',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const getNextDeliveryDescription = () => {
    if (!scheduleEnabled || frequency === 'disabled') {
      return 'Automated scheduled delivery is currently paused.';
    }

    const [hh, mm] = deliveryTime.split(':').map(Number);
    const timeFormatted = `${(hh % 12) || 12}:${String(mm || 0).padStart(2, '0')} ${hh >= 12 ? 'PM' : 'AM'}`;

    if (frequency === 'daily') {
      return `Daily at ${timeFormatted} to ${scheduledEmail}`;
    }

    if (frequency === 'weekly') {
      const dayObj = DAYS_OF_WEEK.find((d) => d.value === deliveryDayOfWeek) || DAYS_OF_WEEK[0];
      return `Weekly every ${dayObj.name} at ${timeFormatted} to ${scheduledEmail}`;
    }

    if (frequency === 'monthly') {
      const dayLabel = deliveryDayOfMonth === 1 ? '1st' : deliveryDayOfMonth === 15 ? '15th' : '28th';
      return `Monthly on the ${dayLabel} at ${timeFormatted} to ${scheduledEmail}`;
    }

    return `At ${timeFormatted} to ${scheduledEmail}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-500 font-semibold mb-1">
            <User className="w-4 h-4" />
            <span>Developer Profile</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Account & Intelligence Profile
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your credentials, professional role, topic tags, and automated email delivery schedules.
          </p>
        </div>

        {/* Profile Details Form */}
        <form
          onSubmit={handleSaveProfile}
          className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6"
        >
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
            ) : (
              <div />
            )}

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 transition shadow-md shadow-cyan-500/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </form>

        {/* AUTOMATED EMAIL DIGEST & SCHEDULE TIMER CARD (IN USER PROFILE) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-cyan-500/40 dark:border-cyan-500/40 shadow-lg shadow-cyan-500/5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Automated Email Digest & Delivery Schedule
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/30">
                    Auto-Dispatch
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Set a daily, weekly, or monthly delivery time to receive real-time tech summaries automatically in your inbox.
                </p>
              </div>
            </div>

            {/* Toggle Automation Active */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs self-start sm:self-auto">
              <span className="text-slate-400 text-xs font-semibold">
                {scheduleEnabled ? 'Automation Active' : 'Automation Paused'}
              </span>
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-cyan-500"></div>
            </label>
          </div>

          <div className="space-y-5">
            {/* Recipient Email Address Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Recipient Email Address
                </label>
                {currentUser?.email && (
                  <button
                    type="button"
                    onClick={() => setScheduledEmail(currentUser.email)}
                    className="text-[11px] font-mono text-cyan-500 hover:underline"
                  >
                    Use Account Email ({currentUser.email})
                  </button>
                )}
              </div>
              <input
                type="email"
                value={scheduledEmail}
                onChange={(e) => setScheduledEmail(e.target.value)}
                placeholder="your-email@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Frequency Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Delivery Cadence / Frequency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['daily', 'weekly', 'monthly', 'disabled'] as const).map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => setFrequency(freq)}
                    className={`py-2.5 px-3.5 rounded-xl text-xs font-bold capitalize transition border text-left flex flex-col justify-between ${
                      frequency === freq
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                    }`}
                  >
                    <span>{freq}</span>
                    <span className="text-[10px] font-normal mt-0.5 opacity-80">
                      {freq === 'daily'
                        ? '24h real-time signals'
                        : freq === 'weekly'
                        ? '7-day digest'
                        : freq === 'monthly'
                        ? '30-day macro radar'
                        : 'Disabled'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time of Day Picker */}
            {frequency !== 'disabled' && (
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Preferred Delivery Time of Day:
                </label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <input
                    type="time"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />

                  {/* Quick Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {TIME_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setDeliveryTime(preset.value)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono transition ${
                          deliveryTime === preset.value
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
            )}

            {/* Weekly Day of Week Picker */}
            {frequency === 'weekly' && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Day of the Week:
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => setDeliveryDayOfWeek(day.value)}
                      className={`py-2 rounded-xl text-xs font-mono font-bold transition border ${
                        deliveryDayOfWeek === day.value
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

            {/* Monthly Day of Month Picker */}
            {frequency === 'monthly' && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Day of the Month:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DAYS_OF_MONTH.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => setDeliveryDayOfMonth(d.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-mono font-bold transition border text-center ${
                        deliveryDayOfMonth === d.value
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
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    scheduleEnabled && frequency !== 'disabled'
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-slate-400'
                  }`}
                />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  <strong>Scheduled Delivery:</strong> {getNextDeliveryDescription()}
                </span>
              </div>
              <Link
                href="/newsletter"
                className="text-[11px] font-mono text-cyan-500 hover:underline flex items-center gap-1"
              >
                <span>Preview Briefing</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            {/* Action Buttons: Save Schedule & Trigger Test */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveSchedule}
                disabled={isSavingSchedule || !scheduledEmail}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 transition shadow-sm disabled:opacity-50"
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
                disabled={isTriggering || isSavingSchedule || !scheduledEmail}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition disabled:opacity-50"
                title="Test the automated email delivery right now"
              >
                {isTriggering ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Dispatching Test...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-purple-400" />
                    <span>Trigger Scheduled Dispatch Now</span>
                  </>
                )}
              </button>

              {saveScheduleFeedback && (
                <span className="text-xs text-emerald-500 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {saveScheduleFeedback}
                </span>
              )}
            </div>

            {/* Trigger Feedback Banner */}
            {triggerFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  triggerFeedback.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200'
                    : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-200'
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {triggerFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>{triggerFeedback.success ? 'Dispatch Dispatched' : 'Dispatch Failed'}</span>
                </div>
                <p className="opacity-90">{triggerFeedback.message}</p>
                {triggerFeedback.previewUrl && (
                  <div className="pt-1">
                    <a
                      href={triggerFeedback.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-500 hover:underline inline-flex items-center gap-1 text-[11px] font-mono"
                    >
                      <span>Open Preview in Web Mailbox</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interests Editor */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monitored Technology Domains ({interests.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any domain tag to toggle your feed and automated newsletter inclusion.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {INTEREST_OPTIONS.map((item) => {
              const selected = interests.includes(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleInterest(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    selected
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

        {/* Quick Stats Links */}
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
      </div>
    </DashboardLayout>
  );
}
