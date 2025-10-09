import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';
import { formatFacebookPost } from '@/lib/apis/facebook';
import { getLandingPageUrl } from '@/lib/utils';

export const dynamic = 'force-dynamic';

// Test API để debug real data generation
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing real data generation...');
    
    const reviewId = '45e448df-d4ef-4d5d-9303-33109f9d6c30';
    
    // Get review data
    console.log('📋 Fetching review data...');
    const review = await db.getReview(reviewId);
    if (!review) {
      return NextResponse.json({
        success: false,
        error: 'Review not found',
        details: `Review with ID ${reviewId} does not exist`
      }, { status: 404 });
    }
    
    console.log('✅ Review found:', review.video_title);
    
    // Generate real post message
    const landingUrl = getLandingPageUrl(review.slug);
    const realPostMessage = formatFacebookPost({
      title: review.custom_title || review.video_title,
      summary: review.summary,
      pros: review.pros,
      cons: review.cons,
      targetAudience: review.target_audience,
      keywords: review.seo_keywords,
      videoUrl: review.video_url,
      channelName: review.channel_name,
      landingUrl,
    });
    
    console.log('📝 Generated real post message:', realPostMessage.substring(0, 100) + '...');
    
    // Create schedule with real data
    const scheduleData = {
      user_id: 'default-user-id',
      review_id: reviewId,
      scheduled_for: '2025-01-08T21:00:00.000Z',
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: 'page',
      target_id: 'make-com-handled',
      target_name: 'Make.com Auto',
      post_message: realPostMessage, // Real post message
      landing_page_url: landingUrl, // Real landing URL
      status: 'pending' as const,
      retry_count: 0,
      max_retries: 3,
    };
    
    console.log('📤 Creating schedule with real data...');
    const schedule = await db.createSchedule(scheduleData);
    console.log('✅ Schedule created:', schedule.id);
    
    return NextResponse.json({
      success: true,
      message: 'Real data schedule created successfully',
      data: {
        scheduleId: schedule.id,
        reviewTitle: review.video_title,
        postMessagePreview: realPostMessage.substring(0, 200) + '...',
        landingUrl: landingUrl
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create schedule with real data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
