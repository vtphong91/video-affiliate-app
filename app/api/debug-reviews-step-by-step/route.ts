import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// GET /api/debug-reviews-step-by-step - Debug reviews step by step
export async function GET() {
  try {
    console.log('🔍 Debug Reviews Step by Step API called');
    
    // Step 1: Check total count
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('reviews')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.log('❌ Count error:', countError);
      return NextResponse.json({
        success: false,
        error: 'Count error',
        details: countError
      });
    }
    
    console.log('✅ Total reviews count:', totalCount);
    
    // Step 2: Get all reviews with video_title
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('reviews')
      .select('id, video_title, slug, user_id, created_at')
      .order('created_at', { ascending: false });
    
    if (reviewsError) {
      console.log('❌ Reviews error:', reviewsError);
      return NextResponse.json({
        success: false,
        error: 'Reviews error',
        details: reviewsError
      });
    }
    
    console.log('✅ Reviews fetched:', reviews?.length || 0);
    
    // Step 3: Check video_title distribution
    const hasVideoTitle = reviews?.filter(r => r.video_title && r.video_title.trim() !== '').length || 0;
    const missingVideoTitle = (reviews?.length || 0) - hasVideoTitle;
    
    // Step 4: Check user_id distribution
    const userDistribution = reviews?.reduce((acc, review) => {
      acc[review.user_id] = (acc[review.user_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    return NextResponse.json({
      success: true,
      debug: {
        totalCount,
        reviewsCount: reviews?.length || 0,
        hasVideoTitle,
        missingVideoTitle,
        userDistribution,
        sampleReviews: reviews?.slice(0, 3) || []
      }
    });

  } catch (error) {
    console.error('❌ Unhandled error in debug reviews:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unhandled error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}


