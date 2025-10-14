import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Reviews Filtering - Starting...');
    
    // 1. Get all published reviews
    const { data: allReviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('id, video_title, slug, created_at, status')
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    
    if (reviewsError) {
      throw new Error(`Reviews error: ${reviewsError.message}`);
    }
    
    // 2. Get used review IDs from schedules
    const { data: usedReviewIds, error: usedError } = await supabaseAdmin
      .from('schedules')
      .select('review_id, video_title, status')
      .not('review_id', 'is', null);
    
    if (usedError) {
      throw new Error(`Used IDs error: ${usedError.message}`);
    }
    
    // 3. Analyze filtering
    const usedIds = usedReviewIds?.map(item => item.review_id) || [];
    const availableReviews = allReviews?.filter(review => !usedIds.includes(review.id)) || [];
    
    // 4. Create detailed analysis
    const analysis = allReviews?.map(review => {
      const isUsed = usedIds.includes(review.id);
      const scheduleInfo = usedReviewIds?.find(s => s.review_id === review.id);
      
      return {
        reviewId: review.id,
        videoTitle: review.video_title,
        slug: review.slug,
        createdAt: review.created_at,
        isUsed: isUsed,
        scheduleStatus: scheduleInfo?.status || null,
        scheduleVideoTitle: scheduleInfo?.video_title || null,
        shouldShow: !isUsed
      };
    }) || [];
    
    // 5. Group by status
    const statusGroups = {
      total: allReviews?.length || 0,
      used: analysis.filter(a => a.isUsed).length,
      available: analysis.filter(a => !a.isUsed).length,
      usedReviews: analysis.filter(a => a.isUsed),
      availableReviews: analysis.filter(a => !a.isUsed)
    };
    
    return NextResponse.json({
      success: true,
      data: {
        summary: statusGroups,
        allReviews: analysis,
        usedReviewIds: usedIds,
        recommendations: {
          issues: statusGroups.used > 0 ? [
            `${statusGroups.used} reviews are already scheduled and should be filtered out`,
            'CreateScheduleDialog should only show available reviews'
          ] : [
            'No reviews are currently scheduled',
            'All reviews are available for scheduling'
          ],
          actions: [
            'Verify used-review-ids API is working correctly',
            'Check CreateScheduleDialog filtering logic',
            'Ensure schedules table has correct review_id references'
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug reviews filtering:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
