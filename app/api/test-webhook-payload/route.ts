import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// POST /api/test-webhook-payload - Test webhook payload format
export async function POST() {
  try {
    console.log('🔍 Testing webhook payload format...');
    
    // Import supabase directly
    const { supabaseAdmin } = await import('@/lib/db/supabase');
    
    // Get latest schedule
    const { data: schedule, error } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      console.log('❌ Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: error
      });
    }
    
    console.log('✅ Schedule fetched:', schedule.id);
    
    // Build webhook payload like cron service
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
      affiliateLinksText: affiliateLinksText, // This should be text format
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
    
    console.log('✅ Webhook payload built:', {
      scheduleId: payload.scheduleId,
      affiliateLinksText: payload.affiliateLinksText,
      affiliateLinksTextType: typeof payload.affiliateLinksText,
      affiliateLinksTextLength: payload.affiliateLinksText.length
    });
    
    return NextResponse.json({
      success: true,
      payload,
      message: 'Webhook payload test completed'
    });
    
  } catch (error) {
    console.error('❌ Exception in test webhook payload:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
