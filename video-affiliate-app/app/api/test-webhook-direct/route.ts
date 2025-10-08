import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// API test đơn giản nhất để gửi webhook
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing webhook with direct URL...');
    
    const body = await request.json();
    const webhookUrl = body.webhookUrl;
    
    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'Webhook URL is required'
      }, { status: 400 });
    }
    
    console.log('📤 Using webhook URL:', webhookUrl);
    
    // Test payload đơn giản
    const testPayload = {
      noi_dung_dang: '🔥 Test từ Video Affiliate App\n\nĐây là bài test để kiểm tra webhook Make.com',
      video_url: 'https://www.youtube.com/watch?v=test',
      affiliate_links: 'https://example.com/affiliate',
      url_landing_page: 'https://yourdomain.com/review/test',
      video_thumbnail: 'https://via.placeholder.com/300x200',
      reviewId: 'test-review-id',
      timestamp: new Date().toISOString(),
      source: 'video-affiliate-app',
    };
    
    console.log('📤 Sending test payload to Make.com...');
    
    // Gửi đến Make.com webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Video-Affiliate-App/1.0',
      },
      body: JSON.stringify(testPayload),
    });
    
    const responseText = await webhookResponse.text();
    
    if (webhookResponse.ok) {
      console.log('✅ Successfully sent to Make.com');
      console.log('📋 Response:', responseText);
      
      return NextResponse.json({
        success: true,
        message: 'Test webhook sent successfully to Make.com',
        webhookResponse: 'success',
        response: responseText
      });
    } else {
      console.log('❌ Make.com webhook failed:', webhookResponse.status);
      console.log('📋 Error response:', responseText);
      
      return NextResponse.json({
        success: false,
        error: `Make.com webhook failed: ${webhookResponse.status}`,
        response: responseText
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send webhook',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
