'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../../lib/supabase/client';
import { useAppStore } from '../../../lib/store/useAppStore';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login, updateUser } = useAppStore();
  const [status, setStatus] = useState('Verifying authentication...');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuth() {
      // 1. Check for error in search or hash params
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search);
        const hash = window.location.hash.startsWith('#')
          ? window.location.hash.substring(1)
          : window.location.hash;
        const hashParams = new URLSearchParams(hash);

        const error = searchParams.get('error') || hashParams.get('error');
        const errorDescription =
          searchParams.get('error_description') ||
          hashParams.get('error_description') ||
          searchParams.get('error_code') ||
          hashParams.get('error_code');

        if (error || errorDescription) {
          if (isMounted) {
            setErrorMsg(errorDescription || error || 'OAuth authentication failed.');
          }
          return;
        }
      }

      if (!supabase) {
        if (isMounted) {
          setErrorMsg('Supabase client is not configured.');
        }
        return;
      }

      const processSession = (session: any) => {
        if (!session?.user || !isMounted) return false;
        const user = session.user;
        const email = user.email || '';
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.user_metadata?.user_name ||
          email.split('@')[0];
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';

        login(email, role, name);

        if (avatarUrl || user.id) {
          updateUser({
            id: user.id,
            ...(avatarUrl ? { avatarUrl } : {}),
          });
        }

        setStatus('Authentication successful! Redirecting...');
        setTimeout(() => {
          router.push(role === 'admin' ? '/admin' : '/home');
        }, 500);
        return true;
      };

      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');

        // 2. If code exists in URL (PKCE flow), exchange it explicitly if needed
        if (code) {
          setStatus('Exchanging authentication code...');
          const { data: exchangeData, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (!exchangeError && exchangeData?.session) {
            if (processSession(exchangeData.session)) return;
          } else if (exchangeError) {
            console.warn('exchangeCodeForSession note:', exchangeError.message);
          }
        }

        // 3. Check getSession()
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          if (isMounted) setErrorMsg(error.message);
          return;
        }

        if (data?.session?.user) {
          if (processSession(data.session)) return;
        }

        // 4. Listen for auth state change if session is still settling
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user && isMounted) {
            processSession(session);
          }
        });

        // 5. Timeout: If no session was established after 5 seconds, inform the user instead of silent redirect
        const timer = setTimeout(() => {
          if (isMounted) {
            setErrorMsg(
              'Unable to establish authentication session. Please verify that your Supabase Site URL and Redirect URLs match this domain.'
            );
          }
        }, 5000);

        return () => {
          authListener?.subscription?.unsubscribe();
          clearTimeout(timer);
        };
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Authentication error encountered.');
        }
      }
    }

    handleAuth();

    return () => {
      isMounted = false;
    };
  }, [login, updateUser, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-[#0a0f1e]">
      <div className="w-full max-w-sm bg-white dark:bg-[#0f1629] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-8 text-center space-y-4 animate-fade-in">
        {errorMsg ? (
          <>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Sign In Failed</h2>
            <p className="text-xs text-red-400 font-mono">{errorMsg}</p>
            <div className="pt-2">
              <Link
                href="/signin"
                className="inline-block px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 transition"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">Connecting Account...</h2>
            <p className="text-xs text-slate-400 font-mono">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}

