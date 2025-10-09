import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Ultra simple API để tạo schedule với dữ liệu thật
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Ultra simple schedule creation...');
    
    const body = await request.json();
    console.log('📋 Body:', body);
    
    const reviewId = body.reviewId || '45e448df-d4ef-4d5d-9303-33109f9d6c30';
    const scheduledFor = body.scheduledFor || '2025-01-08T23:00:00.000Z';
    const targetType = body.targetType || 'page';
    
    console.log('📝 Using values:', { reviewId, scheduledFor, targetType });
    
    // Get review data
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
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
    
    if (!review) {
      console.log('❌ No review found');
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }
    
    console.log('✅ Review found:', review.video_title);
    
    // Generate real data
    const landingUrl = `https://yourdomain.com/review/${review.slug}`;
    const realPostMessage = `🔥 ${review.custom_title || review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}\n\n🔗 Đọc review đầy đủ: ${landingUrl}`;
    
    console.log('📝 Generated real data:', {
      landingUrl,
      postMessageLength: realPostMessage.length
    });
    
    // Create schedule
    const scheduleData = {
      user_id: 'default-user-id',
      review_id: reviewId,
      scheduled_for: scheduledFor,
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: targetType,
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
