import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Simple API để tạo schedule với dữ liệu thật
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Creating schedule with real data...');
    
    const body = await request.json();
    const { reviewId, scheduledFor, targetType } = body;
    
    // Get review data
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', reviewId)
      .single();
    
    if (reviewError || !review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found',
        details: reviewError?.message
      }, { status: 404 });
    }
    
    console.log('✅ Review found:', review.video_title);
    
    // Generate real data
    const landingUrl = `https://yourdomain.com/review/${review.slug}`;
    const realPostMessage = `🔥 ${review.custom_title || review.video_title}\n\n${review.summary}\n\n📺 Xem video: ${review.video_url}\n\n🔗 Đọc review đầy đủ: ${landingUrl}`;
    
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
    
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .insert(scheduleData)
      .select()
      .single();
    
    if (scheduleError) {
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

// GET endpoint để lấy schedules
export async function GET(request: NextRequest) {
  try {
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: error.message
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: {
        schedules: schedules || [],
        pagination: {
          page: 1,
          limit: schedules?.length || 0,
          total: schedules?.length || 0,
          totalPages: 1,
        },
      },
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch schedules',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
