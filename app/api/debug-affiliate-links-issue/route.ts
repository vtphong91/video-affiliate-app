import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Affiliate Links Text Issue - Starting...');
    
    // 1. Get the specific schedule from the image (c1b783ff-ac8a-4396-9e27-fe9a530b58d0)
    const scheduleId = 'c1b783ff-ac8a-4396-9e27-fe9a530b58d0';
    
    console.log(`🔍 Fetching schedule: ${scheduleId}`);
    
    const { data: schedule, error: scheduleError } = await supabaseAdmin
      .from('schedules')
      .select(`
        id,
        review_id,
        affiliate_links,
        video_title,
        channel_name,
        created_at,
        updated_at
      `)
      .eq('id', scheduleId)
      .single();
    
    if (scheduleError) {
      throw new Error(`Schedule error: ${scheduleError.message}`);
    }
    
    console.log('📋 Schedule data:', schedule);
    
    // 2. Get the review data
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        video_title,
        affiliate_links,
        channel_name,
        created_at
      `)
      .eq('id', schedule.review_id)
      .single();
    
    if (reviewError) {
      throw new Error(`Review error: ${reviewError.message}`);
    }
    
    console.log('📋 Review data:', review);
    
    // 3. Test formatAffiliateLinksForWebhook function
    const formatAffiliateLinksForWebhook = (affiliateLinks: any[] | null | undefined): string => {
      console.log('🔧 formatAffiliateLinksForWebhook input:', affiliateLinks);
      
      if (!affiliateLinks || !Array.isArray(affiliateLinks) || affiliateLinks.length === 0) {
        console.log('❌ No affiliate links found or not an array');
        return '';
      }

      let text = 'Đặt mua sản phẩm giá tốt tại:\n';
      
      affiliateLinks.forEach((link, index) => {
        console.log(`🔧 Processing link ${index}:`, link);
        
        if (link && typeof link === 'object') {
          text += `- ${link.platform || `Affiliate Link ${index + 1}`}`;
          if (link.url) {
            text += `: ${link.url}`;
          }
          if (link.price) {
            text += ` (${link.price})`;
          }
          text += '\n';
        }
      });

      const result = text.trim();
      console.log('🔧 formatAffiliateLinksForWebhook result:', result);
      return result;
    };
    
    // 4. Test with schedule affiliate_links
    const scheduleAffiliateText = formatAffiliateLinksForWebhook(schedule.affiliate_links);
    
    // 5. Test with review affiliate_links
    const reviewAffiliateText = formatAffiliateLinksForWebhook(review.affiliate_links);
    
    // 6. Analyze the issue
    const analysis = {
      scheduleId: schedule.id,
      reviewId: schedule.review_id,
      scheduleAffiliateLinks: {
        raw: schedule.affiliate_links,
        type: typeof schedule.affiliate_links,
        isArray: Array.isArray(schedule.affiliate_links),
        length: Array.isArray(schedule.affiliate_links) ? schedule.affiliate_links.length : 'N/A',
        formatted: scheduleAffiliateText,
        isEmpty: scheduleAffiliateText === ''
      },
      reviewAffiliateLinks: {
        raw: review.affiliate_links,
        type: typeof review.affiliate_links,
        isArray: Array.isArray(review.affiliate_links),
        length: Array.isArray(review.affiliate_links) ? review.affiliate_links.length : 'N/A',
        formatted: reviewAffiliateText,
        isEmpty: reviewAffiliateText === ''
      },
      issue: {
        scheduleHasLinks: schedule.affiliate_links && Array.isArray(schedule.affiliate_links) && schedule.affiliate_links.length > 0,
        reviewHasLinks: review.affiliate_links && Array.isArray(review.affiliate_links) && review.affiliate_links.length > 0,
        scheduleFormattedEmpty: scheduleAffiliateText === '',
        reviewFormattedEmpty: reviewAffiliateText === ''
      }
    };
    
    // 7. Recommendations
    const recommendations = [];
    
    if (analysis.issue.scheduleFormattedEmpty && analysis.issue.reviewFormattedEmpty) {
      recommendations.push('❌ Both schedule and review have empty affiliate links');
      recommendations.push('🔧 Check if affiliate_links were properly saved during schedule creation');
    } else if (analysis.issue.scheduleFormattedEmpty && !analysis.issue.reviewFormattedEmpty) {
      recommendations.push('⚠️ Schedule has empty affiliate_links but review has data');
      recommendations.push('🔧 Schedule creation may not be copying affiliate_links from review');
    } else if (!analysis.issue.scheduleFormattedEmpty) {
      recommendations.push('✅ Schedule has affiliate_links data');
      recommendations.push('🔧 Check formatAffiliateLinksForWebhook function in CronService');
    }
    
    return NextResponse.json({
      success: true,
      data: {
        analysis,
        recommendations,
        schedule,
        review
      }
    });
    
  } catch (error) {
    console.error('❌ Error debugging affiliate links:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}