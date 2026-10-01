'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, Mail, User, Shield } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { INTEREST_OPTIONS } from '../../lib/utils';
import { useAppStore } from '../../lib/store/useAppStore';

export default function OnboardingPage() {
  const router = useRouter();
  const { interests, toggleInterest, currentUser, updateUser, updateNewsletterPrefs, newsletterPrefs, isAuthenticated } = useAppStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [occupation, setOccupation] = useState<any>(currentUser.occupation || 'Software Engineer');
  const [name, setName] = useState(currentUser.name || '');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>(newsletterPrefs.frequency as any || 'daily');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.replace('/signin?notice=auth_required&returnUrl=/onboarding');
    }
  }, [mounted, isAuthenticated, router]);

  const occupations = ['Student', 'Software Engineer', 'Researcher', 'Academic', 'IT Professional', 'Other'];

  const handleFinish = () => {
    updateUser({ name, occupation });
    updateNewsletterPrefs({ frequency });
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1e]">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-10 space-y-8 animate-fade-in">
        {/* Brand Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Logo variant="icon" size="sm" />
            <div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Te</span>
                <span className="bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Q</span>
                <span>Vu Setup</span>
              </span>
              <div className="text-[11px] text-slate-400">Step {step} of 3</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: Profile & Occupation */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Welcome to TeQVu
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Tell us about your background so we can fine-tune your technology intelligence feed.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                  placeholder="e.g. Alex Rivera"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Primary Occupation / Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {occupations.map((occ) => (
                    <button
                      key={occ}
                      type="button"
                      onClick={() => setOccupation(occ)}
                      className={`p-3 rounded-xl border text-left text-xs font-semibold transition ${
                        occupation === occ
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Technology Interests */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Select Your Technology Interests
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select 3 or more areas you wish to monitor. You can modify these anytime.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto pr-1">
              {INTEREST_OPTIONS.map((item) => {
                const selected = interests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleInterest(item.id)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition ${
                      selected
                        ? 'bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-cyan-500/50'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                    {selected && <CheckCircle2 className="w-3.5 h-3.5 ml-1" />}
                  </button>
                );
              })}
            </div>
            <div className="text-[11px] font-mono text-cyan-400">
              {interests.length} topics selected
            </div>
          </div>
        )}

        {/* STEP 3: Newsletter Frequency */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Intelligent Email Briefing
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Zero spam. Only verified breakthroughs and major emerging signals in your chosen stack.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'daily', title: 'Daily Digest', desc: 'Every morning at 07:00 AM' },
                { id: 'weekly', title: 'Weekly Wrap', desc: 'Every Monday morning' },
                { id: 'monthly', title: 'Monthly Deep Dive', desc: '1st of each month' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFrequency(opt.id as any)}
                  className={`p-4 rounded-xl border text-left transition ${
                    frequency === opt.id
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-md'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Mail className="w-4 h-4 mb-2 text-cyan-500" />
                  <div className="font-bold text-xs">{opt.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 text-xs text-slate-400 flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span>
                Anti-Spam Guarantee: Hard limit of 1 priority alert per day, honoring your quiet hours.
              </span>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md shadow-cyan-500/20 transition"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 shadow-lg shadow-cyan-500/20 transition"
            >
              <span>Launch TeQVu Dashboard</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
