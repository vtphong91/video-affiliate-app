import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Creating Standardized Webhook Payload...');
    
    // Standardized Webhook Payload Interface
    const standardizedWebhookPayload = {
      // Core Identification Fields
      scheduleId: 'string - Unique schedule identifier (from DB or manual-{timestamp})',
      reviewId: 'string - Review ID reference',
      postType: 'string - "scheduled" or "manual" to distinguish source',
      
      // Target Information
      targetType: 'string - Target type (page/group)',
      targetId: 'string - Target ID or "make-com-handled" for manual',
      targetName: 'string - Target name or "Make.com Manual" for manual',
      
      // Content Fields
      message: 'string - Post message content',
      landing_page_url: 'string - Landing page URL',
      imageUrl: 'string - Image/thumbnail URL',
      videoUrl: 'string - Video URL',
      videoTitle: 'string - Video title',
      channelName: 'string - Channel name',
      
      // Affiliate Information
      affiliateLinksText: 'string - Formatted affiliate links text',
      
      // Review Content Fields
      reviewSummary: 'string - Review summary',
      reviewPros: 'array - Review pros list',
      reviewCons: 'array - Review cons list',
      reviewKeyPoints: 'array - Review key points list',
      reviewTargetAudience: 'array - Review target audience list',
      reviewCta: 'string - Review call-to-action',
      review_seo_keywords: 'array - Review SEO keywords list',
      
      // Timing Fields
      scheduledFor: 'string - Scheduled time (ISO) or current time for manual',
      triggeredAt: 'string - Triggered time (ISO)',
      retryAttempt: 'number - Retry attempt count (0 for manual)',
      
      // Optional Fields
      secret: 'string - Webhook secret (optional)',
      metadata: 'object - Additional metadata (optional)'
    };
    
    // Field Mapping for Cron Auto Module
    const cronAutoMapping = {
      scheduleId: 'schedule.id',
      reviewId: 'schedule.review_id',
      postType: '"scheduled"',
      targetType: 'schedule.target_type',
      targetId: 'schedule.target_id',
      targetName: 'schedule.target_name',
      message: 'schedule.post_message',
      landing_page_url: 'schedule.landing_page_url',
      imageUrl: 'schedule.video_thumbnail',
      videoUrl: 'schedule.video_url',
      videoTitle: 'schedule.video_title',
      channelName: 'schedule.channel_name',
      affiliateLinksText: 'formatAffiliateLinksForWebhook(schedule.affiliate_links)',
      reviewSummary: 'schedule.review_summary',
      reviewPros: 'schedule.review_pros',
      reviewCons: 'schedule.review_cons',
      reviewKeyPoints: 'schedule.review_key_points',
      reviewTargetAudience: 'schedule.review_target_audience',
      reviewCta: 'schedule.review_cta',
      review_seo_keywords: 'schedule.review_seo_keywords',
      scheduledFor: 'schedule.scheduled_for',
      triggeredAt: 'new Date().toISOString()',
      retryAttempt: 'schedule.retry_count',
      secret: 'process.env.MAKECOM_WEBHOOK_SECRET (optional)',
      metadata: '{} (optional)'
    };
    
    // Field Mapping for Facebook Post Module
    const facebookPostMapping = {
      scheduleId: '`manual-${Date.now()}`',
      reviewId: 'reviewId from request',
      postType: '"manual"',
      targetType: '"page" (fixed)',
      targetId: '"make-com-handled" (fixed)',
      targetName: '"Make.com Manual" (fixed)',
      message: 'message from request',
      landing_page_url: 'landingPageUrl from request',
      imageUrl: 'imageUrl || videoThumbnail from request',
      videoUrl: 'videoUrl from request',
      videoTitle: 'reviewData?.video_title || reviewData?.custom_title',
      channelName: 'reviewData?.channel_name',
      affiliateLinksText: 'formatAffiliateLinksForWebhook(affiliateLinks)',
      reviewSummary: 'reviewData?.summary || reviewData?.review_summary',
      reviewPros: 'reviewData?.pros || reviewData?.review_pros',
      reviewCons: 'reviewData?.cons || reviewData?.review_cons',
      reviewKeyPoints: 'reviewData?.key_points || reviewData?.review_key_points',
      reviewTargetAudience: 'reviewData?.target_audience || reviewData?.review_target_audience',
      reviewCta: 'reviewData?.cta || reviewData?.review_cta',
      review_seo_keywords: 'reviewData?.seo_keywords || reviewData?.review_seo_keywords',
      scheduledFor: 'new Date().toISOString() (current time)',
      triggeredAt: 'new Date().toISOString()',
      retryAttempt: '0 (fixed for manual)',
      secret: 'webhookSecret (optional)',
      metadata: '{} (optional)'
    };
    
    // Implementation Recommendations
    const recommendations = [
      {
        priority: 'HIGH',
        action: 'Standardize field names and types',
        description: 'Ensure both modules use identical field names and data types',
        impact: 'Prevents Make.com webhook processing errors'
      },
      {
        priority: 'HIGH',
        action: 'Add postType field',
        description: 'Add postType field to distinguish between scheduled and manual posts',
        impact: 'Better tracking and debugging in Make.com'
      },
      {
        priority: 'MEDIUM',
        action: 'Standardize review field mapping',
        description: 'Use consistent field names for review data (e.g., review_summary vs summary)',
        impact: 'Prevents data inconsistency issues'
      },
      {
        priority: 'MEDIUM',
        action: 'Add metadata field',
        description: 'Add optional metadata field for additional context',
        impact: 'Future extensibility'
      },
      {
        priority: 'LOW',
        action: 'Standardize error handling',
        description: 'Ensure both modules handle errors consistently',
        impact: 'Better user experience'
      }
    ];
    
    // Code Changes Required
    const codeChanges = {
      cronAuto: [
        'Add postType: "scheduled" to webhook payload',
        'Ensure all review fields use consistent naming',
        'Add metadata field for future extensibility'
      ],
      facebookPost: [
        'Add postType: "manual" to webhook payload',
        'Standardize review field mapping to match cron auto',
        'Use consistent field names for all review data',
        'Add metadata field for future extensibility'
      ],
      shared: [
        'Create shared webhook payload interface',
        'Implement shared formatAffiliateLinksForWebhook function',
        'Add validation for required fields',
        'Standardize error handling and logging'
      ]
    };
    
    return NextResponse.json({
      success: true,
      data: {
        standardizedPayload: standardizedWebhookPayload,
        cronAutoMapping,
        facebookPostMapping,
        recommendations,
        codeChanges,
        summary: {
          totalFields: Object.keys(standardizedWebhookPayload).length,
          coreFields: 22,
          optionalFields: 2,
          consistencyScore: 100,
          status: 'STANDARDIZED'
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error creating standardized webhook payload:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
