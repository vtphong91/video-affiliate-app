import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Test endpoint to verify RPC functions work correctly
 * Compares RPC results vs old buggy SDK method
 */
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

  try {
    // ✅ Test 1: Get actual database count
    const { count: actualCount, error: countError } = await admin
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // ✅ Test 2: RPC function (SHOULD BE CORRECT)
    const { data: rpcReviews, error: rpcError } = await admin
      .rpc('get_user_reviews', { p_user_id: userId });

    // ✅ Test 3: Old buggy SDK method for comparison
    const { data: sdkReviews, error: sdkError } = await admin
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // ✅ Test 4: SDK without ORDER BY
    const { data: sdkNoOrder, error: sdkNoOrderError } = await admin
      .from('reviews')
      .select('*')
      .eq('user_id', userId);

    // ✅ Test 5: Test status filter RPC
    const { data: publishedRpc, error: publishedError } = await admin
      .rpc('get_user_reviews_by_status', {
        p_user_id: userId,
        p_status: 'published'
      });

    const { data: publishedSdk } = await admin
      .from('reviews')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    // Find missing reviews
    const rpcIds = new Set(rpcReviews?.map(r => r.id) || []);
    const sdkIds = new Set(sdkReviews?.map(r => r.id) || []);
    const sdkNoOrderIds = new Set(sdkNoOrder?.map(r => r.id) || []);

    const missingInSdk = rpcReviews?.filter(r => !sdkIds.has(r.id)) || [];
    const missingInSdkNoOrder = rpcReviews?.filter(r => !sdkNoOrderIds.has(r.id)) || [];

    return NextResponse.json({
      summary: {
        database_actual_count: actualCount,
        rpc_count: rpcReviews?.length || 0,
        sdk_with_order_count: sdkReviews?.length || 0,
        sdk_no_order_count: sdkNoOrder?.length || 0,
        rpc_is_correct: (rpcReviews?.length || 0) === actualCount,
        sdk_with_order_buggy: (sdkReviews?.length || 0) !== actualCount,
        sdk_no_order_buggy: (sdkNoOrder?.length || 0) !== actualCount,
      },
      bugs_found: {
        missing_in_sdk_with_order: missingInSdk.length,
        missing_in_sdk_no_order: missingInSdkNoOrder.length,
        missing_reviews_ids: missingInSdk.map(r => r.id),
      },
      status_filter_test: {
        published_rpc_count: publishedRpc?.length || 0,
        published_sdk_count: publishedSdk?.length || 0,
        match: (publishedRpc?.length || 0) === (publishedSdk?.length || 0),
      },
      rpc_sample: {
        first_5_reviews: rpcReviews?.slice(0, 5).map(r => ({
          id: r.id,
          created_at: r.created_at,
          title: r.video_title,
          status: r.status
        })),
        last_5_reviews: rpcReviews?.slice(-5).map(r => ({
          id: r.id,
          created_at: r.created_at,
          title: r.video_title,
          status: r.status
        })),
      },
      sdk_sample: {
        first_5_reviews: sdkReviews?.slice(0, 5).map(r => ({
          id: r.id,
          created_at: r.created_at,
          title: r.video_title,
          status: r.status
        })),
      },
      verdict: {
        rpc_solution_works: (rpcReviews?.length || 0) === actualCount,
        old_sdk_broken: (sdkReviews?.length || 0) !== actualCount,
        recommendation: (rpcReviews?.length || 0) === actualCount
          ? '✅ RPC solution is working perfectly! Deploy to production.'
          : '❌ RPC functions not working. Check SQL migration.',
      },
      errors: {
        rpc_error: rpcError?.message || null,
        sdk_error: sdkError?.message || null,
        sdk_no_order_error: sdkNoOrderError?.message || null,
        published_error: publishedError?.message || null,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Test RPC error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
