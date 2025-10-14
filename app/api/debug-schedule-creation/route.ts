import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug Schedule Creation - Starting...');
    
    const body = await request.json();
    console.log('📋 Request body:', body);
    
    // 1. Get review data
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
        review_seo_keywords
      `)
      .eq('id', body.reviewId)
      .single();
    
    if (reviewError) {
      throw new Error(`Review error: ${reviewError.message}`);
    }
    
    console.log('📋 Review data:', review);
    
    // 2. Prepare schedule data (mimicking the API logic)
    const affiliateLinksArray = body.affiliate_links || review.affiliate_links || [];
    
    console.log('🔍 Affiliate links processing:', {
      body_affiliate_links: body.affiliate_links,
      review_affiliate_links: review.affiliate_links,
      final_array: affiliateLinksArray,
      array_length: Array.isArray(affiliateLinksArray) ? affiliateLinksArray.length : 'not array',
      array_type: typeof affiliateLinksArray
    });
    
    // 3. Test the schedule data that would be inserted
    const scheduleData = {
      user_id: 'test-user-id',
      review_id: body.reviewId,
      scheduled_for: body.scheduledFor,
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: body.targetType,
      target_id: body.targetId || 'make-com-handled',
      target_name: body.targetName || 'Make.com Auto',
      post_message: 'Test message',
      landing_page_url: 'http://localhost:3000/test',
      affiliate_links: affiliateLinksArray, // This is the key field
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
      video_title: review.video_title,
      video_url: 'https://test.com',
      video_thumbnail: 'https://test.com/thumb.jpg',
      channel_name: review.channel_name,
      review_summary: review.review_summary,
      review_pros: review.review_pros,
      review_cons: review.review_cons,
      review_key_points: review.review_key_points,
      review_target_audience: review.review_target_audience,
      review_cta: review.review_cta,
      review_seo_keywords: review.review_seo_keywords,
    };
    
    console.log('📋 Schedule data to be inserted:', {
      ...scheduleData,
      affiliate_links: affiliateLinksArray,
      affiliate_links_type: typeof affiliateLinksArray,
      affiliate_links_isArray: Array.isArray(affiliateLinksArray)
    });
    
    // 4. Test the insert query (without actually inserting)
    console.log('🔧 Testing insert query structure...');
    
    // Simulate what Supabase would receive
    const insertData = {
      ...scheduleData,
      affiliate_links: affiliateLinksArray
    };
    
    console.log('📤 Insert data structure:', {
      affiliate_links: insertData.affiliate_links,
      affiliate_links_type: typeof insertData.affiliate_links,
      affiliate_links_stringified: JSON.stringify(insertData.affiliate_links)
    });
    
    // 5. Check if affiliate_links is properly formatted for jsonb
    let jsonbCompatible = false;
    try {
      if (Array.isArray(affiliateLinksArray)) {
        JSON.stringify(affiliateLinksArray);
        jsonbCompatible = true;
        console.log('✅ Affiliate links is JSONB compatible');
      } else {
        console.log('❌ Affiliate links is not an array');
      }
    } catch (error) {
      console.log('❌ Affiliate links is not JSON serializable:', error);
    }
    
    return NextResponse.json({
      success: true,
      data: {
        review,
        scheduleData: {
          ...scheduleData,
          affiliate_links: affiliateLinksArray
        },
        analysis: {
          bodyAffiliateLinks: body.affiliate_links,
          reviewAffiliateLinks: review.affiliate_links,
          finalAffiliateLinks: affiliateLinksArray,
          affiliateLinksType: typeof affiliateLinksArray,
          affiliateLinksIsArray: Array.isArray(affiliateLinksArray),
          affiliateLinksLength: Array.isArray(affiliateLinksArray) ? affiliateLinksArray.length : 'N/A',
          jsonbCompatible: jsonbCompatible
        },
        recommendations: [
          jsonbCompatible ? '✅ Affiliate links is properly formatted for JSONB' : '❌ Affiliate links is not JSONB compatible',
          Array.isArray(affiliateLinksArray) ? '✅ Affiliate links is an array' : '❌ Affiliate links is not an array',
          affiliateLinksArray.length > 0 ? '✅ Affiliate links has data' : '⚠️ Affiliate links is empty'
        ]
      }
    });
    
  } catch (error) {
    console.error('❌ Error debugging schedule creation:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
