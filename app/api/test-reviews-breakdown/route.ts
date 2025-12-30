/**
 * TEST REVIEWS BREAKDOWN
 * So sánh kết quả query giữa các status filters
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  console.log('\n🔍 [TEST-REVIEWS-BREAKDOWN] Starting...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Create fresh client
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log('📊 Testing all query variations...');

  // =============================================
  // TEST 1: Query ALL reviews (no filter)
  // =============================================
  const { data: allReviews } = await supabase
    .from('reviews')
    .select('id, video_title, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log(`✅ ALL reviews: ${allReviews?.length || 0}`);

  // =============================================
  // TEST 2: Query PUBLISHED only
  // =============================================
  const { data: publishedReviews } = await supabase
    .from('reviews')
    .select('id, video_title, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  console.log(`✅ PUBLISHED reviews: ${publishedReviews?.length || 0}`);

  // =============================================
  // TEST 3: Query DRAFT only
  // =============================================
  const { data: draftReviews } = await supabase
    .from('reviews')
    .select('id, video_title, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  console.log(`✅ DRAFT reviews: ${draftReviews?.length || 0}`);

  // =============================================
  // VERIFICATION
  // =============================================
  const sum = (publishedReviews?.length || 0) + (draftReviews?.length || 0);
  const match = sum === (allReviews?.length || 0);

  console.log('\n🎯 VERIFICATION:');
  console.log(`   All: ${allReviews?.length || 0}`);
  console.log(`   Published: ${publishedReviews?.length || 0}`);
  console.log(`   Draft: ${draftReviews?.length || 0}`);
  console.log(`   Sum: ${sum}`);
  console.log(`   Match: ${match ? 'YES ✅' : 'NO ❌'}`);

  // List all reviews by status
  const byStatus: Record<string, any[]> = {};
  allReviews?.forEach(r => {
    if (!byStatus[r.status]) byStatus[r.status] = [];
    byStatus[r.status].push(r);
  });

  console.log('\n📋 Breakdown by status:');
  Object.entries(byStatus).forEach(([status, items]) => {
    console.log(`   ${status}: ${items.length}`);
  });

  return NextResponse.json({
    success: true,
    all: {
      count: allReviews?.length || 0,
      first5: allReviews?.slice(0, 5).map(r => ({
        id: r.id.substring(0, 8),
        status: r.status,
        title: r.video_title?.substring(0, 50),
      })),
    },
    published: {
      count: publishedReviews?.length || 0,
      first5: publishedReviews?.slice(0, 5).map(r => ({
        id: r.id.substring(0, 8),
        status: r.status,
        title: r.video_title?.substring(0, 50),
      })),
    },
    draft: {
      count: draftReviews?.length || 0,
      all: draftReviews?.map(r => ({
        id: r.id.substring(0, 8),
        status: r.status,
        title: r.video_title?.substring(0, 50),
      })),
    },
    verification: {
      allCount: allReviews?.length || 0,
      publishedCount: publishedReviews?.length || 0,
      draftCount: draftReviews?.length || 0,
      sum,
      match,
    },
    byStatus,
  });
}
