import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
  const newestId = '13cf25b4-531c-4a43-8fbb-7d3ee8e01a0b';

  // Test 1: NO ORDER BY
  const { data: noOrder } = await admin
    .from('reviews')
    .select('id, created_at')
    .eq('user_id', userId);

  // Test 2: ORDER BY created_at ASC
  const { data: orderAsc } = await admin
    .from('reviews')
    .select('id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  // Test 3: ORDER BY created_at DESC
  const { data: orderDesc } = await admin
    .from('reviews')
    .select('id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    newestId,
    noOrder: {
      total: noOrder?.length,
      hasNewest: noOrder?.some(r => r.id === newestId),
      first5: noOrder?.slice(0, 5).map(r => ({ id: r.id, created_at: r.created_at })),
    },
    orderAsc: {
      total: orderAsc?.length,
      hasNewest: orderAsc?.some(r => r.id === newestId),
      first5: orderAsc?.slice(0, 5).map(r => ({ id: r.id, created_at: r.created_at })),
      last5: orderAsc?.slice(-5).map(r => ({ id: r.id, created_at: r.created_at })),
    },
    orderDesc: {
      total: orderDesc?.length,
      hasNewest: orderDesc?.some(r => r.id === newestId),
      first5: orderDesc?.slice(0, 5).map(r => ({ id: r.id, created_at: r.created_at })),
    },
  });
}
