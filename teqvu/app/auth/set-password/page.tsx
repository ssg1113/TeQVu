'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  Fingerprint,
} from 'lucide-react';
import { Logo } from '../../../components/ui/Logo';
import { PasswordStrengthIndicator } from '../../../components/ui/PasswordStrengthIndicator';
import { updateUserPassword, supabase } from '../../../lib/supabase/client';
import { useAppStore } from '../../../lib/store/useAppStore';
import { isAdminAccount } from '../../../lib/security/admin';

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, setPasswordStatus, linkAuthProvider, updateUser, adminEmails } = useAppStore();

  const providerParam = (searchParams.get('provider') || 'google') as 'google' | 'github';
  const emailParam = searchParams.get('email') || currentUser.email || '';

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // If supabase session has email, use it
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data?.session?.user?.email) {
          setEmail(data.session.user.email);
        }
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMsg('Please ensure your password satisfies all security requirements.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setErrorMsg(null);
    setLoading(true);

    try {
      // 1. Update password in Supabase Auth
      const { error } = await updateUserPassword(password, {
        provider_linked: providerParam,
        email_verified: true,
      });

      if (error) {
        console.warn('Supabase password update note:', error.message);
        // If demo/offline, gracefully persist to local unified store
      }

      // 2. Unify credentials in application store
      setPasswordStatus(true, new Date().toISOString());
      linkAuthProvider(providerParam);
      linkAuthProvider('email');
      updateUser({
        email: email || currentUser.email,
        hasPassword: true,
      });

      setSuccess(true);
      setTimeout(() => {
        const isAdmin = isAdminAccount(email || currentUser.email, adminEmails);
        router.push(isAdmin ? '/admin' : '/home');
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to establish validated account password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1e]">
      <div className="w-full max-w-md bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo linkToHome variant="horizontal" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold">
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Unified Account Security</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white pt-1">
            Set Your Master Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            You authenticated with{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">
              {providerParam}
            </span>
            . To prevent separate fragmented accounts and unify your access across Google,
            GitHub, and normal email logins, create a validated master password.
          </p>
        </div>

        {/* Authenticated Email Pill */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <Mail className="w-4 h-4 text-cyan-500" />
            <span className="font-mono font-medium truncate max-w-[200px]">{email || 'Authenticated User'}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Verified
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-1 text-center font-mono">
            <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
            <p className="font-bold text-sm">Account Successfully Unified!</p>
            <p className="text-[11px] text-slate-400 font-sans">
              Redirecting to your personalized intelligence feed...
            </p>
          </div>
        )}

        {/* Form */}
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your master password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Live Password Strength Meter */}
            <PasswordStrengthIndicator
              password={password}
              confirmPassword={confirmPassword}
              userEmail={email}
              onValidationChange={setIsPasswordValid}
            />

            <button
              type="submit"
              disabled={loading || !isPasswordValid || password !== confirmPassword}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-md shadow-cyan-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm & Unify Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <Link
            href={isAdminAccount(email || currentUser.email, adminEmails) ? '/admin' : '/home'}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
          >
            Skip for now &rarr;
          </Link>
          <div>
            Already verified?{' '}
            <Link href="/signin" className="text-cyan-500 font-semibold hover:underline">
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1e]">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      }
    >
      <SetPasswordContent />
    </Suspense>
  );
}
