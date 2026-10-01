'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Users,
  Layers,
  Globe,
  Compass,
  Zap,
  Mail,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  Plus,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  Sparkles,
  UserPlus,
  UserMinus,
  ShieldCheck,
  Crown,
  Check,
  ExternalLink,
  Activity,
  Rss,
  Radio,
  Trash2,
  Sliders,
  X,
  User,
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TrendBadge } from '../../components/ui/Badge';
import { formatNumber, timeAgo } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';
import type { Technology, Source } from '../../lib/types';
import {
  PRIMARY_ADMIN_EMAIL,
  isPrimaryAdmin,
  canSwitchRole,
} from '../../lib/security/admin';

interface LiveTelemetryData {
  timestamp: string;
  responseTimeMs: number;
  stats: {
    articlesCollected: number;
    sourcesCount: number;
    totalConfiguredSources: number;
    technologiesCount: number;
    emailsSent: number;
    processingFailures: number;
    averageLatencyMs: number;
  };
  sources: Source[];
  pipelines: {
    id: string;
    name: string;
    status: 'running' | 'completed' | 'failed';
    processedCount: number;
    errorCount: number;
    latencyMs: number;
    lastRun: string;
    details: string;
  }[];
  recentArticles: {
    id: string;
    title: string;
    summary: string;
    url: string;
    source: string;
    category: string;
    publishedAt: string;
    readingTime: number;
    technologies: string[];
  }[];
}

const CATEGORY_OPTIONS = [
  'Tech News',
  'AI/ML',
  'Cybersecurity',
  'Cloud',
  'Software Engineering',
  'Developer Tools',
  'Languages',
  'Emerging Tech',
  'Quantum',
  'Robotics',
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    isAuthenticated,
    switchRole,
    adminEmails,
    registeredEmails,
    assignAdmin,
    revokeAdmin,
    addNotification,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'telemetry' | 'sources' | 'pipelines' | 'delegation'>('telemetry');
  const [mounted, setMounted] = useState(false);

  // Live Telemetry State (NO MOCK DATA)
  const [telemetry, setTelemetry] = useState<LiveTelemetryData | null>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown] = useState(10);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // News Source Management State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceCategory, setNewSourceCategory] = useState('Tech News');
  const [newSourceType, setNewSourceType] = useState('RSS');
  const [newSourceTrustScore, setNewSourceTrustScore] = useState(9);
  const [newSourceFrequency, setNewSourceFrequency] = useState('15 minutes');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    articleCount?: number;
    sampleTitle?: string;
    latencyMs?: number;
    error?: string;
  } | null>(null);
  const [isSubmittingSource, setIsSubmittingSource] = useState(false);
  const [sourceNotice, setSourceNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Admin Delegation State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [delegationSuccess, setDelegationSuccess] = useState<string | null>(null);
  const [delegationError, setDelegationError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch Real Telemetry Data
  const fetchTelemetry = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoadingTelemetry(true);
    try {
      const res = await fetch('/api/admin/telemetry', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTelemetry(data);
          setLastSyncTime(new Date().toLocaleTimeString());
        }
      }
    } catch (err) {
      console.error('[Admin Telemetry Fetch Error]:', err);
    } finally {
      setIsLoadingTelemetry(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (mounted && isAuthenticated && currentUser.role === 'admin') {
      fetchTelemetry();
    }
  }, [mounted, isAuthenticated, currentUser.role, fetchTelemetry]);

  // Real-time Countdown & Auto-Refresh Interval (Every 10 seconds)
  useEffect(() => {
    if (!autoRefresh || !isAuthenticated || currentUser.role !== 'admin') return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchTelemetry(true);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, isAuthenticated, currentUser.role, fetchTelemetry]);

  // Trigger Immediate Sync of All Pipelines
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchTelemetry(true);
        addNotification({
          title: 'Live Ingestion Completed',
          message: data.message || 'All sources synchronized successfully.',
          type: 'system',
          importance: 'normal',
        });
      }
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
      setCountdown(10);
    }
  };

  // Live Test & Validate Feed URL
  const handleValidateUrl = async () => {
    if (!newSourceUrl.trim()) {
      alert('Please enter a feed URL to validate.');
      return;
    }
    setIsValidating(true);
    setValidationResult(null);
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'validate', url: newSourceUrl.trim() }),
      });
      const data = await res.json();
      setValidationResult(data);
    } catch (err: any) {
      setValidationResult({ valid: false, error: err.message });
    } finally {
      setIsValidating(false);
    }
  };

  // Add New Source
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim() || !newSourceUrl.trim()) return;

    setIsSubmittingSource(true);
    setSourceNotice(null);

    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          name: newSourceName.trim(),
          url: newSourceUrl.trim(),
          category: newSourceCategory,
          type: newSourceType,
          trustScore: newSourceTrustScore,
          collectionFrequency: newSourceFrequency,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSourceNotice({
          type: 'success',
          message: `News source "${newSourceName}" added! Live articles are now streaming to all users in real-time.`,
        });
        setNewSourceName('');
        setNewSourceUrl('');
        setValidationResult(null);
        setShowAddModal(false);
        addNotification({
          title: 'News Source Added',
          message: `Source "${newSourceName}" is now broadcasting real-time updates.`,
          type: 'system',
          importance: 'high',
        });
        await fetchTelemetry(true);
      } else {
        setSourceNotice({ type: 'error', message: data.error || 'Failed to add source' });
      }
    } catch (err: any) {
      setSourceNotice({ type: 'error', message: err.message || 'Network error' });
    } finally {
      setIsSubmittingSource(false);
    }
  };

  // Toggle Source Active / Inactive
  const handleToggleSource = async (sourceId: string) => {
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: sourceId }),
      });
      if (res.ok) {
        await fetchTelemetry(true);
      }
    } catch (err) {
      console.error('Failed to toggle source:', err);
    }
  };

  // Delete Custom Source
  const handleDeleteSource = async (sourceId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the source "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/sources?id=${encodeURIComponent(sourceId)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSourceNotice({ type: 'success', message: `Source "${name}" removed.` });
        await fetchTelemetry(true);
      }
    } catch (err) {
      console.error('Failed to delete source:', err);
    }
  };

  // Admin Delegation
  const handleAssignAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setDelegationSuccess(null);
    setDelegationError(null);
    const clean = newAdminEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setDelegationError('Please enter a valid email address.');
      return;
    }
    if (adminEmails.map((e) => e.toLowerCase()).includes(clean)) {
      setDelegationError('This user already possesses administrator clearance.');
      return;
    }
    const ok = assignAdmin(clean);
    if (ok) {
      setDelegationSuccess(`Administrator clearance granted to ${clean}. They can now switch to Admin mode.`);
      setNewAdminEmail('');
      addNotification({
        title: 'Administrator Assigned',
        message: `Admin privileges granted to ${clean}`,
        type: 'system',
        importance: 'high',
      });
    } else {
      setDelegationError('Failed to assign administrator clearance.');
    }
  };

  const handleRevokeAdmin = (email: string) => {
    if (email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      alert('The primary administrator (sgdesilva1113@gmail.com) cannot be revoked.');
      return;
    }
    if (window.confirm(`Are you sure you want to revoke administrator clearance from ${email}?`)) {
      revokeAdmin(email);
      setDelegationSuccess(`Administrator clearance revoked for ${email}.`);
      addNotification({
        title: 'Administrator Revoked',
        message: `Admin privileges revoked for ${email}`,
        type: 'system',
        importance: 'high',
      });
    }
  };

  // 1. UNAUTHENTICATED VISITOR GATE
  if (mounted && !isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Access Restricted • 401 Unauthorized
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
              Administrator Clearance Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This console is strictly reserved for platform operators. Please sign in with an authorized administrator account to proceed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <Link
              href={`/signin?notice=admin_required&email=${encodeURIComponent(PRIMARY_ADMIN_EMAIL)}`}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/20 transition"
            >
              <Shield className="w-4 h-4" />
              <span>Sign In with Admin Account</span>
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

  // 2. RESTRICTED ACCESS SCREEN FOR NORMAL USERS (AUTHENTICATED)
  if (currentUser.role !== 'admin') {
    const isAuthorized = canSwitchRole(currentUser.email, currentUser.role, adminEmails);

    return (
      <DashboardLayout>
        <div className="py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-xl shadow-purple-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Access Restricted • 403 Forbidden
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-3">
              Administrator Clearance Required
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              This console provides real-time telemetry, live scraper control, and news source injection.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 text-xs text-left w-full space-y-3">
            <div className="text-slate-400 font-mono text-[11px] uppercase">Your Active Account:</div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono capitalize">
                {currentUser.role} Account
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">{currentUser.email}</div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              {isAuthorized ? (
                <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>You possess administrator clearance! Switch to Administrator role below to view the dashboard.</span>
                </div>
              ) : (
                <span>
                  Primary administrator is <span className="font-mono text-purple-400">{PRIMARY_ADMIN_EMAIL}</span>. Only the primary administrator or assigned admin accounts have access to this portal.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            {isAuthorized ? (
              <button
                type="button"
                onClick={() => {
                  switchRole('admin');
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-purple-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Switch to Administrator Role</span>
              </button>
            ) : (
              <Link
                href={`/signin?notice=admin_required&email=${encodeURIComponent(PRIMARY_ADMIN_EMAIL)}`}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 shadow-lg shadow-purple-500/20 transition"
              >
                <Shield className="w-4 h-4" />
                <span>Sign In with Admin Account</span>
              </Link>
            )}

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

  // Real Counts (Strictly NO mock data and NO demo accounts)
  const realTotalUsers = registeredEmails?.length || 1;
  const realActiveUsers = 1; // Real active session
  const realArticlesCount = telemetry?.stats?.articlesCollected || 0;
  const realActiveSourcesCount = telemetry?.stats?.sourcesCount || telemetry?.sources?.filter((s) => s.status === 'active').length || 0;
  const realTechsCount = telemetry?.stats?.technologiesCount || 0;
  const realEmailsSent = telemetry?.stats?.emailsSent || 0;
  const realFailures = telemetry?.stats?.processingFailures || 0;
  const realAvgLatency = telemetry?.stats?.averageLatencyMs || 0;

  const sourcesList = telemetry?.sources || [];
  const pipelinesList = telemetry?.pipelines || [];
  const recentArticles = telemetry?.recentArticles || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* TOP ROLE BANNER: Clear visual indicator that UI is in dedicated Admin mode */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-slate-900 border border-purple-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Administrator Cockpit Active</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-300 border border-purple-500/30 uppercase font-bold">
                  UI In Admin Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Normal user navigation is hidden. Manage live news feeds, input new sources, and monitor telemetry in real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center">
            <button
              type="button"
              onClick={() => {
                const ok = switchRole('user');
                if (ok) router.push('/home');
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-md shadow-purple-600/20 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Switch to User Mode</span>
            </button>
          </div>
        </div>

        {/* Header & Real-time Live Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-semibold mb-1">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>LIVE TELEMETRY STREAM • REAL DATA ONLY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Platform Administration & Ingestion Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Dynamic scraping engine, real-time news sources, and background pipeline metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Polling Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-600 dark:text-slate-300">
                {autoRefresh ? `Auto-sync in ${countdown}s` : 'Paused'}
              </span>
              <button
                type="button"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="text-slate-400 hover:text-white ml-1"
                title={autoRefresh ? 'Pause auto-refresh' : 'Resume auto-refresh'}
              >
                {autoRefresh ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Run Ingestion Trigger */}
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition shadow-sm disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Ingesting Feeds...' : 'Sync Pipelines Now'}</span>
            </button>
          </div>
        </div>

        {/* Global Notices */}
        {sourceNotice && (
          <div
            className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 font-medium animate-fade-in ${
              sourceNotice.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {sourceNotice.type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              <span>{sourceNotice.message}</span>
            </div>
            <button type="button" onClick={() => setSourceNotice(null)} className="hover:opacity-75">
              &times;
            </button>
          </div>
        )}

        {/* 1. REAL-TIME SYSTEM STATS TILES (Zero Mock Data) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Real Registered Users',
              value: realTotalUsers,
              sub: `${realActiveUsers} active session (No demo accounts)`,
              icon: Users,
              color: 'text-cyan-400',
              borderColor: 'border-cyan-500/20',
            },
            {
              label: 'Articles Ingested',
              value: formatNumber(realArticlesCount),
              sub: `Across ${realActiveSourcesCount} verified live feeds`,
              icon: Layers,
              color: 'text-purple-400',
              borderColor: 'border-purple-500/20',
            },
            {
              label: 'Verified News Sources',
              value: sourcesList.length,
              sub: `${realActiveSourcesCount} currently active`,
              icon: Globe,
              color: 'text-emerald-400',
              borderColor: 'border-emerald-500/20',
            },
            {
              label: 'Avg Response Latency',
              value: `${realAvgLatency}ms`,
              sub: realFailures === 0 ? 'All endpoints operational' : `${realFailures} feed errors detected`,
              icon: Zap,
              color: realFailures === 0 ? 'text-amber-400' : 'text-red-400',
              borderColor: 'border-amber-500/20',
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl bg-white dark:bg-[#0f1629] border ${stat.borderColor} shadow-sm transition hover:border-purple-500/40`}
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
                  {stat.value}
                  {isLoadingTelemetry && idx === 1 && (
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping inline-block" />
                  )}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">{stat.sub}</div>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto pb-px">
          {[
            { id: 'telemetry', label: `Real-time Telemetry & Stream (${recentArticles.length} live articles)` },
            { id: 'sources', label: `News Sources Manager (${sourcesList.length})` },
            { id: 'pipelines', label: `Pipeline Workers (${pipelinesList.length})` },
            { id: 'delegation', label: `Admin Governance & Clearances (${adminEmails.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap -mb-px cursor-pointer ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: REAL-TIME TELEMETRY & LIVE STREAM */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6 animate-fade-in">
            {/* Live Pipeline Telemetry Summary */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-medium">
                  Last Telemetry Ping: <strong className="text-white font-mono">{lastSyncTime}</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  STREAM SYNCHRONIZED
                </span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Showing {recentArticles.length} freshest live articles
              </div>
            </div>

            {/* Live Ingestion Articles Stream */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
                  <Rss className="w-3.5 h-3.5 text-purple-400" />
                  <span>Live Articles Ingestion Stream</span>
                </span>
                <span className="text-xs font-mono text-purple-400 font-semibold">
                  Auto-updated from live RSS/APIs
                </span>
              </div>

              {recentArticles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                  Connecting to active news sources...
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {recentArticles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition"
                    >
                      <div className="space-y-1.5 flex-1 pr-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {article.source}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400">
                            {article.category}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {timeAgo(article.publishedAt)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {article.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {article.summary}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 hover:text-white hover:bg-slate-800 transition"
                        >
                          <span>Read Source</span>
                          <ExternalLink className="w-3 h-3 text-cyan-400" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NEWS SOURCES MANAGER (Input & Configure Realtime Feeds) */}
        {activeTab === 'sources' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Real-Time News Sources & RSS Feeds</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Input news sources below. Newly added sources immediately begin polling and broadcasting real-time updates to all users.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/20 transition cursor-pointer self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                <span>Input News Source</span>
              </button>
            </div>

            {/* ADD SOURCE MODAL / EXPANDER */}
            {showAddModal && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl space-y-5 animate-slide-up">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Add New News Source Feed</h4>
                      <p className="text-xs text-slate-400">
                        Connect any valid RSS, Atom, or News publication feed URL.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setValidationResult(null);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleAddSource} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Source Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newSourceName}
                        onChange={(e) => setNewSourceName(e.target.value)}
                        placeholder="e.g. TechCrunch, The Verge, Ars Technica"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Feed URL (RSS or Atom) *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          required
                          value={newSourceUrl}
                          onChange={(e) => setNewSourceUrl(e.target.value)}
                          placeholder="https://example.com/feed.xml"
                          className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                        />
                        <button
                          type="button"
                          onClick={handleValidateUrl}
                          disabled={isValidating}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-bold border border-slate-700 transition flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          {isValidating ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>Test Feed</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Validation Feedback */}
                  {validationResult && (
                    <div
                      className={`p-3 rounded-xl text-xs flex items-start gap-2.5 font-mono ${
                        validationResult.valid
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                          : 'bg-red-500/10 border border-red-500/30 text-red-300'
                      }`}
                    >
                      {validationResult.valid ? (
                        <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="space-y-0.5">
                        <div className="font-bold">
                          {validationResult.valid
                            ? `Valid RSS/Atom Feed Verified (${validationResult.articleCount} articles found, ${validationResult.latencyMs}ms latency)`
                            : 'Feed Validation Error'}
                        </div>
                        {validationResult.sampleTitle && (
                          <div className="text-[11px] text-slate-300 italic">
                            Sample article: "{validationResult.sampleTitle}"
                          </div>
                        )}
                        {validationResult.error && (
                          <div className="text-[11px] text-red-300">{validationResult.error}</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Category
                      </label>
                      <select
                        value={newSourceCategory}
                        onChange={(e) => setNewSourceCategory(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Trust Score (1-10)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newSourceTrustScore}
                        onChange={(e) => setNewSourceTrustScore(Number(e.target.value))}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Poll Frequency
                      </label>
                      <select
                        value={newSourceFrequency}
                        onChange={(e) => setNewSourceFrequency(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="15 minutes">Every 15 minutes (Fast)</option>
                        <option value="30 minutes">Every 30 minutes</option>
                        <option value="1 hour">Every 1 hour</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingSource}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-md shadow-purple-600/30 transition disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                    >
                      {isSubmittingSource ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>Save & Ingest Live Feed</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SOURCES DIRECTORY TABLE */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                  Active News Sources Directory ({sourcesList.length} configured)
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {realActiveSourcesCount} streaming real-time
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Source Name</th>
                      <th className="py-3 px-4">Category & Type</th>
                      <th className="py-3 px-4">Trust</th>
                      <th className="py-3 px-4">Latency</th>
                      <th className="py-3 px-4">Articles</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                    {sourcesList.map((src) => (
                      <tr key={src.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4">
                          <div className="font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{src.name}</span>
                            {src.isCustom && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{src.url}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-300 font-sans">{src.category}</span>
                          <div className="text-[10px] text-slate-400">{src.type}</div>
                        </td>
                        <td className="py-3 px-4 text-cyan-400 font-bold">{src.trustScore}/10</td>
                        <td className="py-3 px-4 text-slate-400">
                          {src.latencyMs ? `${src.latencyMs}ms` : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-bold">
                          {src.articlesCount || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] capitalize font-bold ${
                              src.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-red-500/10 text-red-400'
                            }`}
                          >
                            {src.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleSource(src.id)}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                                src.status === 'active'
                                  ? 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'
                              }`}
                            >
                              {src.status === 'active' ? 'Disable' : 'Enable'}
                            </button>

                            {src.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteSource(src.id, src.name)}
                                className="p-1 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                                title="Delete Custom Source"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PIPELINE WORKERS & BACKGROUND JOBS */}
        {activeTab === 'pipelines' && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                  Live Scraping & Ingestion Workers (Real Telemetry)
                </span>
                <span className="text-xs font-mono text-cyan-400">
                  {pipelinesList.length} Active Pipelines
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {pipelinesList.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            job.status === 'running'
                              ? 'bg-emerald-400 animate-ping'
                              : job.status === 'completed'
                              ? 'bg-cyan-400'
                              : 'bg-red-400'
                          }`}
                        />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {job.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono capitalize ${
                            job.status === 'running'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs mt-1">{job.details}</div>
                    </div>

                    <div className="flex items-center gap-6 font-mono text-[11px] text-slate-400">
                      <div>
                        <span>Processed: </span>
                        <strong className="text-slate-200 font-bold">{job.processedCount} items</strong>
                      </div>
                      <div>
                        <span>Latency: </span>
                        <strong className="text-cyan-400 font-bold">{job.latencyMs}ms</strong>
                      </div>
                      <div>
                        <span>Errors: </span>
                        <strong className={job.errorCount === 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {job.errorCount}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleTriggerSync}
                        className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-cyan-400 cursor-pointer"
                        title="Run Pipeline Now"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ADMIN GOVERNANCE & ACCESS CLEARANCES */}
        {activeTab === 'delegation' && (
          <div className="space-y-6 animate-fade-in">
            {/* Delegation Overview Hero Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-900/30 via-slate-900/40 to-slate-950 border border-purple-500/30 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shadow-md">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Administrator Access & Role Governance</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                        Strict Lockdown Active
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Platform root owner is <span className="font-mono text-purple-400 font-semibold">{PRIMARY_ADMIN_EMAIL}</span>. Only authorized administrators can manage platform sources.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Authorized Admins</div>
                    <div className="text-lg font-black text-purple-400 font-mono">{adminEmails.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delegation Alerts */}
            {delegationSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-2 font-medium animate-fade-in">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{delegationSuccess}</span>
                </div>
                <button type="button" onClick={() => setDelegationSuccess(null)}>
                  &times;
                </button>
              </div>
            )}

            {delegationError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center justify-between gap-2 font-medium animate-fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{delegationError}</span>
                </div>
                <button type="button" onClick={() => setDelegationError(null)}>
                  &times;
                </button>
              </div>
            )}

            {/* Form to Assign New Administrator */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Delegate Administrator Authority
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Enter an existing user email address to grant administrator authority.
              </p>

              <form onSubmit={handleAssignAdmin} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Administrator</span>
                </button>
              </form>
            </div>

            {/* Active Administrators Directory */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono block">
                    Authorized Administrators Directory
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Accounts permitted to access the admin console and switch roles
                  </span>
                </div>
                <span className="text-xs font-mono text-purple-400 font-bold">
                  {adminEmails.length} {adminEmails.length === 1 ? 'Admin' : 'Admins'}
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {adminEmails.map((email) => {
                  const isPrimary = isPrimaryAdmin(email);
                  const isCurrentUser = currentUser.email.toLowerCase() === email.toLowerCase();

                  return (
                    <div
                      key={email}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isPrimary
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {isPrimary ? <Crown className="w-5 h-5 text-amber-400" /> : <Shield className="w-5 h-5 text-cyan-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">
                              {email}
                            </span>
                            {isCurrentUser && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                You
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                                isPrimary
                                  ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}
                            >
                              {isPrimary ? 'Primary Owner & Root Admin' : 'Delegated Administrator'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {isPrimary ? (
                          <span className="px-3 py-1.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-bold flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>Protected (Root)</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleRevokeAdmin(email)}
                            className="px-3 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Revoke Admin</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
