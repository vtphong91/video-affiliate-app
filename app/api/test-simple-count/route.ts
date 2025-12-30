import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Test 1: Query từ review-service.ts location
  const client1 = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: d1 } = await client1
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Test 2: Query từ API route location (same code)
  const client2 = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: d2 } = await client2
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    test1: d1?.length || 0,
    test2: d2?.length || 0,
    match: (d1?.length || 0) === (d2?.length || 0),
    draftIds: d1?.filter(r => r.status === 'draft').map(r => r.id.substring(0, 8)),
  });
}
