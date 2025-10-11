import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { handleError, createErrorResponse, createSuccessResponse, logError } from '@/lib/utils/error-handler';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'draft', 'published', or null for all
    const excludeScheduled = searchParams.get('excludeScheduled') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const page = parseInt(searchParams.get('page') || '1');

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

    // Fetch reviews from database
    const reviews = await db.getReviews({ status, limit, offset: actualOffset });

    let filteredReviews = reviews;

    // If excludeScheduled is true, filter out reviews that already have schedules
    if (excludeScheduled) {
      const scheduledReviewIds = await db.getScheduledReviewIds();
      filteredReviews = reviews.filter(review => !scheduledReviewIds.includes(review.id));
    }

    // Get total count for pagination
    const totalCount = await db.getReviewsCount({ status });
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
