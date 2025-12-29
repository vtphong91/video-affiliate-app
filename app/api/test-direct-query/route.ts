import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  // Create FRESH admin client
  const freshAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Query với fresh admin client
  const { data, error, count } = await freshAdmin
    .from('reviews')
    .select('id, video_title, created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return NextResponse.json({
    count,
    dataLength: data?.length,
    firstFew: data?.slice(0, 5).map(r => ({
      id: r.id,
      title: r.video_title,
      created: r.created_at
    })),
    lastFew: data?.slice(-5).map(r => ({
      id: r.id,
      title: r.video_title,
      created: r.created_at
    })),
    hasMissingReview: data?.some(r => r.id === '0c1c13db-4b78-415d-aadd-6dc70090acc8'),
    error,
  });
}
