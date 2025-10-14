import { NextRequest, NextResponse } from 'next/server';
import { db, supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Debug endpoint to check cron status and schedules
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const vercelCronId = request.headers.get('x-vercel-cron-id');
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';

    const isVercelCron = !!vercelCronId;
    const hasValidSecret = cronSecret === expectedSecret;

    if (!isVercelCron && !hasValidSecret) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid cron secret or not from Vercel Cron'
        },
        { status: 401 }
      );
    }

    console.log('🔍 Debug endpoint called - checking cron status...');

    // Get current time info
    const now = new Date();
    const gmt7Offset = 7 * 60 * 60 * 1000;
    const currentGMT7 = new Date(now.getTime() + gmt7Offset);

    // Get all pending schedules
    const { data: allPendingSchedules, error: pendingError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true });

    if (pendingError) {
      console.error('❌ Error fetching pending schedules:', pendingError);
    }

    // Get schedules that should be processed
    const dueSchedules = await db.getPendingSchedules();

    // Get failed schedules for retry
    const failedSchedules = await db.getFailedSchedulesForRetry();

    // Check webhook configuration
    const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
    const cronSecretConfig = process.env.CRON_SECRET;

    const debugInfo = {
      success: true,
      message: 'Debug information retrieved',
      data: {
        currentTime: {
          utc: now.toISOString(),
          gmt7: currentGMT7.toISOString(),
          gmt7Formatted: currentGMT7.toLocaleString('en-US', { 
            timeZone: 'Asia/Ho_Chi_Minh',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        },
        pendingSchedules: {
          count: allPendingSchedules?.length || 0,
          schedules: (allPendingSchedules || []).map(schedule => ({
            id: schedule.id.substring(0, 8) + '...',
            scheduled_for: schedule.scheduled_for,
            video_title: schedule.video_title,
            status: schedule.status,
            timezone: schedule.timezone
          }))
        },
        dueSchedules: {
          count: dueSchedules.length,
          schedules: dueSchedules.map(schedule => ({
            id: schedule.id.substring(0, 8) + '...',
            scheduled_for: schedule.scheduled_for,
            video_title: schedule.video_title,
            status: schedule.status,
            timezone: schedule.timezone
          }))
        },
        failedSchedules: {
          count: failedSchedules.length,
          schedules: failedSchedules.map(schedule => ({
            id: schedule.id.substring(0, 8) + '...',
            scheduled_for: schedule.scheduled_for,
            video_title: schedule.video_title,
            status: schedule.status,
            retry_count: schedule.retry_count,
            error_message: schedule.error_message
          }))
        },
        webhookConfig: {
          webhookUrl: webhookUrl ? 'Configured' : 'Not configured',
          cronSecret: cronSecretConfig ? 'Configured' : 'Using default'
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          vercelCronId: !!vercelCronId,
          hasValidSecret: hasValidSecret
        }
      }
    };

    console.log('✅ Debug info generated:', {
      pendingCount: allPendingSchedules?.length || 0,
      dueCount: dueSchedules.length,
      failedCount: failedSchedules.length,
      webhookConfigured: !!webhookUrl
    });

    return NextResponse.json(debugInfo);

  } catch (error) {
    console.error('❌ Debug endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Debug failed',
        message: 'Failed to retrieve debug information'
      },
      { status: 500 }
    );
  }
}