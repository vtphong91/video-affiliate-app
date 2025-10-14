import { NextRequest, NextResponse } from 'next/server';
import { CronService } from '@/lib/services/cron-service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test Webhook Payload Generation - Starting...');
    
    // Create mock schedule data with affiliate_links as jsonb array
    const mockSchedule = {
      id: 'test-schedule-123',
      review_id: 'test-review-456',
      target_type: 'page',
      target_id: 'test-target',
      target_name: 'Test Target',
      post_message: '🔥 Test post message with affiliate links',
      landing_page_url: 'https://example.com/review/test',
      video_thumbnail: 'https://example.com/thumb.jpg',
      video_url: 'https://example.com/video.mp4',
      video_title: 'Test Video Title',
      channel_name: 'Test Channel',
      affiliate_links: [
        {
          platform: 'Shopee',
          url: 'https://shopee.vn/test-product',
          price: '299.000 VNĐ'
        },
        {
          platform: 'Lazada',
          url: 'https://lazada.vn/test-product',
          price: '350.000 VNĐ'
        },
        {
          platform: 'Tiki',
          url: 'https://tiki.vn/test-product',
          price: '320.000 VNĐ'
        }
      ],
      review_summary: 'Test review summary',
      review_pros: ['Pro 1', 'Pro 2'],
      review_cons: ['Con 1', 'Con 2'],
      review_key_points: ['Key point 1', 'Key point 2'],
      review_target_audience: ['Audience 1', 'Audience 2'],
      review_cta: 'Test CTA',
      review_seo_keywords: ['keyword1', 'keyword2'],
      scheduled_for: new Date().toISOString(),
      retry_count: 0
    };
    
    // Test webhook payload generation
    const cronService = new CronService();
    const webhookPayload = cronService.buildWebhookPayload(mockSchedule);
    
    // Test affiliate links formatting
    const affiliateLinksText = cronService.formatAffiliateLinksForWebhook(mockSchedule.affiliate_links);
    
    return NextResponse.json({
      success: true,
      data: {
        mockSchedule,
        webhookPayload,
        affiliateLinksText,
        affiliateLinksTextPreview: affiliateLinksText.substring(0, 200),
        analysis: {
          originalAffiliateLinks: mockSchedule.affiliate_links,
          originalAffiliateLinksType: typeof mockSchedule.affiliate_links,
          originalAffiliateLinksIsArray: Array.isArray(mockSchedule.affiliate_links),
          originalAffiliateLinksLength: mockSchedule.affiliate_links.length,
          formattedAffiliateLinksText: affiliateLinksText,
          formattedAffiliateLinksTextType: typeof affiliateLinksText,
          formattedAffiliateLinksTextLength: affiliateLinksText.length,
          webhookPayloadAffiliateLinksText: webhookPayload.affiliateLinksText,
          webhookPayloadAffiliateLinksTextType: typeof webhookPayload.affiliateLinksText,
          webhookPayloadAffiliateLinksTextLength: webhookPayload.affiliateLinksText?.length || 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in test webhook payload:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
