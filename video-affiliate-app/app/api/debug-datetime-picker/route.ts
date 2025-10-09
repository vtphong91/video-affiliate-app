import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

// API debug chi tiết để kiểm tra dữ liệu từ datetime picker
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debugging datetime picker data...');
    
    const body = await request.json();
    console.log('📋 Full request body:', JSON.stringify(body, null, 2));
    
    const { reviewId, scheduledFor, targetType, targetId, targetName, postMessage, landingPageUrl } = body;
    
    // Log all received data
    console.log('📅 Received data:');
    console.log('  reviewId:', reviewId);
    console.log('  scheduledFor:', scheduledFor);
    console.log('  targetType:', targetType);
    console.log('  targetId:', targetId);
    console.log('  targetName:', targetName);
    console.log('  postMessage:', postMessage);
    console.log('  landingPageUrl:', landingPageUrl);
    
    // Validate required fields
    if (!reviewId) {
      return NextResponse.json({
        success: false,
        error: 'ReviewId is required'
      }, { status: 400 });
    }
    
    if (!scheduledFor) {
      return NextResponse.json({
        success: false,
        error: 'ScheduledFor is required'
      }, { status: 400 });
    }
    
    // Parse scheduledFor
    const scheduledDate = new Date(scheduledFor);
    console.log('📅 Parsed scheduledFor:');
    console.log('  Original string:', scheduledFor);
    console.log('  Parsed date:', scheduledDate.toISOString());
    console.log('  Local time (GMT+7):', scheduledDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    console.log('  UTC time:', scheduledDate.toLocaleString('vi-VN', { timeZone: 'UTC' }));
    
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
    
    // Use the scheduledFor from request (not create new time)
    const scheduledForUTC = scheduledDate.toISOString();
    console.log('📅 Final scheduledForUTC:', scheduledForUTC);
    
    // Create schedule with real data
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .insert({
        user_id: 'default-user-id',
        review_id: reviewId,
        scheduled_for: scheduledForUTC, // Use the time from datetime picker
        timezone: 'Asia/Ho_Chi_Minh',
        target_type: targetType || 'page',
        target_id: targetId || 'make-com-handled',
        target_name: targetName || 'Make.com Auto',
        post_message: postMessage || realPostMessage,
        landing_page_url: landingPageUrl || landingUrl,
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
    console.log('📅 Schedule data:', {
      id: schedule.id,
      scheduled_for: schedule.scheduled_for,
      timezone: schedule.timezone,
    });
    
    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Schedule created successfully with datetime picker data',
      debug: {
        receivedScheduledFor: scheduledFor,
        parsedScheduledFor: scheduledDate.toISOString(),
        finalScheduledFor: scheduledForUTC,
        localTime: scheduledDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        utcTime: scheduledDate.toLocaleString('vi-VN', { timeZone: 'UTC' }),
      },
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
