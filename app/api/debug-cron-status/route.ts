import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { getCurrentTimestamp } from '@/lib/utils/timezone-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Cron Auto Post Status - Starting...');
    
    // 1. Get current GMT+7 timestamp
    const currentGMT7 = getCurrentTimestamp();
    console.log('🔍 Current GMT+7:', currentGMT7);
    
    // 2. Get all schedules to analyze
    const allSchedules = await db.getSchedules();
    console.log('📋 All schedules count:', allSchedules.length);
    
    // 3. Get pending schedules specifically
    const pendingSchedules = await db.getPendingSchedules();
    console.log('📋 Pending schedules count:', pendingSchedules.length);
    
    // 4. Analyze each schedule
    const analysis = allSchedules.map((schedule, index) => {
      const scheduledFor = schedule.scheduled_for;
      const currentTime = new Date(currentGMT7);
      const scheduledTime = new Date(scheduledFor);
      
      const isOverdue = scheduledTime < currentTime;
      const timeDiff = scheduledTime.getTime() - currentTime.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));
      
      return {
        scheduleId: schedule.id,
        videoTitle: schedule.video_title,
        status: schedule.status,
        scheduledFor: scheduledFor,
        scheduledTime: scheduledTime,
        currentTime: currentTime,
        isOverdue: isOverdue,
        minutesDiff: minutesDiff,
        timeStatus: isOverdue ? `Quá hạn ${Math.abs(minutesDiff)} phút` : `Còn ${minutesDiff} phút`,
        retryCount: schedule.retry_count,
        maxRetries: schedule.max_retries,
        createdAt: schedule.created_at
      };
    });
    
    // 5. Group by status
    const statusGroups = analysis.reduce((groups, item) => {
      const status = item.status;
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(item);
      return groups;
    }, {} as Record<string, typeof analysis>);
    
    // 6. Check overdue schedules
    const overdueSchedules = analysis.filter(item => item.isOverdue && item.status === 'pending');
    
    return NextResponse.json({
      success: true,
      data: {
        currentGMT7,
        summary: {
          totalSchedules: allSchedules.length,
          pendingSchedules: pendingSchedules.length,
          overdueSchedules: overdueSchedules.length,
          statusBreakdown: Object.keys(statusGroups).map(status => ({
            status,
            count: statusGroups[status].length,
            percentage: ((statusGroups[status].length / allSchedules.length) * 100).toFixed(1)
          }))
        },
        overdueSchedules,
        allSchedulesAnalysis: analysis,
        statusGroups,
        recommendations: {
          issues: overdueSchedules.length > 0 ? [
            `${overdueSchedules.length} schedules are overdue and should be processed`,
            'Cron job may not be running or may have failed',
            'Check webhook URL and Make.com configuration'
          ] : [
            'No overdue schedules found',
            'Cron job appears to be working correctly'
          ],
          actions: overdueSchedules.length > 0 ? [
            'Check if cron job is running',
            'Verify webhook URL configuration',
            'Check Make.com webhook logs',
            'Manually trigger cron processing for overdue schedules'
          ] : [
            'Monitor cron job performance',
            'Check for any failed webhook calls'
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug cron status:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
