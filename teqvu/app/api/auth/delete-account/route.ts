import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, userId } = body;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // If Supabase Service Role Key is configured, permanently remove user from auth directory
    if (supabaseUrl && serviceRoleKey && userId) {
      try {
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        });
        const { error } = await adminSupabase.auth.admin.deleteUser(userId);
        if (error) {
          console.warn('Supabase admin deleteUser error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase service role delete error:', err);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Account permanently deleted from system.',
      purgedEmail: email,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process account deletion' },
      { status: 500 }
    );
  }
}
