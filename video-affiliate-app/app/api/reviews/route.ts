import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'draft', 'published', or null for all
    const excludeScheduled = searchParams.get('excludeScheduled') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch reviews from database
    const reviews = await db.getReviews({ status, limit, offset });

    let filteredReviews = reviews;

    // If excludeScheduled is true, filter out reviews that already have schedules
    if (excludeScheduled) {
      const scheduledReviewIds = await db.getScheduledReviewIds();
      filteredReviews = reviews.filter(review => !scheduledReviewIds.includes(review.id));
    }

    return NextResponse.json({
      success: true,
      data: filteredReviews, // Changed from 'reviews' to 'data' for consistency
      total: filteredReviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
