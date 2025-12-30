import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { getUnscheduledReviews } from '@/lib/services/schedule-filter-service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews-unscheduled
 *
 * Trả về danh sách reviews CHƯA BAO GIỜ có trong schedules
 * Logic: Query schedules trước → Filter reviews sau
 */
export async function GET(request: NextRequest) {
  try {
    console.log('\n🚀 ========================================');
    console.log('🚀 [API] /api/reviews-unscheduled called');
    console.log('🚀 ========================================\n');

    const startTime = Date.now();

    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      console.log('❌ No user ID - returning 401');
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    console.log(`👤 Authenticated user: ${userId}\n`);

    // Call new service function
    const unscheduledReviews = await getUnscheduledReviews(userId);

    // Map to dropdown format (only essential fields)
    const reviewsForDropdown = unscheduledReviews.map(review => ({
      id: review.id,
      video_title: review.video_title,
      slug: review.slug,
      created_at: review.created_at,
      affiliate_links: review.affiliate_links,
      status: review.status
    }));

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`\n⏱️  Total duration: ${duration}ms`);
    console.log('🚀 ========================================\n');

    // Return with aggressive no-cache headers
    const response = NextResponse.json({
      success: true,
      data: reviewsForDropdown,
      count: reviewsForDropdown.length,
      duration: `${duration}ms`,
      message: 'Unscheduled reviews fetched successfully'
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ Exception in /api/reviews-unscheduled:');
    console.error(error);
    console.error('❌ ========================================\n');

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
