import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

// API test timezone fix
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing timezone fix...');
    
    const body = await request.json();
    const { scheduledFor, reviewId } = body;
    
    if (!scheduledFor || !reviewId) {
      return NextResponse.json({
        success: false,
        error: 'scheduledFor and reviewId are required'
      }, { status: 400 });
    }
    
    console.log('📅 Input scheduledFor:', scheduledFor);
    
    // Parse the date
    const inputDate = new Date(scheduledFor);
    console.log('📅 Parsed date:', inputDate.toISOString());
    console.log('📅 Local time (GMT+7):', inputDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    
    // Convert to UTC (subtract 7 hours for GMT+7)
    const utcDate = new Date(inputDate.getTime() - (7 * 60 * 60 * 1000));
    console.log('📅 UTC time:', utcDate.toISOString());
    console.log('📅 Verification (UTC->GMT+7):', utcDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
    
    // Get review data
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id, video_title, slug')
      .eq('id', reviewId)
      .single();
    
    if (reviewError) {
      return NextResponse.json({
        success: false,
        error: 'Review not found',
        details: reviewError.message
      }, { status: 404 });
    }
    
    // Create schedule with proper timezone conversion
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .insert({
        user_id: 'default-user-id',
        review_id: reviewId,
        scheduled_for: utcDate.toISOString(),
        timezone: 'Asia/Ho_Chi_Minh',
        target_type: 'page',
        target_id: 'make-com-handled',
        target_name: 'Make.com Auto',
        post_message: `Test schedule for ${review.video_title}`,
        landing_page_url: `https://yourdomain.com/review/${review.slug}`,
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
    
    console.log('✅ Schedule created with timezone fix:', schedule.id);
    
    return NextResponse.json({
      success: true,
      message: 'Schedule created with timezone fix',
      data: {
        scheduleId: schedule.id,
        reviewTitle: review.video_title,
        timezoneConversion: {
          input: scheduledFor,
          parsed: inputDate.toISOString(),
          local: inputDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          utc: utcDate.toISOString(),
          stored: schedule.scheduled_for,
          verification: utcDate.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test timezone fix',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
