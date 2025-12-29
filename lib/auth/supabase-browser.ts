/**
 * Browser Supabase Client
 * Uses @supabase/ssr for proper cookie handling in Next.js App Router
 */

import { createBrowserClient } from '@supabase/ssr';

export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      // Session expires after 7 days of inactivity
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Custom storage to ensure session persists
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
  }
);
