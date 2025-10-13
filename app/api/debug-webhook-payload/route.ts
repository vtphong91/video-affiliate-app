import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { CronService } from '@/lib/services/cron-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Webhook Payload API called');
    
    // Get latest schedule from database
    const { data: schedules, error } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Error fetching schedules:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: error
      }, { status: 500 });
    }

    if (!schedules || schedules.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No schedules found'
      }, { status: 404 });
    }

    const schedule = schedules[0];
    console.log('📋 Latest schedule for webhook test:', schedule);

    // Test webhook payload generation
    const cronService = new CronService();
    const webhookPayload = cronService.buildWebhookPayload(schedule);
    
    console.log('📤 Generated webhook payload:', webhookPayload);

    // Analyze webhook payload structure
    const payloadAnalysis = {
      hasMessage: !!webhookPayload.message,
      messageLength: webhookPayload.message?.length || 0,
      messagePreview: webhookPayload.message?.substring(0, 200) + '...',
      hasAffiliateLinks: !!webhookPayload.affiliateLinks,
      affiliateLinksType: Array.isArray(webhookPayload.affiliateLinks) ? 'array' : typeof webhookPayload.affiliateLinks,
      affiliateLinksCount: Array.isArray(webhookPayload.affiliateLinks) ? webhookPayload.affiliateLinks.length : 0,
      hasVideoTitle: !!webhookPayload.videoTitle,
      hasVideoUrl: !!webhookPayload.videoUrl,
      hasVideoThumbnail: !!webhookPayload.imageUrl,
      hasChannelName: !!webhookPayload.channelName,
      hasReviewSummary: !!webhookPayload.reviewSummary,
      hasReviewPros: !!webhookPayload.reviewPros,
      hasReviewCons: !!webhookPayload.reviewCons,
      hasReviewTargetAudience: !!webhookPayload.reviewTargetAudience,
      hasReviewSeoKeywords: !!webhookPayload.reviewSeoKeywords,
      reviewProsType: Array.isArray(webhookPayload.reviewPros) ? 'array' : typeof webhookPayload.reviewPros,
      reviewConsType: Array.isArray(webhookPayload.reviewCons) ? 'array' : typeof webhookPayload.reviewCons,
      reviewTargetAudienceType: Array.isArray(webhookPayload.reviewTargetAudience) ? 'array' : typeof webhookPayload.reviewTargetAudience,
      reviewSeoKeywordsType: Array.isArray(webhookPayload.reviewSeoKeywords) ? 'array' : typeof webhookPayload.reviewSeoKeywords,
    };

    console.log('📊 Webhook payload analysis:', payloadAnalysis);

    return NextResponse.json({
      success: true,
      data: {
        schedule,
        webhookPayload,
        analysis: payloadAnalysis
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug webhook payload API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to debug webhook payload',
      details: error
    }, { status: 500 });
  }
}
