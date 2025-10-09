import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

// API debug để kiểm tra timezone và scheduled_for
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug timezone and scheduled_for...');
    
    const now = new Date();
    const nowISO = now.toISOString();
    const nowLocal = now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
    
    console.log('🕐 Current time info:');
    console.log('  UTC ISO:', nowISO);
    console.log('  Local (GMT+7):', nowLocal);
    
    // Get all schedules with detailed info
    const { data: schedules, error: schedulesError } = await supabase
      .from('schedules')
      .select(`
        id,
        review_id,
        scheduled_for,
        status,
        created_at,
        updated_at
      `)
      .order('scheduled_for', { ascending: true });
    
    if (schedulesError) {
      console.log('❌ Error fetching schedules:', schedulesError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: schedulesError.message
      }, { status: 500 });
    }
    
    console.log(`📊 Found ${schedules.length} schedules`);
    
    const scheduleAnalysis = schedules.map(schedule => {
      const scheduledFor = new Date(schedule.scheduled_for);
      const scheduledForLocal = scheduledFor.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
      const isDue = scheduledFor <= now;
      const timeDiff = scheduledFor.getTime() - now.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));
      
      return {
        id: schedule.id,
        review_id: schedule.review_id,
        status: schedule.status,
        scheduled_for_raw: schedule.scheduled_for,
        scheduled_for_parsed: scheduledFor.toISOString(),
        scheduled_for_local: scheduledForLocal,
        is_due: isDue,
        minutes_until_due: minutesDiff,
        created_at: schedule.created_at,
        updated_at: schedule.updated_at
      };
    });
    
    // Test the query that manual-cron uses
    const { data: dueSchedules, error: dueError } = await supabase
      .from('schedules')
      .select('id, scheduled_for, status')
      .eq('status', 'pending')
      .lte('scheduled_for', nowISO);
    
    if (dueError) {
      console.log('❌ Error fetching due schedules:', dueError);
    } else {
      console.log(`📅 Due schedules (using .lte query): ${dueSchedules.length}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Timezone debug completed',
      data: {
        current_time: {
          utc_iso: nowISO,
          local_gmt7: nowLocal,
          timestamp: now.getTime()
        },
        schedules_analysis: scheduleAnalysis,
        due_schedules_count: dueSchedules?.length || 0,
        due_schedules: dueSchedules || []
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to debug timezone',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
