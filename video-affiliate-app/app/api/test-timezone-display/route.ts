import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

// API test timezone display
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing timezone display...');
    
    // Get latest schedules
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(2);
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: error.message
      }, { status: 500 });
    }
    
    const now = new Date();
    
    const timezoneTests = schedules.map(schedule => {
      const scheduledFor = new Date(schedule.scheduled_for);
      
      return {
        scheduleId: schedule.id,
        reviewId: schedule.review_id,
        databaseTime: schedule.scheduled_for,
        parsedTime: scheduledFor.toISOString(),
        localDisplay: scheduledFor.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        utcDisplay: scheduledFor.toLocaleString('vi-VN', { timeZone: 'UTC' }),
        isOverdue: scheduledFor.getTime() < now.getTime(),
        timezoneOffset: schedule.timezone,
        verification: {
          utcToLocal: new Date(scheduledFor.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' })).toISOString(),
          currentTime: now.toISOString(),
          currentLocal: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        }
      };
    });
    
    return NextResponse.json({
      success: true,
      message: 'Timezone display test completed',
      data: {
        schedules: timezoneTests,
        currentTime: {
          utc: now.toISOString(),
          local: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test timezone display',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
