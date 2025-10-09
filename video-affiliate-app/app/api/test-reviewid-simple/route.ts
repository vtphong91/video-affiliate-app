import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Ultra simple test với reviewId từ request
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Ultra simple test with request reviewId...');
    
    const body = await request.json();
    const reviewId = body.reviewId;
    
    console.log('📋 ReviewId from request:', reviewId);
    
    if (!reviewId) {
      return NextResponse.json({
        success: false,
        error: 'ReviewId is required'
      }, { status: 400 });
    }
    
    // Test 1: Get review
    console.log('🔍 Getting review...');
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, video_title')
      .eq('id', reviewId)
      .single();
    
    if (reviewError) {
      console.log('❌ Review error:', reviewError);
      return NextResponse.json({
        success: false,
        error: 'Review not found',
        details: reviewError.message
      }, { status: 404 });
    }
    
    console.log('✅ Review found:', review.video_title);
    
    // Test 2: Simple insert
    console.log('🔍 Creating simple schedule...');
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .insert({
        user_id: 'default-user-id',
        review_id: reviewId, // Use reviewId from request
        scheduled_for: '2025-01-08T23:00:00.000Z',
        timezone: 'Asia/Ho_Chi_Minh',
        target_type: 'page',
        target_id: 'make-com-handled',
        target_name: 'Make.com Auto',
        post_message: `Test message for ${review.video_title}`,
        landing_page_url: `https://test.com/review/${reviewId}`,
        status: 'pending',
        retry_count: 0,
        max_retries: 3,
      })
      .select()
      .single();
    
    if (scheduleError) {
      console.log('❌ Schedule error:', scheduleError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create schedule',
        details: scheduleError.message
      }, { status: 500 });
    }
    
    console.log('✅ Schedule created:', schedule.id);
    
    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Schedule created successfully',
      reviewInfo: {
        id: review.id,
        title: review.video_title
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create schedule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
