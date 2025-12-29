import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Find which review is missing from RPC results
 */
export async function GET() {
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    // Get ALL reviews from database directly
    const { data: allReviews } = await admin
      .from('reviews')
      .select('id, created_at, video_title, user_id, status')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log(`Database direct query: ${allReviews?.length || 0} reviews`);

    // Get reviews via RPC
    const { data: rpcReviews } = await admin
      .rpc('get_user_reviews', { p_user_id: userId });

    console.log(`RPC function: ${rpcReviews?.length || 0} reviews`);

    // Compare
    const allIds = new Set(allReviews?.map(r => r.id) || []);
    const rpcIds = new Set(rpcReviews?.map((r: any) => r.id) || []);

    const missingInRpc = allReviews?.filter(r => !rpcIds.has(r.id)) || [];
    const extraInRpc = rpcReviews?.filter((r: any) => !allIds.has(r.id)) || [];

    console.log(`Missing in RPC: ${missingInRpc.length}`);
    console.log('Missing reviews:', missingInRpc);

    // Get full details of missing review
    const missingReviewDetails = await Promise.all(
      missingInRpc.map(async (r) => {
        const { data: fullReview } = await admin
          .from('reviews')
          .select('*')
          .eq('id', r.id)
          .single();

        return fullReview;
      })
    );

    return NextResponse.json({
      summary: {
        database_count: allReviews?.length || 0,
        rpc_count: rpcReviews?.length || 0,
        missing_count: missingInRpc.length,
        extra_count: extraInRpc.length,
      },
      missing_in_rpc: missingInRpc,
      missing_review_full_details: missingReviewDetails,
      extra_in_rpc: extraInRpc,
      diagnosis: {
        issue: missingInRpc.length > 0
          ? 'RPC function is filtering out reviews that should be returned'
          : 'No missing reviews found',
        possible_causes: [
          'RLS policy on reviews table',
          'user_id mismatch',
          'Soft delete or hidden status',
          'RPC function WHERE clause too restrictive',
        ],
      }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
