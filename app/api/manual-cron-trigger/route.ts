import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { CronService } from '@/lib/services/cron-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual Cron Trigger - Starting...');
    
    // Get pending schedules
    const pendingSchedules = await db.getPendingSchedules();
    console.log(`📋 Found ${pendingSchedules.length} pending schedules`);
    
    if (pendingSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending schedules to process',
        processed: 0,
        data: {
          pendingSchedules: [],
          summary: {
            processed: 0,
            posted: 0,
            failed: 0,
            postedWithoutWebhook: 0
          }
        }
      });
    }
    
    // Process schedules using CronService
    const summary = await CronService.processSchedules(pendingSchedules);
    
    console.log('✅ Manual cron processing completed:', summary);
    
    return NextResponse.json({
      success: true,
      message: 'Schedules processed successfully',
      data: {
        pendingSchedules: pendingSchedules.map(s => ({
          id: s.id,
          videoTitle: s.video_title,
          scheduledFor: s.scheduled_for,
          status: s.status
        })),
        summary: {
          processed: summary.processed,
          posted: summary.posted,
          failed: summary.failed,
          postedWithoutWebhook: summary.postedWithoutWebhook,
          duration: summary.duration,
          timestamp: summary.timestamp
        },
        results: summary.results
      }
    });
    
  } catch (error) {
    console.error('❌ Error in manual cron trigger:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Manual Cron Status Check - Starting...');
    
    // Get pending schedules
    const pendingSchedules = await db.getPendingSchedules();
    
    // Get current timestamp
    const { getCurrentTimestamp } = await import('@/lib/utils/timezone-utils');
    const currentGMT7 = getCurrentTimestamp();
    
    // Analyze schedules
    const analysis = pendingSchedules.map(schedule => {
      const scheduledTime = new Date(schedule.scheduled_for);
      const currentTime = new Date(currentGMT7);
      const isOverdue = scheduledTime < currentTime;
      const timeDiff = scheduledTime.getTime() - currentTime.getTime();
      const minutesDiff = Math.round(timeDiff / (1000 * 60));
      
      return {
        id: schedule.id,
        videoTitle: schedule.video_title,
        scheduledFor: schedule.scheduled_for,
        isOverdue: isOverdue,
        minutesDiff: minutesDiff,
        timeStatus: isOverdue ? `Quá hạn ${Math.abs(minutesDiff)} phút` : `Còn ${minutesDiff} phút`,
        retryCount: schedule.retry_count,
        maxRetries: schedule.max_retries
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        currentGMT7,
        pendingSchedulesCount: pendingSchedules.length,
        overdueSchedulesCount: analysis.filter(a => a.isOverdue).length,
        analysis,
        canTrigger: analysis.filter(a => a.isOverdue).length > 0
      }
    });
    
  } catch (error) {
    console.error('❌ Error in manual cron status check:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
