'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
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
  KeyRound,
  ArrowLeft,
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { PasswordStrengthIndicator } from '../../components/ui/PasswordStrengthIndicator';
import { updateUserPassword, supabase } from '../../lib/supabase/client';
import { useAppStore } from '../../lib/store/useAppStore';

function ResetPasswordContent() {
  const router = useRouter();
  const { setPasswordStatus } = useAppStore();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [sessionUserEmail, setSessionUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      try {
        if (!supabase) {
          setCheckingSession(false);
          return;
        }

        // 1. Check for error in query or hash params
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          const hash = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash;
          const hashParams = new URLSearchParams(hash);

          const err = searchParams.get('error_description') || hashParams.get('error_description');
          if (err && isMounted) {
            setErrorMsg(err);
            setCheckingSession(false);
            return;
          }
        }

        // 2. Check active recovery session
        const { data } = await supabase.auth.getSession();
        if (data?.session?.user && isMounted) {
          setSessionUserEmail(data.session.user.email || null);
        }
      } catch (err: any) {
        if (isMounted) setErrorMsg(err.message);
      } finally {
        if (isMounted) setCheckingSession(false);
      }
    }

    checkAuthSession();

    return () => {
      isMounted = false;
    };
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
      const { error } = await updateUserPassword(password, {
        password_reset_via: 'recovery_flow',
      });

      if (error) {
        throw new Error(error.message);
      }

      setPasswordStatus(true, new Date().toISOString());
      setSuccess(true);
      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update account password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1e]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-cyan-500" />
          <p className="text-xs font-mono text-slate-400">Verifying secure recovery token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1e]">
      <div className="w-full max-w-md bg-white dark:bg-[#0f1629] border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 animate-fade-in">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="flex justify-center pb-1">
            <Logo linkToHome variant="horizontal" size="lg" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-semibold">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Cryptographic Password Reset</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white pt-1">
            Create New Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {sessionUserEmail ? (
              <>
                Setting a new validated password for{' '}
                <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                  {sessionUserEmail}
                </span>
              </>
            ) : (
              'Enter your new validated password below to restore access to your account.'
            )}
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2.5 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p>{errorMsg}</p>
              <Link
                href="/forgot-password"
                className="inline-block text-[11px] text-cyan-400 hover:underline"
              >
                Request a new recovery link &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs space-y-3 text-center font-mono animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">
                Password Successfully Reset!
              </h2>
              <p className="text-xs text-emerald-400 font-sans">
                Your new validated password is active. Redirecting you to sign in...
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/signin"
                className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 transition"
              >
                Sign In Now
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new validated password"
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
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Real-time Password Strength & Compliance */}
            <PasswordStrengthIndicator
              password={password}
              confirmPassword={confirmPassword}
              userEmail={sessionUserEmail || undefined}
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
                  <span>Update & Protect Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/signin"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1e]">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
