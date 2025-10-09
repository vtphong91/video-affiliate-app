import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Test webhook endpoint - Send test data to Make.com
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing webhook to Make.com...');
    
    const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'MAKECOM_WEBHOOK_URL not configured'
      }, { status: 400 });
    }

    // Test payload
    const testPayload = {
      scheduleId: 'test-schedule-123',
      reviewId: 'test-review-456',
      targetType: 'page',
      targetId: 'facebook-page-real',
      targetName: 'Facebook Page Real',
      message: '🧪 TEST WEBHOOK - This is a test message from Video Affiliate App',
      link: 'http://localhost:3000/test',
      imageUrl: 'https://i.ytimg.com/vi/test/maxresdefault.jpg',
      videoUrl: 'https://www.youtube.com/watch?v=test',
      videoTitle: 'Test Video Title',
      channelName: 'Test Channel',
      affiliateLinks: [
        {
          url: 'https://test.com',
          price: '100.000đ',
          platform: 'Test Platform'
        }
      ],
      reviewSummary: 'This is a test review summary',
      reviewPros: ['Test pro 1', 'Test pro 2'],
      reviewCons: ['Test con 1', 'Test con 2'],
      reviewKeyPoints: ['Test point 1', 'Test point 2'],
      reviewTargetAudience: 'Test target audience',
      reviewCta: 'Test CTA message',
      reviewSeoKeywords: ['test', 'webhook', 'make.com'],
      scheduledFor: new Date().toISOString(),
      triggeredAt: new Date().toISOString(),
      retryAttempt: 0,
    };

    console.log('📤 Sending test webhook to:', webhookUrl);
    console.log('📋 Test payload:', JSON.stringify(testPayload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'VideoAffiliate-Test/1.0',
      },
      body: JSON.stringify(testPayload),
    });

    const responseText = await response.text();
    console.log(`📥 Make.com response: ${response.status} - ${responseText}`);

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      response: responseText,
      webhookUrl: webhookUrl,
      payload: testPayload,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('❌ Test webhook error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
