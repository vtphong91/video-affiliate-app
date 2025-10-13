import { db } from '@/lib/db/supabase';

export interface CronResult {
  scheduleId: string;
  status: 'posted' | 'failed' | 'posted_without_webhook';
  message: string;
  error?: string;
}

export interface CronSummary {
  success: boolean;
  processed: number;
  posted: number;
  failed: number;
  postedWithoutWebhook: number;
  results: CronResult[];
  duration: string;
  timestamp: string;
}

/**
 * Cron Service - Handles automated posting to Make.com webhook
 * Separated from schedule creation for better security and maintainability
 */
export class CronService {
  
  /**
   * Static method to process schedules (called by API route)
   */
  static async processSchedules(schedules: any[]): Promise<CronSummary> {
    const cronService = new CronService();
    return await cronService.processAllSchedules();
  }
  
  /**
   * Get pending schedules that are due for posting
   */
  async getPendingSchedules() {
    try {
      console.log('🔍 Getting pending schedules...');
      const schedules = await db.getPendingSchedules();
      console.log(`📋 Found ${schedules.length} pending schedules`);
      return schedules;
    } catch (error) {
      console.error('❌ Error getting pending schedules:', error);
      throw new Error('Failed to get pending schedules');
    }
  }

  /**
   * Get failed schedules that need retry
   */
  async getFailedSchedulesForRetry() {
    try {
      console.log('🔍 Getting failed schedules for retry...');
      const schedules = await db.getFailedSchedulesForRetry();
      console.log(`🔄 Found ${schedules.length} failed schedules for retry`);
      return schedules;
    } catch (error) {
      console.error('❌ Error getting failed schedules:', error);
      throw new Error('Failed to get failed schedules');
    }
  }

  /**
   * Get affiliate links from schedule as array of objects
   */
  getAffiliateLinks(schedule: any): Array<{platform: string, price: string, url: string}> {
    // If schedule.affiliate_links is already an array, use it
    if (schedule.affiliate_links && Array.isArray(schedule.affiliate_links)) {
      console.log(`📋 Using affiliate links array from schedule: ${schedule.affiliate_links.length} links`);
      return schedule.affiliate_links;
    }
    
    // Otherwise, get from reviews.affiliate_links array
    const affiliateLinks = schedule.reviews?.affiliate_links;
    if (!affiliateLinks || !Array.isArray(affiliateLinks) || affiliateLinks.length === 0) {
      return [];
    }
    
    return affiliateLinks.map((link: any) => ({
      platform: link.platform || 'Nền tảng',
      price: link.price || 'Giá liên hệ',
      url: link.url || '#'
    }));
  }

  /**
   * Format affiliate links for display
   */
  formatAffiliateLinks(affiliateLinks: any[] | null | undefined): string {
    if (!affiliateLinks || !Array.isArray(affiliateLinks) || affiliateLinks.length === 0) {
      return 'Đặt sản phẩm với giá tốt tại: Không có thông tin';
    }

    const formattedLinks = affiliateLinks.map((link, index) => {
      const platform = link.platform || 'Nền tảng';
      const price = link.price || 'Giá liên hệ';
      const url = link.url || '#';
      
      return `- ${platform} - ${price}: ${url}`;
    }).join('\n');

    return `Đặt sản phẩm với giá tốt tại:\n${formattedLinks}`;
  }

  /**
   * Build webhook payload for Make.com
   */
  buildWebhookPayload(schedule: any) {
    try {
      console.log(`🔧 Building webhook payload for schedule ${schedule.id}`);
      
      // affiliate_links is now stored as text in database
      const affiliateLinksText = schedule.affiliate_links || '';
      
      const payload = {
        scheduleId: schedule.id,
        reviewId: schedule.review_id,
        targetType: schedule.target_type,
        targetId: schedule.target_id,
        targetName: schedule.target_name,
        message: schedule.post_message,
        landing_page_url: schedule.landing_page_url,
        imageUrl: schedule.video_thumbnail,
        videoUrl: schedule.video_url,
        videoTitle: schedule.video_title,
        channelName: schedule.channel_name,
        affiliateLinksText: affiliateLinksText, // Direct text from database
        reviewSummary: schedule.review_summary,
        reviewPros: schedule.review_pros,
        reviewCons: schedule.review_cons,
        reviewKeyPoints: schedule.review_key_points,
        reviewTargetAudience: schedule.review_target_audience,
        reviewCta: schedule.review_cta,
        review_seo_keywords: schedule.review_seo_keywords,
        scheduledFor: schedule.scheduled_for,
        triggeredAt: new Date().toISOString(),
        retryAttempt: schedule.retry_count,
      };

      console.log(`✅ Webhook payload built for schedule ${schedule.id}`);
      return payload;
    } catch (error) {
      console.error('❌ Error building webhook payload:', error);
      throw new Error('Failed to build webhook payload');
    }
  }


  /**
   * Send webhook to Make.com
   */
  async sendWebhookToMake(payload: any, scheduleId: string) {
    const startTime = Date.now();
    
    try {
      console.log(`📤 Sending webhook to Make.com for schedule ${scheduleId}`);
      
      const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
      if (!webhookUrl) {
        console.warn('⚠️ MAKECOM_WEBHOOK_URL not configured');
        
        // Log the error
        try {
          await db.updateWebhookLog(scheduleId, {
            response_status: null,
            response_payload: null,
            error_message: 'Webhook URL not configured',
            response_received_at: new Date().toISOString(),
          });
        } catch (updateError) {
          console.error('Failed to update webhook log:', updateError);
        }
        
        return {
          success: false,
          error: 'Webhook URL not configured',
          shouldMarkAsPosted: true, // Mark as posted to avoid infinite retries
        };
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'VideoAffiliate-Cron/1.0',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      const processingTime = Date.now() - startTime;
      
      console.log(`📥 Make.com response: ${response.status} - ${responseText}`);

      // Log the response
      try {
        await db.updateWebhookLog(scheduleId, {
          response_status: response.status,
          response_payload: responseText,
          response_received_at: new Date().toISOString(),
          error_message: response.ok ? null : `HTTP ${response.status}: ${responseText}`,
        });
      } catch (updateError) {
        console.error('Failed to update webhook log:', updateError);
      }

      if (response.ok) {
        console.log(`✅ Webhook sent successfully for schedule ${scheduleId}`);
        return {
          success: true,
          response: responseText,
        };
      } else {
        console.error(`❌ Webhook failed for schedule ${scheduleId}: ${response.status}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${responseText}`,
        };
      }
    } catch (error) {
      console.error(`❌ Error sending webhook for schedule ${scheduleId}:`, error);
      
      // Log the error
      try {
        await db.updateWebhookLog(scheduleId, {
          response_status: null,
          response_payload: null,
          error_message: error instanceof Error ? error.message : 'Unknown error',
          response_received_at: new Date().toISOString(),
        });
      } catch (updateError) {
        console.error('Failed to update webhook log:', updateError);
      }
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process a single schedule
   */
  async processSchedule(schedule: any): Promise<CronResult> {
    try {
      console.log(`🔄 Processing schedule ${schedule.id}`);

      // Update status to processing
      await db.updateSchedule(schedule.id, {
        status: 'processing',
      });

      // Build webhook payload
      const payload = this.buildWebhookPayload(schedule);

      // Log webhook request
      await db.createWebhookLog({
        schedule_id: schedule.id,
        request_payload: payload,
        retry_attempt: schedule.retry_count,
        request_sent_at: new Date().toISOString(),
      });

      // Send webhook to Make.com
      const webhookResult = await this.sendWebhookToMake(payload, schedule.id);

      if (webhookResult.success) {
        // Mark as posted
        const { getCurrentTimestamp } = await import('@/lib/utils/timezone-utils');
        const postedAtGMT7 = getCurrentTimestamp(); // This returns GMT+7 format
        console.log('🕐 Setting posted_at to GMT+7:', postedAtGMT7);
        
        await db.updateSchedule(schedule.id, {
          status: 'posted',
          posted_at: postedAtGMT7,
          retry_count: schedule.retry_count + 1,
        });

        return {
          scheduleId: schedule.id,
          status: 'posted',
          message: 'Posted successfully to Make.com',
        };
      } else if (webhookResult.shouldMarkAsPosted) {
        // Mark as posted without webhook (to avoid infinite retries)
        const { getCurrentTimestamp } = await import('@/lib/utils/timezone-utils');
        const postedAtGMT7 = getCurrentTimestamp(); // This returns GMT+7 format
        console.log('🕐 Setting posted_at to GMT+7 (fallback):', postedAtGMT7);
        
        await db.updateSchedule(schedule.id, {
          status: 'posted',
          posted_at: postedAtGMT7,
          error_message: webhookResult.error,
        });

        return {
          scheduleId: schedule.id,
          status: 'posted_without_webhook',
          message: 'Posted without webhook (URL not configured)',
        };
      } else {
        // Mark as failed
        const newRetryCount = schedule.retry_count + 1;
        const maxRetries = schedule.max_retries || 3;
        
        if (newRetryCount >= maxRetries) {
          await db.updateSchedule(schedule.id, {
            status: 'failed',
            error_message: webhookResult.error,
            retry_count: newRetryCount,
          });
        } else {
          await db.updateSchedule(schedule.id, {
            status: 'failed',
            error_message: webhookResult.error,
            retry_count: newRetryCount,
            next_retry_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // Retry in 5 minutes
          });
        }

        return {
          scheduleId: schedule.id,
          status: 'failed',
          message: `Failed to post: ${webhookResult.error}`,
          error: webhookResult.error,
        };
      }
    } catch (error) {
      console.error(`❌ Error processing schedule ${schedule.id}:`, error);
      
      // Mark as failed
      await db.updateSchedule(schedule.id, {
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        retry_count: schedule.retry_count + 1,
      });

      return {
        scheduleId: schedule.id,
        status: 'failed',
        message: 'Processing error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Process all due schedules
   */
  async processAllSchedules(): Promise<CronSummary> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    try {
      console.log('🕐 Cron job started - checking for scheduled posts...', { timestamp });

      // Get all schedules to process
      const [pendingSchedules, failedSchedules] = await Promise.all([
        this.getPendingSchedules(),
        this.getFailedSchedulesForRetry(),
      ]);

      const allSchedules = [...pendingSchedules, ...failedSchedules];
      
      if (allSchedules.length === 0) {
        const duration = Date.now() - startTime;
        console.log('✅ No schedules to process', { duration: `${duration}ms` });
        return {
          success: true,
          processed: 0,
          posted: 0,
          failed: 0,
          postedWithoutWebhook: 0,
          results: [],
          duration: `${duration}ms`,
          timestamp,
        };
      }

      console.log(`🚀 Processing ${allSchedules.length} schedules...`);
      const results: CronResult[] = [];

      // Process each schedule
      for (const schedule of allSchedules) {
        try {
          const result = await this.processSchedule(schedule);
          results.push(result);
        } catch (error) {
          console.error(`❌ Error processing schedule ${schedule.id}:`, error);
          results.push({
            scheduleId: schedule.id,
            status: 'failed',
            message: 'Processing error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Calculate summary
      const summary: CronSummary = {
        success: true,
        processed: results.length,
        posted: results.filter(r => r.status === 'posted').length,
        failed: results.filter(r => r.status === 'failed').length,
        postedWithoutWebhook: results.filter(r => r.status === 'posted_without_webhook').length,
        results,
        duration: `${Date.now() - startTime}ms`,
        timestamp,
      };

      console.log('✅ Cron job completed:', summary);
      return summary;

    } catch (error) {
      console.error('❌ Cron job failed:', error);
      return {
        success: false,
        processed: 0,
        posted: 0,
        failed: 0,
        postedWithoutWebhook: 0,
        results: [],
        duration: `${Date.now() - startTime}ms`,
        timestamp,
      };
    }
  }
}
