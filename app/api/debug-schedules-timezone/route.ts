import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Schedules Timezone API called');
    
    // Get current time in different formats
    const now = new Date();
    const nowISO = now.toISOString();
    const nowGMT7 = new Date(now.getTime() + (7 * 60 * 60 * 1000)).toISOString();
    
    console.log('🕐 Current time:', {
      local: now.toLocaleString(),
      iso: nowISO,
      gmt7: nowGMT7
    });
    
    // Get all schedules
    const { data: allSchedules, error: allError } = await supabaseAdmin
      .from('schedules')
      .select('id, video_title, status, scheduled_for, created_at')
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('❌ Error fetching all schedules:', allError);
      return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
    }
    
    // Get pending schedules using the same logic as getPendingSchedules
    const { data: pendingSchedules, error: pendingError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', nowISO)
      .order('scheduled_for', { ascending: true });
    
    if (pendingError) {
      console.error('❌ Error fetching pending schedules:', pendingError);
      return NextResponse.json({ error: 'Failed to fetch pending schedules' }, { status: 500 });
    }
    
    // Analyze each schedule
    const analyzedSchedules = allSchedules.map(schedule => {
      const scheduledTime = new Date(schedule.scheduled_for);
      const isOverdue = scheduledTime < now;
      const timeDiff = scheduledTime.getTime() - now.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));
      
      return {
        ...schedule,
        scheduledTimeLocal: scheduledTime.toLocaleString(),
        scheduledTimeISO: scheduledTime.toISOString(),
        isOverdue,
        minutesDiff,
        shouldBeProcessed: schedule.status === 'pending' && isOverdue
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        currentTime: {
          local: now.toLocaleString(),
          iso: nowISO,
          gmt7: nowGMT7
        },
        totalSchedules: allSchedules.length,
        pendingSchedules: pendingSchedules.length,
        allSchedules: analyzedSchedules,
        pendingSchedulesRaw: pendingSchedules
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug schedules timezone API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to debug schedules',
      details: error
    }, { status: 500 });
  }
}


