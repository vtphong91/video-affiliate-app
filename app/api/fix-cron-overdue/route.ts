import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { CronService } from '@/lib/services/cron-service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fix Cron Overdue Schedules - Starting...');
    
    // Get current timestamp
    const { getCurrentTimestamp } = await import('@/lib/utils/timezone-utils');
    const currentGMT7 = getCurrentTimestamp();
    
    // Get overdue schedules
    const overdueSchedules = await db.getPendingSchedules();
    console.log(`📋 Found ${overdueSchedules.length} overdue schedules`);
    
    if (overdueSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No overdue schedules found',
        data: {
          processed: 0,
          results: []
        }
      });
    }
    
    // Process each overdue schedule
    const cronService = new CronService();
    const results = [];
    
    for (const schedule of overdueSchedules) {
      try {
        console.log(`🔄 Processing overdue schedule: ${schedule.id}`);
        
        // Build webhook payload
        const payload = cronService.buildWebhookPayload(schedule);
        
        // Send webhook
        const webhookResult = await cronService.sendWebhookToMake(payload, schedule.id);
        
        // Update schedule status
        if (webhookResult.success) {
          await db.updateSchedule(schedule.id, { 
            status: 'posted',
            updated_at: new Date().toISOString()
          });
          
          results.push({
            scheduleId: schedule.id,
            videoTitle: schedule.video_title,
            status: 'posted',
            webhookResult: webhookResult,
            message: 'Successfully posted'
          });
        } else {
          await db.updateSchedule(schedule.id, { 
            status: 'failed',
            retry_count: (schedule.retry_count || 0) + 1,
            updated_at: new Date().toISOString()
          });
          
          results.push({
            scheduleId: schedule.id,
            videoTitle: schedule.video_title,
            status: 'failed',
            webhookResult: webhookResult,
            message: 'Failed to post'
          });
        }
        
      } catch (error) {
        console.error(`❌ Error processing schedule ${schedule.id}:`, error);
        
        // Update schedule as failed
        await db.updateSchedule(schedule.id, { 
          status: 'failed',
          retry_count: (schedule.retry_count || 0) + 1,
          updated_at: new Date().toISOString()
        });
        
        results.push({
          scheduleId: schedule.id,
          videoTitle: schedule.video_title,
          status: 'failed',
          error: error.message,
          message: 'Processing error'
        });
      }
    }
    
    const successCount = results.filter(r => r.status === 'posted').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    
    return NextResponse.json({
      success: true,
      message: `Processed ${overdueSchedules.length} overdue schedules`,
      data: {
        processed: overdueSchedules.length,
        success: successCount,
        failed: failedCount,
        results: results,
        summary: {
          totalOverdue: overdueSchedules.length,
          successfullyPosted: successCount,
          failedToPost: failedCount,
          successRate: `${((successCount / overdueSchedules.length) * 100).toFixed(1)}%`
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in fix cron overdue:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
