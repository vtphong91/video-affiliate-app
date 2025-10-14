import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/schedules/used-review-ids
 * Lấy danh sách review IDs đã được sử dụng trong schedules
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching used review IDs...');

    const { data: usedReviewIds, error } = await supabaseAdmin
      .from('schedules')
      .select('review_id, video_title, status, created_at')
      .not('review_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching used review IDs:', error);
      return NextResponse.json({ error: 'Failed to fetch used review IDs' }, { status: 500 });
    }

    const reviewIds = usedReviewIds?.map(item => item.review_id) || [];
    
    console.log(`✅ Found ${reviewIds.length} used review IDs:`, reviewIds);
    console.log('🔍 Used review details:', usedReviewIds?.map(item => ({
      reviewId: item.review_id,
      videoTitle: item.video_title,
      status: item.status,
      createdAt: item.created_at
    })));

    return NextResponse.json({ 
      success: true, 
      usedReviewIds: reviewIds,
      usedReviewDetails: usedReviewIds || []
    });
  } catch (error) {
    console.error('❌ Unhandled error fetching used review IDs:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}


