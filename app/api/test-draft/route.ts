import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  console.log('🔍 TEST DRAFT API - Bắt đầu kiểm tra...\n');

  // Test 1: Direct query
  const { data: directData, error: directError } = await supabase
    .from('reviews')
    .select('id, video_title, status, created_at')
    .eq('user_id', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  console.log('📊 Test 1 - DIRECT QUERY:');
  console.log('   Kết quả:', directData?.length || 0, 'reviews');
  if (directData && directData.length > 0) {
    directData.forEach(r => {
      console.log(`   - ${r.video_title?.substring(0, 50)} (${r.status})`);
    });
  }

  // Test 2: RPC function
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('get_user_reviews_by_status', {
      p_user_id: userId,
      p_status: 'draft'
    });

  console.log('\n📊 Test 2 - RPC FUNCTION:');
  console.log('   Kết quả:', rpcData?.length || 0, 'reviews');
  if (rpcData && rpcData.length > 0) {
    rpcData.forEach(r => {
      console.log(`   - ${r.video_title?.substring(0, 50)} (${r.status})`);
    });
  }

  // Test 3: All reviews (không filter)
  const { data: allData, error: allError } = await supabase
    .rpc('get_user_reviews', {
      p_user_id: userId
    });

  const drafts = allData?.filter(r => r.status === 'draft') || [];

  console.log('\n📊 Test 3 - ALL REVIEWS + filter JavaScript:');
  console.log('   Tổng reviews:', allData?.length || 0);
  console.log('   Draft reviews:', drafts.length);
  if (drafts.length > 0) {
    drafts.forEach(r => {
      console.log(`   - ${r.video_title?.substring(0, 50)} (${r.status})`);
    });
  }

  return NextResponse.json({
    success: true,
    tests: {
      direct: {
        count: directData?.length || 0,
        reviews: directData || [],
        error: directError
      },
      rpc: {
        count: rpcData?.length || 0,
        reviews: rpcData || [],
        error: rpcError
      },
      all_then_filter: {
        total: allData?.length || 0,
        drafts: drafts.length,
        reviews: drafts,
        error: allError
      }
    }
  });
}
