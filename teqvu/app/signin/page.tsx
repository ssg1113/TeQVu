'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  Github,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  AlertTriangle,
  Sparkles,
  Shield,
} from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import {
  signInWithGoogle,
  signInWithGitHub,
  signInWithEmail,
  isSupabaseConfigured,
} from '../../lib/supabase/client';
import { useAppStore } from '../../lib/store/useAppStore';
import {
  PRIMARY_ADMIN_EMAIL,
  isAdminAccount,
} from '../../lib/security/admin';

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, updateUser, adminEmails, adminRolePreference } = useAppStore();

  const switchedParam = searchParams.get('switched') === 'true';
  const roleParam = searchParams.get('role');
  const noticeParam = searchParams.get('notice');
  const returnUrl = searchParams.get('returnUrl') || '';
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected role if this is an admin account
  const defaultRole: 'admin' | 'user' =
    roleParam === 'user'
      ? 'user'
      : roleParam === 'admin'
      ? 'admin'
      : adminRolePreference || 'admin';
  const [selectedRole, setSelectedRole] = useState<'admin' | 'user'>(defaultRole);

  const isCurrentEmailAdmin = isAdminAccount(email, adminEmails);

  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email]);

  // Email/Password Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        setErrorMsg(
          'Supabase is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.'
        );
        setLoading(false);
        return;
      }

      const { data, error } = await signInWithEmail(email, password);
      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      // Process login in store with dynamic admin authority check
      const user = data?.user;
      const isAdmin = isAdminAccount(email, adminEmails);
      const name =
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        email.split('@')[0];

      // If user is an admin account, respect their chosen role mode
      const targetRole: 'user' | 'admin' = isAdmin ? selectedRole : 'user';

      login(email, targetRole, name, 'email', true);

      if (user?.id) {
        updateUser({
          id: user.id,
          hasPassword: true,
          ...(user.user_metadata?.avatar_url ? { avatarUrl: user.user_metadata.avatar_url } : {}),
        });
      }

      if (returnUrl && !returnUrl.startsWith('//')) {
        router.push(returnUrl);
      } else {
        router.push(targetRole === 'admin' ? '/admin' : '/home');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // Real Google OAuth Handler
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);

    try {
      if (!isSupabaseConfigured) {
        setErrorMsg('Supabase is not configured.');
        setGoogleLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('preferred_oauth_role', selectedRole);
        sessionStorage.setItem('auth_flow_intent', 'signin');
      }

      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message);
        setGoogleLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication error');
      setGoogleLoading(false);
    }
  };

  // Real GitHub OAuth Handler
  const handleGitHubSignIn = async () => {
    setErrorMsg(null);
    setGithubLoading(true);

    try {
      if (!isSupabaseConfigured) {
        setErrorMsg('Supabase is not configured.');
        setGithubLoading(false);
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('preferred_oauth_role', selectedRole);
        sessionStorage.setItem('auth_flow_intent', 'signin');
      }

      const { error } = await signInWithGitHub();
      if (error) {
        setErrorMsg(error.message);
        setGithubLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'GitHub authentication error');
      setGithubLoading(false);
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white pt-2">Sign In</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Access your personalized intelligence feed & watchlist.
          </p>
        </div>

        {/* Signed Out Banner */}
        {noticeParam === 'signed_out' && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 dark:text-emerald-400 text-xs flex items-start gap-2.5 font-medium animate-fade-in">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Signed Out Successfully</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Your session has been securely closed. Your saved bookmarks, watchlist, and personalized preferences are safely preserved for your next sign in.
              </p>
            </div>
          </div>
        )}

        {/* Session Timeout Notice */}
        {noticeParam === 'session_timeout' && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 text-xs flex items-start gap-2.5 font-medium animate-fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Session Timed Out</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Your session expired due to inactivity. Please sign in again to access your account and personalized feeds.
              </p>
            </div>
          </div>
        )}

        {/* Authentication Required Notice */}
        {noticeParam === 'auth_required' && (
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 dark:text-cyan-400 text-xs flex items-start gap-2.5 font-medium animate-fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Sign In Required</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Please sign in to access your profile, bookmarked intelligence dossiers, and customized settings.
              </p>
            </div>
          </div>
        )}

        {/* Administrator Clearance Notice */}
        {noticeParam === 'admin_required' && (
          <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs flex items-start gap-2.5 font-medium animate-fade-in">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Admin Clearance Required</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Only authorized administrator accounts (including primary administrator{' '}
                <span className="font-mono text-purple-400">{PRIMARY_ADMIN_EMAIL}</span>) have access to the
                Administrator Console. Please sign in below.
              </p>
            </div>
          </div>
        )}

        {/* Existing Account Notice for Duplicate Sign-Up Prevention */}
        {noticeParam === 'already_registered' && (
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs flex items-start gap-2.5 font-medium animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-cyan-400" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Account Already Exists</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                An account is already linked to this email address. Please enter your credentials or sign in with Google below.
              </p>
            </div>
          </div>
        )}

        {/* Account Permanently Deleted Notice */}
        {noticeParam === 'account_deleted' && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5 font-medium animate-fade-in">
            <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white">Account Deleted</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                Your account and all associated preferences have been permanently removed.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Real OAuth Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-cyan-500/40 transition disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Google</span>
          </button>

          <button
            type="button"
            onClick={handleGitHubSignIn}
            disabled={githubLoading || loading}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:border-cyan-500/40 transition disabled:opacity-50"
          >
            {githubLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            ) : (
              <Github className="w-4 h-4" />
            )}
            <span>GitHub</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          <span className="bg-white dark:bg-[#0f1629] px-3 text-[11px] uppercase tracking-wider text-slate-400 font-mono absolute">
            Or with email & password
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link href="/forgot-password" className="text-cyan-500 hover:underline text-[11px]">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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

          {/* Admin Role Mode Selection Toggle */}
          {isCurrentEmailAdmin && (
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/25 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px]">
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                  Admin Account Recognized
                </span>
                <span className="text-[10px] text-purple-400 font-mono">Sign-in role mode:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                    selectedRole === 'admin'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-500 shadow-md shadow-purple-500/20'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-white'
                  }`}
                >
                  Administrator
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className={`py-2 px-2.5 rounded-xl font-bold text-xs transition border cursor-pointer ${
                    selectedRole === 'user'
                      ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-white'
                  }`}
                >
                  Normal User
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-tight">
                {selectedRole === 'admin'
                  ? 'Access the Admin Console with full scraper and ingestion telemetry.'
                  : 'Browse the platform as a normal user to experience standard features.'}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-md shadow-cyan-500/20 transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-cyan-500 font-bold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1e]">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}
