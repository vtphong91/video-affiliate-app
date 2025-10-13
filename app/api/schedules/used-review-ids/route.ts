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
      .select('review_id')
      .not('review_id', 'is', null);

    if (error) {
      console.error('❌ Error fetching used review IDs:', error);
      return NextResponse.json({ error: 'Failed to fetch used review IDs' }, { status: 500 });
    }

    const reviewIds = usedReviewIds?.map(item => item.review_id) || [];
    
    console.log(`✅ Found ${reviewIds.length} used review IDs:`, reviewIds);

    return NextResponse.json({ 
      success: true, 
      usedReviewIds: reviewIds 
    });
  } catch (error) {
    console.error('❌ Unhandled error fetching used review IDs:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
