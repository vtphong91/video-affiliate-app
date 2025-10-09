import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// Cron job handler - runs every 30 seconds in development, 5 minutes in production
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  try {
    // Verify cron secret for security (allow dev-secret in development)
    const cronSecret = request.headers.get('x-cron-secret');
    const expectedSecret = process.env.CRON_SECRET || 'dev-secret';
    
    if (cronSecret !== expectedSecret) {
      console.log('❌ Unauthorized cron request:', { 
        provided: cronSecret, 
        expected: expectedSecret,
        timestamp 
      });
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          timestamp,
          message: 'Invalid cron secret'
        },
        { status: 401 }
      );
    }

    console.log('🕐 Cron job started - checking for scheduled posts...', { timestamp });

    // Get pending schedules that are due
    const pendingSchedules = await db.getPendingSchedules();
    console.log(`📋 Found ${pendingSchedules.length} pending schedules`);

    // Get failed schedules that need retry
    const failedSchedules = await db.getFailedSchedulesForRetry();
    console.log(`🔄 Found ${failedSchedules.length} failed schedules for retry`);

    const allSchedules = [...pendingSchedules, ...failedSchedules];
    
    if (allSchedules.length === 0) {
      const duration = Date.now() - startTime;
      console.log('✅ No schedules to process', { duration: `${duration}ms` });
      return NextResponse.json({
        success: true,
        message: 'No schedules to process',
        processed: 0,
        timestamp,
        duration: `${duration}ms`,
        pendingCount: pendingSchedules.length,
        failedCount: failedSchedules.length,
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

        // Build webhook payload with real data from schedules table
        const webhookPayload = {
          scheduleId: schedule.id,
          reviewId: schedule.review_id,
          targetType: schedule.target_type,
          targetId: schedule.target_id,
          targetName: schedule.target_name,
          message: schedule.post_message,
          link: schedule.landing_page_url,
          imageUrl: schedule.video_thumbnail || schedule.reviews?.video_thumbnail,
          videoUrl: schedule.video_url || schedule.reviews?.video_url,
          videoTitle: schedule.video_title || schedule.reviews?.video_title,
          channelName: schedule.channel_name || schedule.reviews?.channel_name,
          affiliateLinks: schedule.affiliate_links || schedule.reviews?.affiliate_links,
          reviewSummary: schedule.review_summary || schedule.reviews?.summary,
          reviewPros: schedule.review_pros || schedule.reviews?.pros,
          reviewCons: schedule.review_cons || schedule.reviews?.cons,
          reviewKeyPoints: schedule.review_key_points || schedule.reviews?.key_points,
          reviewTargetAudience: schedule.review_target_audience || schedule.reviews?.target_audience,
          reviewCta: schedule.review_cta || schedule.reviews?.cta,
          reviewSeoKeywords: schedule.review_seo_keywords || schedule.reviews?.seo_keywords,
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
        const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
        if (!webhookUrl) {
          console.warn('⚠️ MAKECOM_WEBHOOK_URL not configured - marking as posted without webhook');
          // Mark as posted anyway to avoid infinite retries
          await db.updateSchedule(schedule.id, {
            status: 'posted',
            posted_at: new Date().toISOString(),
            error_message: 'Webhook URL not configured - posted without webhook'
          });
          
          results.push({
            scheduleId: schedule.id,
            status: 'posted_without_webhook',
            message: 'Posted without webhook (URL not configured)',
          });
          continue;
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

    const duration = Date.now() - startTime;
    console.log(`🎯 Cron job completed - processed ${allSchedules.length} schedules`, { 
      duration: `${duration}ms`,
      timestamp 
    });

    return NextResponse.json({
      success: true,
      message: `Processed ${allSchedules.length} schedules`,
      processed: allSchedules.length,
      results,
      timestamp,
      duration: `${duration}ms`,
      pendingCount: pendingSchedules.length,
      failedCount: failedSchedules.length,
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
