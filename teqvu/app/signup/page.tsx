'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Github, Mail, Lock, User, Briefcase, AlertCircle, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { signInWithGoogle, signInWithGitHub, signUpWithEmail, isSupabaseConfigured } from '../../lib/supabase/client';
import { useAppStore } from '../../lib/store/useAppStore';
import { PasswordStrengthIndicator } from '../../components/ui/PasswordStrengthIndicator';

export default function SignUpPage() {
  const router = useRouter();
  const { signup, login } = useAppStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [occupation, setOccupation] = useState('Software Engineer');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const occupations = ['Student', 'Software Engineer', 'Researcher', 'Academic', 'IT Professional', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isPasswordValid) {
      setErrorMsg('Please choose a password that satisfies all security requirements.');
      return;
    }

    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        setErrorMsg('Supabase is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.');
        setLoading(false);
        return;
      }

      // All regular registrations are strictly regular 'user' accounts
      const role: 'user' = 'user';
      const { data, error } = await signUpWithEmail(email, password, {
        name,
        occupation,
        role,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      signup({
        name,
        email,
        occupation,
        role,
      });
      router.push('/onboarding');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMsg(null);
    setGoogleLoading(true);

    try {
      if (!isSupabaseConfigured) {
        setErrorMsg('Supabase is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.');
        setGoogleLoading(false);
        return;
      }

      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMsg(error.message);
        setGoogleLoading(false);
      }
      // Real redirect to Google login is automatically initiated by Supabase OAuth
    } catch (err: any) {
      setErrorMsg(err.message || 'Google signup error');
      setGoogleLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    setErrorMsg(null);
    setGithubLoading(true);

    try {
      if (!isSupabaseConfigured) {
        setErrorMsg('Supabase is not configured. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local.');
        setGithubLoading(false);
        return;
      }

      const { error } = await signInWithGitHub();
      if (error) {
        setErrorMsg(error.message);
        setGithubLoading(false);
      }
      // Real redirect to GitHub login is automatically initiated by Supabase OAuth
    } catch (err: any) {
      setErrorMsg(err.message || 'GitHub signup error');
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
          <h1 className="text-xl font-bold text-slate-900 dark:text-white pt-2">Create your account</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join engineers & researchers discovering what&apos;s next in tech.
          </p>
        </div>

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
            onClick={handleGoogleSignUp}
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
            onClick={handleGitHubSignUp}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                required
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
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
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a secure password"
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
            {/* Real-time strength meter */}
            <PasswordStrengthIndicator
              password={password}
              userEmail={email}
              onValidationChange={setIsPasswordValid}
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Primary Occupation
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {occupations.map((occ) => (
                  <option key={occ} value={occ}>
                    {occ}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (password.length > 0 && !isPasswordValid)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:opacity-90 shadow-md shadow-cyan-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Create Account & Setup Profile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/signin" className="text-cyan-500 font-bold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
