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

  // Exact same query as getAllReviewsForUser
  const { data, error, count } = await admin
    .from('reviews')
    .select('id, video_title, created_at, user_id', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Also get the specific missing review
  const { data: missingReview } = await admin
    .from('reviews')
    .select('*')
    .eq('id', '0c1c13db-4b78-415d-aadd-6dc70090acc8')
    .single();

  return NextResponse.json({
    count,
    dataLength: data?.length,
    error,
    hasMissingInResults: data?.some(r => r.id === '0c1c13db-4b78-415d-aadd-6dc70090acc8'),
    missingReview: {
      exists: !!missingReview,
      id: missingReview?.id,
      title: missingReview?.video_title,
      created_at: missingReview?.created_at,
      user_id: missingReview?.user_id,
      rawTimestamp: missingReview?.created_at,
    },
    first5: data?.slice(0, 5).map(r => ({
      id: r.id,
      title: r.video_title,
      created_at: r.created_at,
      user_id: r.user_id
    })),
    allUserIds: [...new Set(data?.map(r => r.user_id))],
  });
}
