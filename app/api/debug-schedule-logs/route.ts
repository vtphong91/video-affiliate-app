import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug Schedule Creation Logs - Starting...');
    
    const body = await request.json();
    console.log('📋 Request body received:', JSON.stringify(body, null, 2));
    
    // 1. Extract data from request
    const {
      reviewId,
      scheduledFor,
      targetType = 'page',
      targetId = 'make-com-handled',
      targetName = 'Make.com Auto',
      landingPageUrl,
      affiliate_links = []
    } = body;
    
    console.log('🔍 Extracted data:', {
      reviewId,
      scheduledFor,
      targetType,
      targetId,
      targetName,
      landingPageUrl,
      affiliate_links,
      affiliate_links_type: typeof affiliate_links,
      affiliate_links_isArray: Array.isArray(affiliate_links),
      affiliate_links_length: Array.isArray(affiliate_links) ? affiliate_links.length : 'N/A'
    });
    
    // 2. Get review data
    console.log('🔍 Fetching review data...');
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('reviews')
      .select(`
        id,
        video_title,
        affiliate_links,
        channel_name,
        review_summary,
        review_pros,
        review_cons,
        review_key_points,
        review_target_audience,
        review_cta,
        review_seo_keywords,
        video_url,
        video_thumbnail
      `)
      .eq('id', reviewId)
      .single();
    
    if (reviewError) {
      console.log('❌ Review fetch error:', reviewError);
      throw new Error(`Review error: ${reviewError.message}`);
    }
    
    console.log('📋 Review data fetched:', {
      id: review.id,
      video_title: review.video_title,
      affiliate_links: review.affiliate_links,
      affiliate_links_type: typeof review.affiliate_links,
      affiliate_links_isArray: Array.isArray(review.affiliate_links),
      affiliate_links_length: Array.isArray(review.affiliate_links) ? review.affiliate_links.length : 'N/A'
    });
    
    // 3. Process affiliate_links (mimicking the API logic)
    console.log('🔍 Processing affiliate_links...');
    
    const affiliateLinksArray = affiliate_links || review.affiliate_links || [];
    
    console.log('🔍 Affiliate links processing result:', {
      request_affiliate_links: affiliate_links,
      review_affiliate_links: review.affiliate_links,
      final_array: affiliateLinksArray,
      final_array_type: typeof affiliateLinksArray,
      final_array_isArray: Array.isArray(affiliateLinksArray),
      final_array_length: Array.isArray(affiliateLinksArray) ? affiliateLinksArray.length : 'N/A'
    });
    
    // 4. Generate post message (simplified)
    const postMessage = `Test post for ${review.video_title}`;
    
    // 5. Prepare schedule data
    const scheduleData = {
      user_id: '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1',
      review_id: reviewId,
      scheduled_for: scheduledFor,
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      post_message: postMessage,
      landing_page_url: landingPageUrl,
      affiliate_links: affiliateLinksArray, // This is the key field
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
      video_title: review.video_title,
      video_url: review.video_url,
      video_thumbnail: review.video_thumbnail,
      channel_name: review.channel_name,
      review_summary: review.review_summary,
      review_pros: review.review_pros,
      review_cons: review.review_cons,
      review_key_points: review.review_key_points,
      review_target_audience: review.review_target_audience,
      review_cta: review.review_cta,
      review_seo_keywords: review.review_seo_keywords,
    };
    
    console.log('📋 Schedule data prepared:', {
      ...scheduleData,
      affiliate_links: affiliateLinksArray,
      affiliate_links_type: typeof scheduleData.affiliate_links,
      affiliate_links_isArray: Array.isArray(scheduleData.affiliate_links),
      affiliate_links_length: Array.isArray(scheduleData.affiliate_links) ? scheduleData.affiliate_links.length : 'N/A'
    });
    
    // 6. Test database insert
    console.log('🔧 Testing database insert...');
    
    const { data: insertedSchedule, error: insertError } = await supabaseAdmin
      .from('schedules')
      .insert(scheduleData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Database insert error:', insertError);
      throw new Error(`Insert error: ${insertError.message}`);
    }
    
    console.log('✅ Database insert successful:', {
      id: insertedSchedule.id,
      affiliate_links: insertedSchedule.affiliate_links,
      affiliate_links_type: typeof insertedSchedule.affiliate_links,
      affiliate_links_isArray: Array.isArray(insertedSchedule.affiliate_links),
      affiliate_links_length: Array.isArray(insertedSchedule.affiliate_links) ? insertedSchedule.affiliate_links.length : 'N/A'
    });
    
    // 7. Clean up test data
    console.log('🧹 Cleaning up test data...');
    await supabaseAdmin
      .from('schedules')
      .delete()
      .eq('id', insertedSchedule.id);
    
    console.log('✅ Test data cleaned up');
    
    return NextResponse.json({
      success: true,
      data: {
        requestData: {
          affiliate_links: affiliate_links,
          affiliate_links_type: typeof affiliate_links,
          affiliate_links_isArray: Array.isArray(affiliate_links),
          affiliate_links_length: Array.isArray(affiliate_links) ? affiliate_links.length : 'N/A'
        },
        reviewData: {
          affiliate_links: review.affiliate_links,
          affiliate_links_type: typeof review.affiliate_links,
          affiliate_links_isArray: Array.isArray(review.affiliate_links),
          affiliate_links_length: Array.isArray(review.affiliate_links) ? review.affiliate_links.length : 'N/A'
        },
        processedData: {
          affiliate_links: affiliateLinksArray,
          affiliate_links_type: typeof affiliateLinksArray,
          affiliate_links_isArray: Array.isArray(affiliateLinksArray),
          affiliate_links_length: Array.isArray(affiliateLinksArray) ? affiliateLinksArray.length : 'N/A'
        },
        insertedData: {
          id: insertedSchedule.id,
          affiliate_links: insertedSchedule.affiliate_links,
          affiliate_links_type: typeof insertedSchedule.affiliate_links,
          affiliate_links_isArray: Array.isArray(insertedSchedule.affiliate_links),
          affiliate_links_length: Array.isArray(insertedSchedule.affiliate_links) ? insertedSchedule.affiliate_links.length : 'N/A'
        },
        analysis: {
          requestHasLinks: Array.isArray(affiliate_links) && affiliate_links.length > 0,
          reviewHasLinks: Array.isArray(review.affiliate_links) && review.affiliate_links.length > 0,
          finalHasLinks: Array.isArray(affiliateLinksArray) && affiliateLinksArray.length > 0,
          insertedHasLinks: Array.isArray(insertedSchedule.affiliate_links) && insertedSchedule.affiliate_links.length > 0,
          dataFlowCorrect: Array.isArray(affiliateLinksArray) && affiliateLinksArray.length > 0 && Array.isArray(insertedSchedule.affiliate_links) && insertedSchedule.affiliate_links.length > 0
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug schedule creation logs:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
