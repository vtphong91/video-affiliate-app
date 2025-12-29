import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import { getAllReviewsForUser, excludeScheduledReviews } from '@/lib/services/review-service';

export const dynamic = 'force-dynamic';

// GET /api/reviews-fast - Fast reviews API for dropdown (excludes scheduled reviews)
export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Fast reviews API called');

    const startTime = Date.now();

    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request);
    console.log('👤 User ID for reviews-fast:', userId);

    if (!userId) {
      console.log('❌ No user ID found, returning 401');
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // Fetch all reviews for user
    const allReviews = await getAllReviewsForUser(userId);

    // ✅ CRITICAL: Exclude reviews that are already scheduled
    const availableReviews = await excludeScheduledReviews(allReviews);

    // Only return essential fields for dropdown
    const reviewsForDropdown = availableReviews.map(review => ({
      id: review.id,
      video_title: review.video_title,
      slug: review.slug,
      created_at: review.created_at,
      affiliate_links: review.affiliate_links,
      status: review.status
    }));

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`✅ Fast reviews: ${reviewsForDropdown.length} available (excluded ${allReviews.length - availableReviews.length} scheduled) in ${duration}ms`);

    // ✅ Add aggressive cache-control headers to prevent any caching
    const response = NextResponse.json({
      success: true,
      data: reviewsForDropdown,
      duration: `${duration}ms`,
      message: 'Fast reviews fetched successfully'
    });

    // Disable all caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('❌ Exception in fast reviews API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
