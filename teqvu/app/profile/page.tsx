'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Briefcase, Calendar, CheckCircle2, Shield, Eye, Bookmark, Save } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAppStore } from '../../lib/store/useAppStore';
import { INTEREST_OPTIONS } from '../../lib/utils';
import { technologies } from '../../lib/mock-data/technologies';

export default function ProfilePage() {
  const { currentUser, updateUser, interests, toggleInterest, watchlistIds, bookmarkedIds } = useAppStore();
  const [name, setName] = useState(currentUser.name);
  const [occupation, setOccupation] = useState(currentUser.occupation);
  const [saved, setSaved] = useState(false);

  const occupations = ['Student', 'Software Engineer', 'Researcher', 'Academic', 'IT Professional', 'Other'];
  const watchedTechs = technologies.filter((t) => watchlistIds.includes(t.id));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, occupation });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
            Manage your credentials, professional role, and customized topic tags.
          </p>
        </div>

        {/* Profile Details Form */}
        <form onSubmit={handleSave} className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
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

        {/* Interests Editor */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monitored Technology Domains ({interests.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any domain tag to toggle your feed and newsletter inclusion.
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
