import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET /api/test-reviews-no-auth - Test reviews without authentication
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Reviews No Auth API called');
    
    // Get all reviews (no user filtering for testing) - use actual column names
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select(`
        id, 
        slug,
        video_title,
        video_url, 
        video_platform, 
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false });
    
    if (reviewsError) {
      console.log('❌ Error fetching reviews:', reviewsError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch reviews',
          details: reviewsError
        },
        { status: 500 }
      );
    }
    
    console.log('✅ Reviews fetched:', reviews?.length || 0, 'reviews');
    
    return NextResponse.json({
      success: true,
      data: {
        reviews: reviews || [],
        total: reviews?.length || 0,
        message: 'This endpoint bypasses authentication for testing'
      }
    });

  } catch (error) {
    console.error('❌ Unhandled error in test reviews no auth:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
