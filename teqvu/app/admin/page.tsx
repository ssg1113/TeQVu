'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
} from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { adminStats, processingJobs, sourcesList } from '../../lib/mock-data/sources';
import { technologies } from '../../lib/mock-data/technologies';
import { TrendBadge } from '../../components/ui/Badge';
import { formatNumber } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';

export default function AdminDashboardPage() {
  const { currentUser, switchRole } = useAppStore();
  const [activeTab, setActiveTab] = useState<'monitoring' | 'sources' | 'trends'>('monitoring');
  const [sources, setSources] = useState(sourcesList);
  const [techList, setTechList] = useState(technologies);

  const toggleSourceStatus = (id: string) => {
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s))
    );
  };

  // RESTRICTED ACCESS SCREEN FOR NORMAL USERS
  if (currentUser.role !== 'admin') {
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
            <div className="text-slate-400 font-mono text-[11px] uppercase">Your Current Credentials:</div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.name}</span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono capitalize">
                {currentUser.role} Account
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{currentUser.email}</div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={() => switchRole('admin')}
              className="w-full sm:flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/20 transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>Switch to Admin Account</span>
            </button>

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
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          {[
            { id: 'monitoring', label: 'Pipeline & System Monitoring' },
            { id: 'sources', label: `Source Management (${sources.length})` },
            { id: 'trends', label: 'Trend Approval & Velocity' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3.5 border-b-2 transition -mb-px ${
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
      </div>
    </DashboardLayout>
  );
}
