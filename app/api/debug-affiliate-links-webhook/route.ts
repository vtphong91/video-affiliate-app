import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Affiliate Links Webhook - Starting...');
    
    // 1. Get pending schedules
    const pendingSchedules = await db.getPendingSchedules();
    console.log('📋 Pending schedules count:', pendingSchedules.length);
    
    if (pendingSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending schedules found',
        data: {
          pendingSchedules: [],
          analysis: 'No data to analyze'
        }
      });
    }
    
    // 2. Analyze each schedule's affiliate_links
    const analysis = pendingSchedules.map((schedule, index) => {
      const affiliateLinks = schedule.affiliate_links;
      
      return {
        scheduleId: schedule.id,
        videoTitle: schedule.video_title,
        affiliateLinksRaw: affiliateLinks,
        affiliateLinksType: typeof affiliateLinks,
        affiliateLinksIsArray: Array.isArray(affiliateLinks),
        affiliateLinksIsString: typeof affiliateLinks === 'string',
        affiliateLinksIsNull: affiliateLinks === null,
        affiliateLinksIsUndefined: affiliateLinks === undefined,
        affiliateLinksLength: affiliateLinks?.length || 0,
        affiliateLinksStringified: JSON.stringify(affiliateLinks),
        affiliateLinksPreview: affiliateLinks ? String(affiliateLinks).substring(0, 100) : 'N/A'
      };
    });
    
    // 3. Test webhook payload generation
    const { CronService } = await import('@/lib/services/cron-service');
    const cronService = new CronService();
    
    const webhookPayloads = pendingSchedules.map(schedule => {
      try {
        const payload = cronService.buildWebhookPayload(schedule);
        return {
          scheduleId: schedule.id,
          webhookPayload: payload,
          affiliateLinksText: payload.affiliateLinksText,
          affiliateLinksTextType: typeof payload.affiliateLinksText,
          affiliateLinksTextLength: payload.affiliateLinksText?.length || 0,
          affiliateLinksTextPreview: payload.affiliateLinksText ? String(payload.affiliateLinksText).substring(0, 100) : 'N/A'
        };
      } catch (error) {
        return {
          scheduleId: schedule.id,
          error: error.message,
          webhookPayload: null
        };
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        pendingSchedulesCount: pendingSchedules.length,
        analysis,
        webhookPayloads,
        summary: {
          schedulesWithAffiliateLinks: analysis.filter(a => a.affiliateLinksRaw && a.affiliateLinksRaw !== null).length,
          schedulesWithoutAffiliateLinks: analysis.filter(a => !a.affiliateLinksRaw || a.affiliateLinksRaw === null).length,
          schedulesWithArrayAffiliateLinks: analysis.filter(a => a.affiliateLinksIsArray).length,
          schedulesWithStringAffiliateLinks: analysis.filter(a => a.affiliateLinksIsString).length,
          schedulesWithNullAffiliateLinks: analysis.filter(a => a.affiliateLinksIsNull).length,
          schedulesWithUndefinedAffiliateLinks: analysis.filter(a => a.affiliateLinksIsUndefined).length
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug affiliate links webhook:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

