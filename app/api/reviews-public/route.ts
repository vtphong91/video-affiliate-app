import { NextRequest, NextResponse } from 'next/server';
import { getAllPublishedReviews } from '@/lib/services/review-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🌐 Public Reviews API called');

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate parameters
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Fetch all published reviews
    const allReviews = await getAllPublishedReviews();

    // Apply pagination
    const reviews = allReviews.slice(offset, offset + limit);
    const totalCount = allReviews.length;

    console.log(`✅ Returning ${reviews.length} published reviews (total: ${totalCount})`);

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: Math.floor(offset / limit) + 1,
        pagination: {
          limit,
          offset,
          hasMore: (offset + limit) < totalCount,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error in public reviews API:', error);

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
