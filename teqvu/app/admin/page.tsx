'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TrendBadge } from '../../components/ui/Badge';
import { formatNumber } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';
import type { Technology, Source, ProcessingJob, AdminStats } from '../../lib/types';
import {
  PRIMARY_ADMIN_EMAIL,
  isPrimaryAdmin,
  canSwitchRole,
} from '../../lib/security/admin';

const ADMIN_STATS: AdminStats = {
  activeUsers: 1420,
  totalUsers: 3850,
  articlesCollected: 1240,
  sourcesCount: 8,
  technologiesCount: 42,
  emergingTrends: 17,
  emailsSent: 890,
  processingFailures: 1,
};

const PROCESSING_JOBS: ProcessingJob[] = [
  { id: 'job-1', name: 'arXiv CS Research Ingestion', status: 'running', processedCount: 142, errorCount: 0, lastRun: '10m ago', nextRun: '20m', details: 'Polling CS.AI, CS.LG, CS.SE endpoints' },
  { id: 'job-2', name: 'GitHub Trends Ingestion', status: 'completed', processedCount: 85, errorCount: 0, lastRun: '25m ago', nextRun: '35m', details: 'Ingesting stars > 500 repository signals' },
  { id: 'job-3', name: 'Tech News RSS Pipeline', status: 'running', processedCount: 310, errorCount: 1, lastRun: '5m ago', nextRun: '25m', details: 'Ingesting Reuters, BBC, Google News' },
  { id: 'job-4', name: 'Jobs & Skills Sync', status: 'completed', processedCount: 95, errorCount: 0, lastRun: '1h ago', nextRun: '1h', details: 'Aggregating Arbeitnow, Remotive, and Hacker News' },
];

const SOURCES_LIST: Source[] = [
  { id: 'reuters', name: 'Reuters Technology', url: 'https://www.reuters.com/technology/', type: 'Global Wire', category: 'Tech News', trustScore: 10, status: 'active', articlesCount: 420, lastChecked: new Date().toISOString(), collectionFrequency: '30 minutes' },
  { id: 'bbc', name: 'BBC Technology', url: 'https://www.bbc.com/news/technology', type: 'Public Broadcaster', category: 'Tech News', trustScore: 10, status: 'active', articlesCount: 380, lastChecked: new Date().toISOString(), collectionFrequency: '30 minutes' },
  { id: 'googlenews', name: 'Google News Tech', url: 'https://news.google.com', type: 'Global Wire', category: 'Tech News', trustScore: 9, status: 'active', articlesCount: 650, lastChecked: new Date().toISOString(), collectionFrequency: '30 minutes' },
  { id: 'digitaltrends', name: 'Digital Trends', url: 'https://www.digitaltrends.com', type: 'Tech News', category: 'Tech News', trustScore: 9, status: 'active', articlesCount: 290, lastChecked: new Date().toISOString(), collectionFrequency: '1 hour' },
  { id: 'arxiv', name: 'arXiv.org Computer Science', url: 'https://arxiv.org', type: 'Research', category: 'Research', trustScore: 10, status: 'active', articlesCount: 1850, lastChecked: new Date().toISOString(), collectionFrequency: '1 hour' },
  { id: 'github', name: 'GitHub Trending Repos', url: 'https://github.com/trending', type: 'Developer Tools', category: 'Developer Tools', trustScore: 10, status: 'active', articlesCount: 540, lastChecked: new Date().toISOString(), collectionFrequency: '1 hour' },
  { id: 'arbeitnow', name: 'Arbeitnow Jobs Feed', url: 'https://www.arbeitnow.com', type: 'API', category: 'Jobs & Careers', trustScore: 9, status: 'active', articlesCount: 310, lastChecked: new Date().toISOString(), collectionFrequency: '2 hours' },
  { id: 'remotive', name: 'Remotive Remote Jobs', url: 'https://remotive.com', type: 'API', category: 'Jobs & Careers', trustScore: 9, status: 'active', articlesCount: 280, lastChecked: new Date().toISOString(), collectionFrequency: '2 hours' },
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    switchRole,
    adminEmails,
    assignAdmin,
    revokeAdmin,
    addNotification,
  } = useAppStore();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'delegation' | 'sources' | 'trends'>('monitoring');
  const [sources, setSources] = useState(SOURCES_LIST);
  const [techList, setTechList] = useState<Technology[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [delegationSuccess, setDelegationSuccess] = useState<string | null>(null);
  const [delegationError, setDelegationError] = useState<string | null>(null);
  const adminStats = ADMIN_STATS;
  const processingJobs = PROCESSING_JOBS;

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

  const toggleSourceStatus = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
    );
  };

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
      setDelegationSuccess(`Administrator clearance granted to ${clean}. They can now log in or switch to the Admin role.`);
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

  // RESTRICTED ACCESS SCREEN FOR NORMAL USERS
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
              This console is dedicated to platform operators for monitoring background scrapers, AI extraction jobs, source governance, and system telemetry.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 text-xs text-left w-full space-y-3">
            <div className="text-slate-400 font-mono text-[11px] uppercase">Your Current Account:</div>
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
                  <span>You have been granted administrator clearance! Switch to Administrator role below.</span>
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
                  const success = switchRole('admin');
                  if (success) {
                    router.push('/signin?switched=true&role=admin');
                  }
                }}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/20 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Switch to Administrator Role</span>
              </button>
            ) : (
              <Link
                href={`/signin?notice=admin_required&email=${encodeURIComponent(PRIMARY_ADMIN_EMAIL)}`}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/20 transition"
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

  // FULL ADMIN DASHBOARD FOR ADMIN USERS
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200/80 dark:border-slate-800/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-semibold mb-1">
              <Shield className="w-4 h-4" />
              <span>Platform Administration & Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Admin Console & Ingestion Telemetry
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Real-time monitoring of scrapers, AI extraction jobs, deduplication clusters, and verified sources.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              System Healthy
            </span>
          </div>
        </div>

        {/* 1. KEY SYSTEM STATS TILES */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active Users', value: formatNumber(adminStats.activeUsers), total: `${formatNumber(adminStats.totalUsers)} total`, icon: Users, color: 'text-cyan-400' },
            { label: 'Articles Ingested', value: formatNumber(adminStats.articlesCollected), total: 'Across 342 feeds', icon: Layers, color: 'text-purple-400' },
            { label: 'Technologies', value: formatNumber(adminStats.technologiesCount), total: '17 emerging', icon: Compass, color: 'text-emerald-400' },
            { label: 'Emails Dispatched', value: formatNumber(adminStats.emailsSent), total: '99.8% inbox rate', icon: Mail, color: 'text-amber-400' },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-mono uppercase tracking-wider">{stat.label}</span>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {stat.value}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{stat.total}</div>
              </div>
            );
          })}
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold overflow-x-auto pb-px">
          {[
            { id: 'monitoring', label: 'Pipeline & System Monitoring' },
            { id: 'delegation', label: `Admin Governance & Delegation (${adminEmails.length})` },
            { id: 'sources', label: `Source Management (${sources.length})` },
            { id: 'trends', label: 'Trend Approval & Velocity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap -mb-px ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400 font-bold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: SYSTEM MONITORING */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                  Background Processing Workers & Pipelines
                </span>
                <span className="text-xs font-mono text-cyan-400">Powered by BullMQ + Redis + FastAPI</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {processingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            job.status === 'running'
                              ? 'bg-emerald-400 animate-ping'
                              : job.status === 'completed'
                              ? 'bg-cyan-400'
                              : 'bg-purple-400'
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
                        <strong className="text-slate-200">{job.processedCount}</strong>
                      </div>
                      <div>
                        <span>Errors: </span>
                        <strong className="text-emerald-400">{job.errorCount}</strong>
                      </div>
                      <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:text-cyan-400">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SOURCES MANAGEMENT */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Managing verified RSS, API, and research portals
              </span>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Source Feed</span>
              </button>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Source Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Trust Score</th>
                    <th className="py-3 px-4">Poll Frequency</th>
                    <th className="py-3 px-4">Articles Ingested</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {sources.map((src) => (
                    <tr key={src.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-sans">
                        {src.name}
                      </td>
                      <td className="py-3 px-4 text-slate-400">{src.type}</td>
                      <td className="py-3 px-4 text-cyan-400 font-bold">{src.trustScore}/10</td>
                      <td className="py-3 px-4 text-slate-300">{src.collectionFrequency}</td>
                      <td className="py-3 px-4 text-slate-300">{src.articlesCount}</td>
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
                        <button
                          onClick={() => toggleSourceStatus(src.id)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] hover:text-white"
                        >
                          {src.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TREND APPROVAL */}
        {activeTab === 'trends' && (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0f1629] overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
                Detected Technologies & Promotion Status
              </span>
              <span className="text-xs text-slate-400 font-mono">17 Candidates Under Review</span>
            </div>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800/80 text-slate-400 font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Technology</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Velocity Score</th>
                  <th className="py-3 px-4">Mentions</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {techList.slice(0, 6).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {t.name}
                    </td>
                    <td className="py-3 px-4 text-slate-400">{t.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{t.trendScore}/100</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{t.mentions}</td>
                    <td className="py-3 px-4">
                      <TrendBadge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition">
                        Approved
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: ADMIN GOVERNANCE & DELEGATION */}
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
                      Platform root owner is <span className="font-mono text-purple-400 font-semibold">{PRIMARY_ADMIN_EMAIL}</span>. Only the primary administrator can delegate or revoke administrator clearance for other accounts.
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

              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-white">Delegated Authority Rules:</p>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    1. When an email is assigned below, that user obtains permission to access this Admin Console.
                    <br />
                    2. If an assigned user is logged in as a normal user, they can freely switch to the Administrator role via their user menu or Settings.
                    <br />
                    3. For strict security, role transitions always log out the active session and redirect to the Sign In page for credential verification.
                  </p>
                </div>
              </div>
            </div>

            {/* Success & Error alerts */}
            {delegationSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between gap-2 font-medium animate-fade-in">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>{delegationSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setDelegationSuccess(null)}
                  className="text-emerald-400 hover:text-white text-xs"
                >
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
                <button
                  type="button"
                  onClick={() => setDelegationError(null)}
                  className="text-red-400 hover:text-white text-xs"
                >
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
                Enter any user email address. Once assigned, they can log in as an administrator or switch their role in real-time.
              </p>

              <form onSubmit={handleAssignAdmin} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="user@example.com (e.g. colleague@techpulse.dev)"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-md shadow-purple-500/20 transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign as Administrator</span>
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
                  {adminEmails.length} {adminEmails.length === 1 ? 'Admin' : 'Admins'} Authorized
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
                            <span className="text-[10px] text-slate-400 font-mono">
                              Clearance: Full Telemetry & Scraper Control
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

            {/* Quick Role Testing Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Quick Role Switcher Test
                </span>
                <span className="text-[11px] text-slate-400">
                  Switch to Normal User to test the restricted portal view. You can switch back at any time.
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
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-700 hover:bg-slate-600 transition whitespace-nowrap self-start sm:self-center cursor-pointer"
              >
                Switch to Normal User
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
