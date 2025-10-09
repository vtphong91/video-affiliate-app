import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Cron job handler - runs every 5 minutes
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET;
    
    if (!expectedSecret || cronSecret !== expectedSecret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕐 Cron job started - checking for scheduled posts...');

    // Get pending schedules that are due
    const pendingSchedules = await db.getPendingSchedules();
    console.log(`📋 Found ${pendingSchedules.length} pending schedules`);

    // Get failed schedules that need retry
    const failedSchedules = await db.getFailedSchedulesForRetry();
    console.log(`🔄 Found ${failedSchedules.length} failed schedules for retry`);

    const allSchedules = [...pendingSchedules, ...failedSchedules];
    
    if (allSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No schedules to process',
        processed: 0,
      });
    }

    const results = [];
    
    for (const schedule of allSchedules) {
      try {
        console.log(`📤 Processing schedule ${schedule.id}...`);
        
        // Update status to processing
        await db.updateSchedule(schedule.id, {
          status: 'processing',
        });

        // Build webhook payload
        const webhookPayload = {
          scheduleId: schedule.id,
          reviewId: schedule.review_id,
          targetType: schedule.target_type,
          targetId: schedule.target_id,
          targetName: schedule.target_name,
          message: schedule.post_message,
          link: schedule.landing_page_url,
          imageUrl: schedule.reviews.video_thumbnail,
          scheduledFor: schedule.scheduled_for,
          triggeredAt: new Date().toISOString(),
          retryAttempt: schedule.retry_count,
        };

        // Log webhook request
        await db.createWebhookLog({
          schedule_id: schedule.id,
          request_payload: webhookPayload,
          retry_attempt: schedule.retry_count,
        });

        // Send webhook to Make.com
        const webhookUrl = process.env.MAKECOM_WEBHOOK_URL; // FIX: Correct environment variable name
        if (!webhookUrl) {
          throw new Error('MAKECOM_WEBHOOK_URL not configured');
        }

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'VideoAffiliateApp-Cron/1.0',
          },
          body: JSON.stringify(webhookPayload),
        });

        // Log webhook response
        await db.createWebhookLog({
          schedule_id: schedule.id,
          response_payload: await response.json().catch(() => null),
          response_status: response.status,
          response_received_at: new Date().toISOString(),
          retry_attempt: schedule.retry_count,
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
        }

        // Mark as posted (Make.com will send callback to update with actual post details)
        await db.updateSchedule(schedule.id, {
          status: 'posted',
          posted_at: new Date().toISOString(),
        });

        results.push({
          scheduleId: schedule.id,
          status: 'success',
          message: 'Webhook sent successfully',
        });

        console.log(`✅ Schedule ${schedule.id} processed successfully`);

      } catch (error) {
        console.error(`❌ Error processing schedule ${schedule.id}:`, error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const retryCount = schedule.retry_count + 1;
        const maxRetries = schedule.max_retries;
        
        if (retryCount < maxRetries) {
          // Schedule for retry
          const nextRetryAt = new Date();
          nextRetryAt.setMinutes(nextRetryAt.getMinutes() + 15); // Retry in 15 minutes
          
          await db.updateSchedule(schedule.id, {
            status: 'failed',
            error_message: errorMessage,
            retry_count: retryCount,
            next_retry_at: nextRetryAt.toISOString(),
          });
          
          results.push({
            scheduleId: schedule.id,
            status: 'retry_scheduled',
            message: `Scheduled for retry ${retryCount}/${maxRetries}`,
            nextRetryAt: nextRetryAt.toISOString(),
          });
        } else {
          // Max retries exceeded
          await db.updateSchedule(schedule.id, {
            status: 'failed',
            error_message: `Max retries exceeded: ${errorMessage}`,
            retry_count: retryCount,
          });
          
          results.push({
            scheduleId: schedule.id,
            status: 'failed',
            message: 'Max retries exceeded',
          });
        }
      }
    }

    console.log(`🎯 Cron job completed - processed ${allSchedules.length} schedules`);

    return NextResponse.json({
      success: true,
      message: `Processed ${allSchedules.length} schedules`,
      processed: allSchedules.length,
      results,
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cron job failed',
      },
      { status: 500 }
    );
  }
}
