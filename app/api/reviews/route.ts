import { NextRequest, NextResponse } from 'next/server';
import { handleError, createErrorResponse, createSuccessResponse, logError } from '@/lib/utils/error-handler';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';
import {
  getPaginatedReviews,
  excludeScheduledReviews
} from '@/lib/services/review-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Reviews API called');

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as 'draft' | 'published' | null;
    const excludeScheduled = searchParams.get('excludeScheduled') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    console.log('📋 Params:', { status, excludeScheduled, limit, page });
    console.log('🔍 [DEBUG] status type:', typeof status, '| value:', status, '| statusFilter will be:', status || undefined);

    // Get authenticated user ID
    const userId = await getUserIdFromRequest(request);

    if (!userId) {
      console.log('❌ No user ID found');
      return NextResponse.json(
        createErrorResponse('AUTHENTICATION_ERROR', 'Authentication required'),
        { status: 401 }
      );
    }

    console.log('👤 User ID:', userId);

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Limit must be between 1 and 100'),
        { status: 400 }
      );
    }

    if (page < 1) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Page must be >= 1'),
        { status: 400 }
      );
    }

    // Fetch paginated reviews using service
    const result = await getPaginatedReviews(
      userId,
      page,
      limit,
      status || undefined
    );

    let finalReviews = result.reviews;

    // Exclude scheduled reviews if requested
    if (excludeScheduled) {
      finalReviews = await excludeScheduledReviews(result.reviews);
    }

    console.log(`✅ Returning ${finalReviews.length} reviews (total: ${result.total})`);

    // ✅ LOG DETAILED REVIEW STATUS for debugging
    console.log('📊 [REVIEWS API] Status breakdown:');
    const draftCount = finalReviews.filter(r => r.status === 'draft').length;
    const publishedCount = finalReviews.filter(r => r.status === 'published').length;
    console.log(`   - Draft: ${draftCount}`);
    console.log(`   - Published: ${publishedCount}`);
    if (draftCount > 0) {
      console.log('📝 [DRAFT REVIEWS]:');
      finalReviews.filter(r => r.status === 'draft').forEach(r => {
        console.log(`   - ${r.id.substring(0, 8)}: ${r.video_title?.substring(0, 50)} (${r.status})`);
      });
    }

    // ✅ Add aggressive cache-control headers to prevent any caching
    const response = NextResponse.json(
      createSuccessResponse({
        reviews: finalReviews,
        total: result.total,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        pagination: {
          limit,
          offset: (page - 1) * limit,
          hasMore: page < result.totalPages,
        },
      })
    );

    // Disable all caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    const appError = handleError(error);
    logError(appError, 'GET /api/reviews');

    return NextResponse.json(
      createErrorResponse('DATABASE_ERROR', 'Failed to fetch reviews', appError.details),
      { status: 500 }
    );
  }
}
