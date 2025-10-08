import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const webhookUrl = process.env.MAKE_WEBHOOK_URL;
    const webhookSecret = process.env.MAKE_WEBHOOK_SECRET;

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'MAKE_WEBHOOK_URL không được cấu hình trong .env' },
        { status: 500 }
      );
    }

    // Send test request to Make.com webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(webhookSecret && { 'X-Webhook-Secret': webhookSecret }),
      },
      body: JSON.stringify({
        test: true,
        noi_dung_dang: '🧪 Test từ Video Affiliate App - Nội dung đăng',
        video_url: 'https://www.youtube.com/watch?v=test123',
        affiliate_links: [
          {
            platform: 'Shopee',
            url: 'https://shopee.vn/test-product',
            price: '299,000 VNĐ',
            discount: 'Giảm 10%'
          }
        ],
        url_landing_page: 'https://example.com/review/test-review',
        video_thumbnail: 'https://i.ytimg.com/vi/test123/maxresdefault.jpg',
        timestamp: new Date().toISOString(),
        source: 'video-affiliate-app',
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook test successful',
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to test webhook',
      },
      { status: 500 }
    );
  }
}
