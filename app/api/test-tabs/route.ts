/**
 * TEST TABS FILTERING
 * Debug endpoint to test status filter tabs behavior
 */
// @ts-nocheck
import { NextResponse } from 'next/server';
import { getFreshSupabaseAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  console.log('\n🧪 [TEST-TABS] Testing tab filtering...');

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status'); // 'published', 'draft', or null (all)

  console.log(`📊 Status filter: ${statusFilter || 'all'}`);

  const supabase = getFreshSupabaseAdminClient() as any;

  // Build query based on status filter
  let query = supabase
    .from('reviews')
    .select('id, video_title, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Apply status filter if provided
  if (statusFilter && (statusFilter === 'published' || statusFilter === 'draft')) {
    console.log(`✅ Applying status filter: ${statusFilter}`);
    query = query.eq('status', statusFilter);
  } else {
    console.log('✅ No status filter - fetching all');
  }

  const { data: reviews, error } = await query;

  if (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }

  const total = reviews?.length || 0;
  const draftCount = reviews?.filter(r => r.status === 'draft').length || 0;
  const publishedCount = reviews?.filter(r => r.status === 'published').length || 0;

  console.log(`✅ Results: ${total} total (${draftCount} draft, ${publishedCount} published)`);

  return NextResponse.json({
    success: true,
    filter: statusFilter || 'all',
    results: {
      total,
      draftCount,
      publishedCount,
      reviews: reviews?.slice(0, 5).map(r => ({
        id: r.id.substring(0, 8),
        status: r.status,
        title: r.video_title?.substring(0, 60),
      })),
    },
  });
}
