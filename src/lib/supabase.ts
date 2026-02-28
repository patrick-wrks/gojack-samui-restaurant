import { createClient } from '@supabase/supabase-js';

// Anon key only (safe for client). No service role key — repo is public; RLS protects data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Debug: Log env var status (not the actual values!)
if (typeof window !== 'undefined') {
  console.log('[Supabase] Config status:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlLength: supabaseUrl.length,
    keyLength: supabaseAnonKey.length,
  });
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
