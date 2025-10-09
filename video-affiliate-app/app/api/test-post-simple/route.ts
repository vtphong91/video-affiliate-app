import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Ultra simple POST test
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Ultra simple POST test...');
    
    // Test 1: Parse body
    const body = await request.json();
    console.log('📋 Body parsed:', body);
    
    // Test 2: Get review from request body
    const reviewId = body.reviewId;
    console.log('📋 Using reviewId from request:', reviewId);
    
    if (!reviewId) {
      return NextResponse.json({
        success: false,
        error: 'ReviewId is required'
      }, { status: 400 });
    }
    
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, video_title, slug, summary, video_url')
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
    
    // Test 3: Generate real data
    const landingUrl = `https://yourdomain.com/review/${review.slug}`;
    const realPostMessage = `🔥 ${review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}\n\n🔗 Đọc review đầy đủ: ${landingUrl}`;
    
    console.log('📝 Generated real data:', {
      landingUrl,
      postMessageLength: realPostMessage.length
    });
    
    // Test 4: Create schedule
    const scheduleData = {
      user_id: 'default-user-id',
      review_id: reviewId, // Use reviewId from request
      scheduled_for: body.scheduledFor || '2025-01-08T23:00:00.000Z',
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: body.targetType || 'page',
      target_id: 'make-com-handled',
      target_name: 'Make.com Auto',
      post_message: realPostMessage, // Real post message
      landing_page_url: landingUrl, // Real landing URL
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
    };
    
    console.log('📤 Creating schedule...');
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .insert(scheduleData)
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
      message: 'Schedule created successfully with real data'
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
