import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Webhook Payload Consistency After Standardization...');
    
    // Mock Cron Auto Payload (after standardization)
    const cronAutoPayload = {
      scheduleId: 'schedule-123',
      reviewId: 'review-456',
      postType: 'scheduled',
      targetType: 'page',
      targetId: 'page-789',
      targetName: 'My Facebook Page',
      message: 'Test post message',
      landing_page_url: 'https://example.com/landing',
      imageUrl: 'https://example.com/image.jpg',
      videoUrl: 'https://example.com/video.mp4',
      videoTitle: 'Test Video Title',
      channelName: 'Test Channel',
      affiliateLinksText: 'Đặt mua sản phẩm giá tốt tại:\n- Shopee: https://shopee.vn (100k)\n- Lazada: https://lazada.vn (120k)',
      reviewSummary: 'Test review summary',
      reviewPros: ['Pro 1', 'Pro 2'],
      reviewCons: ['Con 1', 'Con 2'],
      reviewKeyPoints: ['Point 1', 'Point 2'],
      reviewTargetAudience: ['Audience 1', 'Audience 2'],
      reviewCta: 'Test CTA',
      review_seo_keywords: ['keyword1', 'keyword2'],
      scheduledFor: '2025-10-14T10:00:00.000Z',
      triggeredAt: '2025-10-14T10:00:00.000Z',
      retryAttempt: 0,
      metadata: {}
    };
    
    // Mock Facebook Post Payload (after standardization)
    const facebookPostPayload = {
      scheduleId: 'manual-1697268000000',
      reviewId: 'review-456',
      postType: 'manual',
      targetType: 'page',
      targetId: 'make-com-handled',
      targetName: 'Make.com Manual',
      message: 'Test post message',
      landing_page_url: 'https://example.com/landing',
      imageUrl: 'https://example.com/image.jpg',
      videoUrl: 'https://example.com/video.mp4',
      videoTitle: 'Test Video Title',
      channelName: 'Test Channel',
      affiliateLinksText: 'Đặt mua sản phẩm giá tốt tại:\n- Shopee: https://shopee.vn (100k)\n- Lazada: https://lazada.vn (120k)',
      reviewSummary: 'Test review summary',
      reviewPros: ['Pro 1', 'Pro 2'],
      reviewCons: ['Con 1', 'Con 2'],
      reviewKeyPoints: ['Point 1', 'Point 2'],
      reviewTargetAudience: ['Audience 1', 'Audience 2'],
      reviewCta: 'Test CTA',
      review_seo_keywords: ['keyword1', 'keyword2'],
      scheduledFor: '2025-10-14T10:00:00.000Z',
      triggeredAt: '2025-10-14T10:00:00.000Z',
      retryAttempt: 0,
      metadata: {}
    };
    
    // Field Comparison Analysis
    const fieldComparison = Object.keys(cronAutoPayload).map(field => {
      const cronValue = cronAutoPayload[field as keyof typeof cronAutoPayload];
      const facebookValue = facebookPostPayload[field as keyof typeof facebookPostPayload];
      
      const cronType = typeof cronValue;
      const facebookType = typeof facebookValue;
      
      return {
        field,
        cronAuto: {
          value: cronValue,
          type: cronType
        },
        facebookPost: {
          value: facebookValue,
          type: facebookType
        },
        consistent: cronType === facebookType,
        notes: cronType === facebookType ? '✅ Consistent' : '❌ Type mismatch'
      };
    });
    
    // Check for fields only in one payload
    const cronOnlyFields = Object.keys(cronAutoPayload).filter(field => 
      !(field in facebookPostPayload)
    );
    
    const facebookOnlyFields = Object.keys(facebookPostPayload).filter(field => 
      !(field in cronAutoPayload)
    );
    
    // Consistency Analysis
    const consistencyAnalysis = {
      totalFields: Object.keys(cronAutoPayload).length,
      consistentFields: fieldComparison.filter(f => f.consistent).length,
      inconsistentFields: fieldComparison.filter(f => !f.consistent).length,
      cronOnlyFields: cronOnlyFields,
      facebookOnlyFields: facebookOnlyFields,
      consistencyScore: Math.round((fieldComparison.filter(f => f.consistent).length / fieldComparison.length) * 100)
    };
    
    // Key Differences Analysis
    const keyDifferences = fieldComparison.filter(f => !f.consistent).map(f => ({
      field: f.field,
      difference: `${f.cronAuto.type} vs ${f.facebookPost.type}`,
      impact: 'Type mismatch may cause webhook processing issues'
    }));
    
    // Recommendations
    const recommendations = [];
    
    if (consistencyAnalysis.consistencyScore === 100) {
      recommendations.push('✅ Perfect consistency! All fields match between modules');
    } else if (consistencyAnalysis.consistencyScore >= 90) {
      recommendations.push('✅ Good consistency! Minor differences only');
    } else if (consistencyAnalysis.consistencyScore >= 70) {
      recommendations.push('⚠️ Moderate consistency! Some fields need alignment');
    } else {
      recommendations.push('❌ Poor consistency! Major alignment needed');
    }
    
    if (consistencyAnalysis.facebookOnlyFields.length > 0) {
      recommendations.push(`➕ Facebook Post has extra fields: ${consistencyAnalysis.facebookOnlyFields.join(', ')}`);
    }
    
    if (consistencyAnalysis.cronOnlyFields.length > 0) {
      recommendations.push(`➖ Cron Auto has fields not in Facebook Post: ${consistencyAnalysis.cronOnlyFields.join(', ')}`);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          cronAutoFields: Object.keys(cronAutoPayload).length,
          facebookPostFields: Object.keys(facebookPostPayload).length,
          consistencyScore: consistencyAnalysis.consistencyScore,
          status: consistencyAnalysis.consistencyScore >= 90 ? 'EXCELLENT' : 'NEEDS_IMPROVEMENT'
        },
        fieldComparison,
        consistencyAnalysis,
        keyDifferences,
        recommendations,
        cronAutoPayload,
        facebookPostPayload
      }
    });
    
  } catch (error) {
    console.error('❌ Error testing webhook consistency:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
