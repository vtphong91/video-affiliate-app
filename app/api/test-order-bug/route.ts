import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Test WITHOUT order
  const { data: withoutOrder } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('user_id', userId);

  // Test WITH order
  const { data: withOrder } = await supabaseAdmin
    .from('reviews')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    withoutOrder: withoutOrder?.length,
    withOrder: withOrder?.length,
    difference: (withoutOrder?.length || 0) - (withOrder?.length || 0),
    withoutOrder_ids: withoutOrder?.slice(0, 5).map(r => r.id),
    withOrder_ids: withOrder?.slice(0, 5).map(r => r.id),
  });
}
