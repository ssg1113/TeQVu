'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Loader2, KeyRound, Clock, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { resetPasswordForEmail } from '../../lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (cooldown > 0) {
      setErrorMsg(`Please wait ${cooldown}s before requesting another reset email.`);
      return;
    }

    setLoading(true);

    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        console.warn('Supabase resetPasswordForEmail notice:', error.message);
        // Note: For privacy and security (anti-enumeration), we still show the recovery sent state
        // even if user doesn't exist, while logging or showing actionable message if config is absent.
        if (error.message.includes('not configured')) {
          setErrorMsg('Authentication service is not configured. Please check environment credentials.');
          setLoading(false);
          return;
        }
      }

      setSubmitted(true);
      setCooldown(60); // 60 seconds rate limit cooldown
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch password recovery email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (cooldown <= 0) {
      handleSubmit(new Event('submit') as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1e]">
      <div className="w-full max-w-md bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo linkToHome variant="horizontal" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Account Recovery</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white pt-1">
            Recover Your Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Enter the email associated with your TeQVu account. We will send a cryptographically
            secure reset link to set a new validated password.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 space-y-3 text-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">
                  Recovery Dispatch Initiated
                </p>
                <p className="font-mono text-emerald-400 text-xs">{email}</p>
              </div>
              <p className="text-slate-400 text-[11px] font-sans leading-relaxed">
                If an account exists with this email address, you will receive a secure password
                reset link. The link expires in 15 minutes.
              </p>
            </div>

            {/* Rate limit & resend */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <Clock className="w-3.5 h-3.5" />
                <span>Rate limiting active</span>
              </div>
              {cooldown > 0 ? (
                <span className="font-mono text-cyan-400 text-[11px]">Resend in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-cyan-500 hover:text-cyan-400 font-semibold text-[11px] hover:underline"
                >
                  Resend Email
                </button>
              )}
            </div>

            <div className="pt-2 text-center">
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>
                Works for both OAuth (Google / GitHub) and standard email accounts linked to this address.
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-md shadow-cyan-500/20 transition disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Send Secure Reset Link</span>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
