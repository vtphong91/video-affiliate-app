import { NextRequest, NextResponse } from 'next/server';
import { db, supabaseAdmin } from '@/lib/db/supabase';
import { handleError, createErrorResponse, createSuccessResponse, logError } from '@/lib/utils/error-handler';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Reviews API called');
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'draft', 'published', or null for all
    const excludeScheduled = searchParams.get('excludeScheduled') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const page = parseInt(searchParams.get('page') || '1');

    console.log('🔍 Reviews API params:', { status, excludeScheduled, limit, offset, page });

    // Get authenticated user ID
    console.log('🔍 Getting user ID from request...');
    const userId = await getUserIdFromRequest(request);
    console.log('🔍 User ID result:', userId);
    
    if (!userId) {
      console.log('❌ No user ID found, returning 401');
      return NextResponse.json(
        createErrorResponse('AUTHENTICATION_ERROR', 'Authentication required'),
        { status: 401 }
      );
    }

    console.log('👤 Authenticated user ID for reviews:', userId);

    // Calculate offset from page if page is provided
    const actualOffset = page ? (page - 1) * limit : offset;

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Limit must be between 1 and 100'),
        { status: 400 }
      );
    }

    if (actualOffset < 0) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Offset must be non-negative'),
        { status: 400 }
      );
    }

    // Fetch reviews from database (user-specific)
    const reviews = await db.getReviews({ userId, status, limit, offset: actualOffset });

    let filteredReviews = reviews;

    // If excludeScheduled is true, filter out reviews that already have schedules
    if (excludeScheduled) {
      const { data: scheduledReviews, error } = await supabaseAdmin
        .from('schedules')
        .select('review_id')
        .not('review_id', 'is', null);
      
      if (error) {
        console.error('❌ Error fetching scheduled review IDs:', error);
        // Continue without filtering if there's an error
      } else {
        const scheduledReviewIds = scheduledReviews?.map(item => item.review_id) || [];
        filteredReviews = reviews.filter(review => !scheduledReviewIds.includes(review.id));
      }
    }

    // Get total count for pagination (user-specific)
    const totalCount = await db.getReviewsCount({ userId, status });
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      createSuccessResponse({
        reviews: filteredReviews,
        total: totalCount,
        totalPages,
        currentPage: page,
        pagination: {
          limit,
          offset: actualOffset,
          hasMore: filteredReviews.length === limit,
        },
      })
    );
  } catch (error) {
    const appError = handleError(error);
    logError(appError, 'GET /api/reviews');
    
    return NextResponse.json(
      createErrorResponse('DATABASE_ERROR', 'Failed to fetch reviews', appError.details),
      { status: 500 }
    );
  }
}
