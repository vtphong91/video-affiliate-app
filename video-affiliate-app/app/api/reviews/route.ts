import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'draft', 'published', or null for all
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch reviews from database
    const reviews = await db.getReviews({ status, limit, offset });

    return NextResponse.json({
      success: true,
      reviews,
      total: reviews.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
