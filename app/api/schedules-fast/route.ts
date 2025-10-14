import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { formatFacebookPost } from '@/lib/apis/facebook';

export const dynamic = 'force-dynamic';

// POST /api/schedules-fast - Fast schedule creation without profile check
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Fast schedule creation API called');
    
    const body = await request.json();
    const {
      reviewId,
      scheduledFor,
      targetType = 'page',
      targetId = 'make-com-handled',
      targetName = 'Make.com Auto',
      landingPageUrl,
      affiliate_links = []
    } = body;

    // Get review data
    const review = await db.getReview(reviewId);
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Generate post message
    const postMessage = formatFacebookPost({
      title: review.video_title,
      summary: review.review_summary || review.summary || 'Đánh giá chi tiết về sản phẩm',
      pros: review.review_pros || review.pros || [],
      cons: review.review_cons || review.cons || [],
      targetAudience: review.review_target_audience || review.target_audience || [],
      keywords: review.review_seo_keywords || review.seo_keywords || [],
      channelName: review.channel_name,
      landingUrl: landingPageUrl
    });

    // Get affiliate_links from request or review (prioritize request)
    const affiliateLinksArray = affiliate_links || review.affiliate_links || [];
    
    console.log('🔍 Fast API affiliate_links debug:', {
      request_affiliate_links: affiliate_links,
      review_affiliate_links: review.affiliate_links,
      final_array: affiliateLinksArray,
      array_length: Array.isArray(affiliateLinksArray) ? affiliateLinksArray.length : 'not array',
      array_type: typeof affiliateLinksArray
    });

    // Create schedule directly
    const schedule = await db.createSchedule({
      user_id: '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1', // Hardcoded for testing
      review_id: reviewId,
      scheduled_for: scheduledFor,
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: targetType,
      target_id: targetId,
      target_name: targetName,
      post_message: postMessage,
      landing_page_url: landingPageUrl,
      affiliate_links: affiliateLinksArray, // Save as jsonb array
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
      // Add review information to schedules table
      video_title: review.video_title,
      video_url: review.video_url,
      video_thumbnail: review.video_thumbnail,
      channel_name: review.channel_name,
      review_summary: review.review_summary || review.summary,
      review_pros: review.review_pros || review.pros,
      review_cons: review.review_cons || review.cons,
      review_key_points: review.review_key_points || review.key_points,
      review_target_audience: review.review_target_audience || review.target_audience,
      review_cta: review.review_cta || review.cta,
      review_seo_keywords: review.review_seo_keywords || review.seo_keywords,
    });

    console.log('✅ Fast schedule created:', schedule.id);

    return NextResponse.json({
      success: true,
      schedule: schedule,
      message: 'Schedule created successfully'
    });

  } catch (error) {
    console.error('❌ Fast schedule creation failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create schedule',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
