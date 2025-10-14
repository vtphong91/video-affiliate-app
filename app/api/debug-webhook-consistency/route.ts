import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Analyzing Webhook Payload Consistency...');
    
    // Cron Auto Webhook Payload Fields
    const cronAutoFields = {
      scheduleId: 'string - Schedule ID from database',
      reviewId: 'string - Review ID from schedule',
      targetType: 'string - Target type (page/group)',
      targetId: 'string - Target ID',
      targetName: 'string - Target name',
      message: 'string - Post message content',
      landing_page_url: 'string - Landing page URL',
      imageUrl: 'string - Video thumbnail URL',
      videoUrl: 'string - Video URL',
      videoTitle: 'string - Video title',
      channelName: 'string - Channel name',
      affiliateLinksText: 'string - Formatted affiliate links text',
      reviewSummary: 'string - Review summary',
      reviewPros: 'array - Review pros',
      reviewCons: 'array - Review cons',
      reviewKeyPoints: 'array - Review key points',
      reviewTargetAudience: 'array - Review target audience',
      reviewCta: 'string - Review CTA',
      review_seo_keywords: 'array - Review SEO keywords',
      scheduledFor: 'string - Scheduled time (ISO)',
      triggeredAt: 'string - Triggered time (ISO)',
      retryAttempt: 'number - Retry attempt count'
    };
    
    // Facebook Post Webhook Payload Fields
    const facebookPostFields = {
      scheduleId: 'string - Manual post ID (manual-{timestamp})',
      reviewId: 'string - Review ID from request',
      targetType: 'string - Fixed as "page"',
      targetId: 'string - Fixed as "make-com-handled"',
      targetName: 'string - Fixed as "Make.com Manual"',
      message: 'string - Post message from request',
      landing_page_url: 'string - Landing page URL from request',
      imageUrl: 'string - Image URL or video thumbnail',
      videoUrl: 'string - Video URL from request',
      videoTitle: 'string - Video title from review data',
      channelName: 'string - Channel name from review data',
      affiliateLinksText: 'string - Formatted affiliate links text',
      reviewSummary: 'string - Review summary from review data',
      reviewPros: 'array - Review pros from review data',
      reviewCons: 'array - Review cons from review data',
      reviewKeyPoints: 'array - Review key points from review data',
      reviewTargetAudience: 'array - Review target audience from review data',
      reviewCta: 'string - Review CTA from review data',
      review_seo_keywords: 'array - Review SEO keywords from review data',
      scheduledFor: 'string - Current time (ISO)',
      triggeredAt: 'string - Current time (ISO)',
      retryAttempt: 'number - Fixed as 0',
      secret: 'string - Webhook secret (optional)'
    };
    
    // Field Comparison Analysis
    const fieldComparison = Object.keys(cronAutoFields).map(field => {
      const cronType = cronAutoFields[field as keyof typeof cronAutoFields];
      const facebookType = facebookPostFields[field as keyof typeof facebookPostFields];
      
      return {
        field,
        cronAuto: cronType,
        facebookPost: facebookType,
        consistent: cronType === facebookType,
        notes: cronType === facebookType ? '✅ Consistent' : '⚠️ Different types or missing'
      };
    });
    
    // Check for fields only in one module
    const cronOnlyFields = Object.keys(cronAutoFields).filter(field => 
      !(field in facebookPostFields)
    );
    
    const facebookOnlyFields = Object.keys(facebookPostFields).filter(field => 
      !(field in cronAutoFields)
    );
    
    // Consistency Analysis
    const consistencyAnalysis = {
      totalFields: Object.keys(cronAutoFields).length,
      consistentFields: fieldComparison.filter(f => f.consistent).length,
      inconsistentFields: fieldComparison.filter(f => !f.consistent).length,
      cronOnlyFields: cronOnlyFields,
      facebookOnlyFields: facebookOnlyFields,
      consistencyScore: Math.round((fieldComparison.filter(f => f.consistent).length / fieldComparison.length) * 100)
    };
    
    // Recommendations
    const recommendations = [];
    
    if (consistencyAnalysis.inconsistentFields > 0) {
      recommendations.push('⚠️ Some fields have different types or are missing in one module');
    }
    
    if (consistencyAnalysis.facebookOnlyFields.length > 0) {
      recommendations.push(`➕ Facebook Post has extra fields: ${consistencyAnalysis.facebookOnlyFields.join(', ')}`);
    }
    
    if (consistencyAnalysis.cronOnlyFields.length > 0) {
      recommendations.push(`➖ Cron Auto has fields not in Facebook Post: ${consistencyAnalysis.cronOnlyFields.join(', ')}`);
    }
    
    if (consistencyAnalysis.consistencyScore === 100) {
      recommendations.push('✅ Perfect consistency! All fields match between modules');
    } else if (consistencyAnalysis.consistencyScore >= 90) {
      recommendations.push('✅ Good consistency! Minor differences only');
    } else if (consistencyAnalysis.consistencyScore >= 70) {
      recommendations.push('⚠️ Moderate consistency! Some fields need alignment');
    } else {
      recommendations.push('❌ Poor consistency! Major alignment needed');
    }
    
    return NextResponse.json({
      success: true,
      data: {
        summary: {
          cronAutoFields: Object.keys(cronAutoFields).length,
          facebookPostFields: Object.keys(facebookPostFields).length,
          consistencyScore: consistencyAnalysis.consistencyScore,
          status: consistencyAnalysis.consistencyScore >= 90 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        },
        fieldComparison,
        consistencyAnalysis,
        recommendations,
        cronAutoPayload: cronAutoFields,
        facebookPostPayload: facebookPostFields
      }
    });
    
  } catch (error) {
    console.error('❌ Error analyzing webhook consistency:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
