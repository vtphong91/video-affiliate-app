import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

interface PostWebhookRequest {
  reviewId: string;
  message: string; // nội dung đăng
  videoUrl: string; // video_url
  affiliateLinks: Array<{
    platform: string;
    url: string;
    price?: string;
    discount?: string;
  }>; // Affiliate Links
  landingPageUrl: string; // url_landing_page
  videoThumbnail: string; // video_thumbnail
  imageUrl?: string; // optional image
  affiliateComment?: string | null; // optional affiliate comment
}

interface MakeWebhookResponse {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PostWebhookRequest = await request.json();
    const {
      reviewId,
      message,
      videoUrl,
      affiliateLinks,
      landingPageUrl,
      videoThumbnail,
      imageUrl,
      affiliateComment,
    } = body;

    // Get webhook configuration from environment variables
    const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
    const webhookSecret = process.env.MAKECOM_WEBHOOK_SECRET;

    // Validate webhook configuration
    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'MAKECOM_WEBHOOK_URL không được cấu hình trong .env. Vui lòng liên hệ admin.'
        },
        { status: 500 }
      );
    }

    // Validate required fields
    if (!reviewId || !message || !videoUrl || !affiliateLinks || !landingPageUrl || !videoThumbnail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: reviewId, message, videoUrl, affiliateLinks, landingPageUrl, videoThumbnail'
        },
        { status: 400 }
      );
    }

    // Validate webhook URL format
    if (!webhookUrl.startsWith('https://hook.') || !webhookUrl.includes('make.com')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid Make.com webhook URL format in .env'
        },
        { status: 500 }
      );
    }

    // Get review data to populate additional fields
    let reviewData = null;
    try {
      reviewData = await db.getReview(reviewId);
    } catch (error) {
      console.warn('Could not fetch review data:', error);
    }

    // Prepare webhook payload với tên biến đồng bộ với cron service
    const webhookPayload: any = {
      // Các trường chính theo chuẩn cron service
      scheduleId: `manual-${Date.now()}`, // ID cho manual post
      reviewId: reviewId,
      targetType: 'page', // Mặc định là page
      targetId: 'make-com-handled', // Mặc định là make-com-handled
      targetName: 'Make.com Manual', // Mặc định là manual
      message: message,
      link: landingPageUrl,
      imageUrl: imageUrl || videoThumbnail,
      videoUrl: videoUrl,
      videoTitle: reviewData?.video_title || reviewData?.custom_title || '',
      channelName: reviewData?.channel_name || '',
      affiliateLinks: affiliateLinks,
      reviewSummary: reviewData?.summary || '',
      reviewPros: reviewData?.pros || [],
      reviewCons: reviewData?.cons || [],
      reviewKeyPoints: reviewData?.key_points || [],
      reviewTargetAudience: reviewData?.target_audience || [],
      reviewCta: reviewData?.cta || '',
      reviewSeoKeywords: reviewData?.seo_keywords || [],
      scheduledFor: new Date().toISOString(), // Thời gian hiện tại
      triggeredAt: new Date().toISOString(),
      retryAttempt: 0, // Manual post không có retry
    };

    // Add optional fields
    if (imageUrl) {
      webhookPayload.imageUrl = imageUrl;
    }

    // Add affiliate comment if provided
    if (affiliateComment) {
      webhookPayload.affiliateComment = affiliateComment;
    }

    // Add secret for verification if provided
    if (webhookSecret) {
      webhookPayload.secret = webhookSecret;
    }

    console.log('Sending webhook to Make.com:', { webhookUrl, reviewId });

    // Send webhook to Make.com
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VideoAffiliateApp/1.0',
      },
      body: JSON.stringify(webhookPayload),
    });

    // Check if webhook was accepted
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Make.com webhook error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });

      throw new Error(
        `Make.com webhook failed: ${response.status} ${response.statusText}`
      );
    }

    // Parse response from Make.com
    let result: MakeWebhookResponse;
    try {
      result = await response.json();
    } catch (parseError) {
      // Some webhooks might return empty or non-JSON response
      console.warn('Could not parse Make.com response as JSON, assuming success');
      result = { success: true };
    }

    console.log('Make.com response:', result);

    // Update review in database if we got post info back
    if (result.postId || result.postUrl) {
      try {
        await db.updateReview(reviewId, {
          fb_post_id: result.postId,
          fb_post_url: result.postUrl,
          posted_at: new Date().toISOString(),
          status: 'published',
        });
        console.log('Review updated in database:', reviewId);
      } catch (dbError) {
        console.error('Error updating review in database:', dbError);
        // Don't fail the request if DB update fails - post was successful
      }
    } else {
      // Even if we don't get post details back, mark as posted
      try {
        await db.updateReview(reviewId, {
          posted_at: new Date().toISOString(),
          status: 'published',
        });
      } catch (dbError) {
        console.error('Error updating review in database:', dbError);
      }
    }

    return NextResponse.json({
      success: true,
      postId: result.postId || 'posted',
      postUrl: result.postUrl || landingPageUrl,
      message: 'Successfully sent to Make.com for posting',
    });
  } catch (error) {
    console.error('Error in post-facebook route:', error);

    let errorMessage = 'Failed to send webhook to Make.com';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // Handle specific error types
      if (errorMessage.includes('fetch failed') || errorMessage.includes('ECONNREFUSED')) {
        statusCode = 503;
        errorMessage = 'Không thể kết nối với Make.com. Vui lòng kiểm tra Webhook URL.';
      } else if (errorMessage.includes('timeout')) {
        statusCode = 504;
        errorMessage = 'Make.com webhook timeout. Vui lòng thử lại.';
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        statusCode = 401;
        errorMessage = 'Webhook không được phép. Vui lòng kiểm tra lại cấu hình Make.com.';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
