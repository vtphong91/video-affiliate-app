import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Debug API để xem lỗi chi tiết
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug schedules API...');
    
    const reviewId = '45e448df-d4ef-4d5d-9303-33109f9d6c30';
    
    // Test 1: Get review
    console.log('📋 Step 1: Getting review...');
    const review = await db.getReview(reviewId);
    console.log('✅ Review found:', review ? 'Yes' : 'No');
    
    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found',
        step: 'getReview'
      }, { status: 404 });
    }
    
    console.log('📝 Review details:', {
      id: review.id,
      title: review.video_title,
      slug: review.slug,
      summary: review.summary ? 'Has summary' : 'No summary'
    });
    
    // Test 2: Generate simple data
    console.log('📝 Step 2: Generating simple data...');
    const landingUrl = `https://yourdomain.com/review/${review.slug}`;
    const realPostMessage = `🔥 ${review.custom_title || review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}\n\n🔗 Đọc review đầy đủ: ${landingUrl}`;
    
    console.log('✅ Generated data:', {
      landingUrl,
      postMessageLength: realPostMessage.length
    });
    
    // Test 3: Create schedule
    console.log('📤 Step 3: Creating schedule...');
    const scheduleData = {
      user_id: 'default-user-id',
      review_id: reviewId,
      scheduled_for: '2025-01-08T22:30:00.000Z',
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: 'page',
      target_id: 'make-com-handled',
      target_name: 'Make.com Auto',
      post_message: realPostMessage,
      landing_page_url: landingUrl,
      status: 'pending' as const,
      retry_count: 0,
      max_retries: 3,
    };
    
    const schedule = await db.createSchedule(scheduleData);
    console.log('✅ Schedule created:', schedule.id);
    
    return NextResponse.json({
      success: true,
      message: 'Debug successful',
      data: {
        scheduleId: schedule.id,
        reviewTitle: review.video_title,
        postMessagePreview: realPostMessage.substring(0, 100) + '...',
        landingUrl: landingUrl
      }
    });
    
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
