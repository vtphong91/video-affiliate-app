import { NextRequest, NextResponse } from 'next/server';
import { CronService } from '@/lib/services/cron-service';

export const dynamic = 'force-dynamic';

/**
 * Debug API - Get detailed information about schedules
 * 
 * This endpoint provides debugging information about:
 * - Pending schedules
 * - Failed schedules
 * - Schedule details
 * - Time calculations
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';
    
    console.log('🔐 Secret check:', { 
      provided: cronSecret, 
      expected: expectedSecret,
      match: cronSecret === expectedSecret 
    });
    
    if (cronSecret !== expectedSecret) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid cron secret',
          debug: {
            provided: cronSecret,
            expected: expectedSecret
          }
        },
        { status: 401 }
      );
    }

    console.log('🔍 Debug: Getting schedule information...');

    // Initialize cron service
    const cronService = new CronService();
    
    // Get schedules
    const [pendingSchedules, failedSchedules] = await Promise.all([
      cronService.getPendingSchedules(),
      cronService.getFailedSchedulesForRetry(),
    ]);

    // Calculate current time in GMT+7
    const now = new Date();
    const nowGMT7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    const nowGMT7String = nowGMT7.toISOString().replace('Z', '+07:00');

    // Analyze schedules
    const analysis = {
      currentTime: {
        utc: now.toISOString(),
        gmt7: nowGMT7String,
        gmt7Formatted: nowGMT7.toLocaleString('vi-VN', { 
          timeZone: 'Asia/Ho_Chi_Minh',
          hour12: false 
        }),
      },
      pendingSchedules: {
        count: pendingSchedules.length,
        schedules: pendingSchedules.map(schedule => ({
          id: schedule.id,
          scheduledFor: schedule.scheduled_for,
          status: schedule.status,
          retryCount: schedule.retry_count,
          isOverdue: new Date(schedule.scheduled_for) < nowGMT7,
          timeUntilDue: new Date(schedule.scheduled_for).getTime() - nowGMT7.getTime(),
          reviewTitle: schedule.reviews?.video_title || 'No title',
        })),
      },
      failedSchedules: {
        count: failedSchedules.length,
        schedules: failedSchedules.map(schedule => ({
          id: schedule.id,
          scheduledFor: schedule.scheduled_for,
          status: schedule.status,
          retryCount: schedule.retry_count,
          maxRetries: schedule.max_retries,
          nextRetryAt: schedule.next_retry_at,
          errorMessage: schedule.error_message,
          isOverdue: new Date(schedule.scheduled_for) < nowGMT7,
          reviewTitle: schedule.reviews?.video_title || 'No title',
        })),
      },
      webhookConfig: {
        webhookUrl: process.env.MAKECOM_WEBHOOK_URL ? 'Configured' : 'Not configured',
        cronSecret: process.env.CRON_SECRET ? 'Configured' : 'Not configured',
      },
    };

    console.log('✅ Debug information collected:', analysis);

    return NextResponse.json({
      success: true,
      message: 'Debug information retrieved',
      data: analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Debug API failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Debug API failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
