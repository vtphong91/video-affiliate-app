import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/schedules/used-review-ids
 * Lấy danh sách review IDs đã được sử dụng trong schedules
 *
 * Logic: Review đã có lịch đăng bài (bất kể status) thì KHÔNG cho phép tạo lịch nữa
 * ⚠️ IMPORTANT: Chỉ lấy schedules của user hiện tại
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching used review IDs...');

    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request);
    console.log('👤 User ID for used-review-ids:', userId);

    if (!userId) {
      console.log('❌ No user ID found, returning 401');
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    const { data: schedules, error } = await supabaseAdmin
      .from('schedules')
      .select('review_id, video_title, status, created_at, user_id')
      .eq('user_id', userId) // ⚠️ CRITICAL: Only get schedules of current user
      .not('review_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching used review IDs:', error);
      return NextResponse.json({ error: 'Failed to fetch used review IDs' }, { status: 500 });
    }

    // Get unique review IDs (một review có thể có nhiều lịch, chỉ lấy 1 lần)
    const uniqueReviewIds = [...new Set(schedules?.map(item => item.review_id) || [])];

    console.log(`✅ Found ${schedules?.length || 0} total schedules for user ${userId}`);
    console.log(`✅ Found ${uniqueReviewIds.length} unique reviews with schedules:`, uniqueReviewIds);
    console.log('🔍 Schedule details:', schedules?.map(item => ({
      reviewId: item.review_id,
      videoTitle: item.video_title,
      status: item.status,
      userId: item.user_id,
      createdAt: item.created_at
    })));

    return NextResponse.json({
      success: true,
      usedReviewIds: uniqueReviewIds,
      scheduleDetails: schedules || []
    });
  } catch (error) {
    console.error('❌ Unhandled error fetching used review IDs:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}


