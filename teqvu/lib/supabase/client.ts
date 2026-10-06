import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null;

/**
 * Trigger Real Google OAuth flow
 */
export async function signInWithGoogle() {
  if (!supabase) {
    console.warn(
      'Supabase credentials not found in environment. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local to complete real Google OAuth.'
    );
    return { data: null, error: new Error('Supabase not configured') };
  }

  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}

/**
 * Trigger Real GitHub OAuth flow
 */
export async function signInWithGitHub() {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  return await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      scopes: 'read:user user:email',
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });
}

/**
 * Sign in with Email & Password
 */
export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign up with Email, Password & User Metadata
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: { name?: string; occupation?: string; role?: string }
) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        ...metadata,
        has_password: true,
        password_updated_at: new Date().toISOString(),
      },
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined,
    },
  });
}

/**
 * Request Password Reset Email
 */
export async function resetPasswordForEmail(email: string) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}/reset-password`
      : undefined;

  return await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
}

/**
 * Update authenticated user's password & metadata
 */
export async function updateUserPassword(
  newPassword: string,
  additionalMetadata?: Record<string, any>
) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  return await supabase.auth.updateUser({
    password: newPassword,
    data: {
      has_password: true,
      password_updated_at: new Date().toISOString(),
      ...additionalMetadata,
    },
  });
}

/**
 * Sign out user safely with local scope and timeout guard
 */
export async function signOut() {
  if (!supabase) {
    return { error: null };
  }
  try {
    return await Promise.race([
      supabase.auth.signOut({ scope: 'local' }),
      new Promise<{ error: null }>((resolve) =>
        setTimeout(() => resolve({ error: null }), 1500)
      ),
    ]);
  } catch (err: any) {
    return { error: err };
  }
}

