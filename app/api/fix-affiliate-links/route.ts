import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fix Affiliate Links Issue - Starting...');
    
    const { scheduleId } = await request.json();
    
    if (!scheduleId) {
      return NextResponse.json({
        success: false,
        error: 'Schedule ID is required'
      }, { status: 400 });
    }
    
    console.log(`🔧 Fixing affiliate links for schedule: ${scheduleId}`);
    
    // 1. Get the schedule
    const { data: schedule, error: scheduleError } = await supabaseAdmin
      .from('schedules')
      .select(`
        id,
        review_id,
        affiliate_links,
        video_title
      `)
      .eq('id', scheduleId)
      .single();
    
    if (scheduleError) {
      throw new Error(`Schedule error: ${scheduleError.message}`);
    }
    
    console.log('📋 Current schedule affiliate_links:', schedule.affiliate_links);
    
    // 2. Get the review affiliate_links
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select('id, affiliate_links')
      .eq('id', schedule.review_id)
      .single();
    
    if (reviewError) {
      throw new Error(`Review error: ${reviewError.message}`);
    }
    
    console.log('📋 Review affiliate_links:', review.affiliate_links);
    
    // 3. Check if schedule needs fixing
    const scheduleHasLinks = schedule.affiliate_links && 
      Array.isArray(schedule.affiliate_links) && 
      schedule.affiliate_links.length > 0;
    
    const reviewHasLinks = review.affiliate_links && 
      Array.isArray(review.affiliate_links) && 
      review.affiliate_links.length > 0;
    
    if (scheduleHasLinks) {
      return NextResponse.json({
        success: true,
        message: 'Schedule already has affiliate_links, no fix needed',
        data: {
          scheduleAffiliateLinks: schedule.affiliate_links,
          reviewAffiliateLinks: review.affiliate_links
        }
      });
    }
    
    if (!reviewHasLinks) {
      return NextResponse.json({
        success: true,
        message: 'Review has no affiliate_links, nothing to copy',
        data: {
          scheduleAffiliateLinks: schedule.affiliate_links,
          reviewAffiliateLinks: review.affiliate_links
        }
      });
    }
    
    // 4. Fix the schedule by copying affiliate_links from review
    console.log('🔧 Copying affiliate_links from review to schedule...');
    
    const { data: updatedSchedule, error: updateError } = await supabaseAdmin
      .from('schedules')
      .update({
        affiliate_links: review.affiliate_links,
        updated_at: new Date().toISOString()
      })
      .eq('id', scheduleId)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Update error: ${updateError.message}`);
    }
    
    console.log('✅ Schedule updated successfully');
    
    // 5. Test the formatAffiliateLinksForWebhook function
    const formatAffiliateLinksForWebhook = (affiliateLinks: any[] | null | undefined): string => {
      if (!affiliateLinks || !Array.isArray(affiliateLinks) || affiliateLinks.length === 0) {
        return '';
      }

      let text = 'Đặt mua sản phẩm giá tốt tại:\n';
      
      affiliateLinks.forEach((link, index) => {
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

      return text.trim();
    };
    
    const formattedText = formatAffiliateLinksForWebhook(updatedSchedule.affiliate_links);
    
    return NextResponse.json({
      success: true,
      message: 'Affiliate links fixed successfully',
      data: {
        scheduleId: updatedSchedule.id,
        videoTitle: updatedSchedule.video_title,
        affiliateLinks: updatedSchedule.affiliate_links,
        affiliateLinksText: formattedText,
        before: {
          scheduleAffiliateLinks: schedule.affiliate_links,
          reviewAffiliateLinks: review.affiliate_links
        },
        after: {
          scheduleAffiliateLinks: updatedSchedule.affiliate_links,
          formattedText: formattedText
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error fixing affiliate links:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
