import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Ultra simple API để fix vấn đề reviewId
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Ultra simple fix for reviewId issue...');
    
    const body = await request.json();
    const reviewId = body.reviewId;
    
    console.log('📋 ReviewId from request:', reviewId);
    
    if (!reviewId) {
      return NextResponse.json({
        success: false,
        error: 'ReviewId is required'
      }, { status: 400 });
    }
    
    // Get review data
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
    
    // Generate real data
    const landingUrl = `https://yourdomain.com/review/${review.slug}`;
    const realPostMessage = `🔥 ${review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}\n\n🔗 Đọc review đầy đủ: ${landingUrl}`;
    
    // Convert scheduledFor to proper timezone
    let scheduledForUTC;
    if (body.scheduledFor) {
      // Parse the incoming date and ensure it's treated as UTC
      const scheduledDate = new Date(body.scheduledFor);
      scheduledForUTC = scheduledDate.toISOString();
      console.log('📅 Scheduled time conversion:');
      console.log('  Input:', body.scheduledFor);
      console.log('  Parsed:', scheduledDate.toISOString());
      console.log('  Local (GMT+7):', scheduledDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    } else {
      // Fallback to tomorrow 9:00 AM GMT+7
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      scheduledForUTC = tomorrow.toISOString();
    }
    
    // Create schedule with real data
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .insert({
        user_id: 'default-user-id',
        review_id: reviewId, // Use reviewId from request
        scheduled_for: scheduledForUTC,
        timezone: 'Asia/Ho_Chi_Minh',
        target_type: body.targetType || 'page',
        target_id: 'make-com-handled',
        target_name: 'Make.com Auto',
        post_message: realPostMessage, // Real post message
        landing_page_url: landingUrl, // Real landing URL
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
      message: 'Schedule created successfully with real data',
      reviewInfo: {
        id: review.id,
        title: review.video_title,
        slug: review.slug
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
