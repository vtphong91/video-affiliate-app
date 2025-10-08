import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Simple API để test với dữ liệu thật đơn giản
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing with simple real data...');
    
    const reviewId = '45e448df-d4ef-4d5d-9303-33109f9d6c30';
    
    // Get review data
    const review = await db.getReview(reviewId);
    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found'
      }, { status: 404 });
    }
    
    console.log('✅ Review found:', review.video_title);
    
    // Create simple real data
    const realPostMessage = `🔥 ${review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}\n\n🔗 Đọc review đầy đủ: https://yourdomain.com/review/${review.slug}`;
    const realLandingUrl = `https://yourdomain.com/review/${review.slug}`;
    
    console.log('📝 Generated simple real post message:', realPostMessage.substring(0, 100) + '...');
    
    // Create schedule
    const scheduleData = {
      user_id: 'default-user-id',
      review_id: reviewId,
      scheduled_for: '2025-01-08T22:00:00.000Z',
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: 'page',
      target_id: 'make-com-handled',
      target_name: 'Make.com Auto',
      post_message: realPostMessage, // Real post message
      landing_page_url: realLandingUrl, // Real landing URL
      status: 'pending' as const,
      retry_count: 0,
      max_retries: 3,
    };
    
    console.log('📤 Creating schedule with simple real data...');
    const schedule = await db.createSchedule(scheduleData);
    console.log('✅ Schedule created:', schedule.id);
    
    return NextResponse.json({
      success: true,
      message: 'Simple real data schedule created successfully',
      data: {
        scheduleId: schedule.id,
        reviewTitle: review.video_title,
        postMessagePreview: realPostMessage.substring(0, 200) + '...',
        landingUrl: realLandingUrl
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create schedule with simple real data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
