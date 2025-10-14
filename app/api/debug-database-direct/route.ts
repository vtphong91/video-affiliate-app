import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { getCurrentTimestamp } from '@/lib/utils/timezone-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Database Schedules Direct - Starting...');
    
    // Get current GMT+7 timestamp
    const currentGMT7 = getCurrentTimestamp();
    console.log('🔍 Current GMT+7:', currentGMT7);
    
    // Get all schedules from database directly
    const { data: allSchedules, error: allError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allError) {
      throw new Error(`Database error: ${allError.message}`);
    }
    
    console.log(`📋 Total schedules in database: ${allSchedules.length}`);
    
    // Get pending schedules using our function
    const { data: pendingSchedules, error: pendingError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', currentGMT7)
      .order('scheduled_for', { ascending: true });
    
    if (pendingError) {
      throw new Error(`Pending schedules error: ${pendingError.message}`);
    }
    
    console.log(`📋 Pending schedules (should be processed): ${pendingSchedules.length}`);
    
    // Analyze each schedule
    const analysis = allSchedules.map((schedule, index) => {
      const scheduledFor = schedule.scheduled_for;
      const currentTime = new Date(currentGMT7);
      const scheduledTime = new Date(scheduledFor);
      
      const isOverdue = scheduledTime < currentTime;
      const timeDiff = scheduledTime.getTime() - currentTime.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));
      
      return {
        index: index + 1,
        scheduleId: schedule.id,
        videoTitle: schedule.video_title,
        status: schedule.status,
        scheduledFor: scheduledFor,
        scheduledTime: scheduledTime.toISOString(),
        currentTime: currentTime.toISOString(),
        isOverdue: isOverdue,
        minutesDiff: minutesDiff,
        timeStatus: isOverdue ? `Quá hạn ${Math.abs(minutesDiff)} phút` : `Còn ${minutesDiff} phút`,
        retryCount: schedule.retry_count,
        maxRetries: schedule.max_retries,
        createdAt: schedule.created_at,
        updatedAt: schedule.updated_at
      };
    });
    
    // Group by status
    const statusGroups = analysis.reduce((groups, item) => {
      const status = item.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(item);
      return groups;
    }, {} as Record<string, typeof analysis>);
    
    // Find overdue schedules
    const overdueSchedules = analysis.filter(item => item.isOverdue && item.status === 'pending');
    
    return NextResponse.json({
      success: true,
      data: {
        currentGMT7,
        databaseStats: {
          totalSchedules: allSchedules.length,
          pendingSchedules: pendingSchedules.length,
          overdueSchedules: overdueSchedules.length
        },
        allSchedules: analysis,
        overdueSchedules,
        statusGroups,
        pendingSchedulesFromDB: pendingSchedules.map(s => ({
          id: s.id,
          videoTitle: s.video_title,
          scheduledFor: s.scheduled_for,
          status: s.status,
          retryCount: s.retry_count
        })),
        recommendations: {
          issues: overdueSchedules.length > 0 ? [
            `${overdueSchedules.length} schedules are overdue and should be processed by cron`,
            'Cron job may not be running or may have failed',
            'Check if auto-cron.js is running'
          ] : [
            'No overdue schedules found',
            'All schedules are processed correctly'
          ],
          actions: overdueSchedules.length > 0 ? [
            'Start auto-cron.js process',
            'Check cron job logs for errors',
            'Manually trigger cron processing',
            'Verify webhook configuration'
          ] : [
            'Monitor cron job performance',
            'Check for any processing delays'
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug database direct:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
