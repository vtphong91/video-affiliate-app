import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug-schedule-structure
 * Debug API để kiểm tra cấu trúc dữ liệu schedule
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging schedule structure...');

    // Get a sample schedule
    const { data: schedules, error } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .limit(1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching schedules:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch schedules',
        details: error
      }, { status: 500 });
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No schedules found' 
      }, { status: 404 });
    }

    const schedule = schedules[0];

    // Analyze the structure
    const analysis = {
      scheduleId: schedule.id,
      hasVideoTitle: !!schedule.video_title,
      hasReviews: !!schedule.reviews,
      videoTitle: schedule.video_title,
      reviews: schedule.reviews,
      allFields: Object.keys(schedule),
      structure: {
        id: typeof schedule.id,
        scheduled_for: typeof schedule.scheduled_for,
        post_message: typeof schedule.post_message,
        video_title: typeof schedule.video_title,
        reviews: typeof schedule.reviews,
        affiliate_links: typeof schedule.affiliate_links,
        status: typeof schedule.status,
        user_id: typeof schedule.user_id,
        review_id: typeof schedule.review_id,
        created_at: typeof schedule.created_at,
        updated_at: typeof schedule.updated_at
      }
    };

    console.log('📋 Schedule structure analysis:', analysis);

    return NextResponse.json({
      success: true,
      analysis,
      sampleSchedule: schedule,
      message: 'Schedule structure analyzed successfully'
    });

  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
