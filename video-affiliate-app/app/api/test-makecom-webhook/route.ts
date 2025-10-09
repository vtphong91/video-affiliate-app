import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Test API để gửi real data tới Make.com với URL thật
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing Make.com webhook with real data...');
    
    // Get webhook URL from request body or use default
    const body = await request.json();
    const webhookUrl = body.webhookUrl || process.env.MAKECOM_WEBHOOK_URL;
    
    if (!webhookUrl) {
      return NextResponse.json({
        success: false,
        error: 'Webhook URL is required',
        message: 'Please provide webhookUrl in request body or set MAKECOM_WEBHOOK_URL environment variable'
      }, { status: 400 });
    }
    
    console.log('📤 Using webhook URL:', webhookUrl);
    
    // Prepare real data payload
    const webhookPayload = {
      noi_dung_dang: `🔥 [MÁY LÀM SỮA HẠT ĐA NĂNG EJM486IVY] ĐA NĂNG ĐÚNG GU, VỊ NGON ĐÚNG Ý

Video giới thiệu Máy làm sữa hạt đa năng EJM486IVY với công nghệ tiên tiến, giúp bạn tạo ra những ly sữa hạt thơm ngon, bổ dưỡng ngay tại nhà.

📺 Xem video: https://www.youtube.com/watch?v=X7U_-q4AemQ

🔗 Đọc review đầy đủ: https://yourdomain.com/review/may-lam-sua-hat-da-nang-ejm486ivy-da-nang-dung-gu-vi-ngon-dung-y-507815`,
      video_url: 'https://www.youtube.com/watch?v=X7U_-q4AemQ',
      affiliate_links: [
        {
          platform: 'Shopee',
          url: 'https://shopee.vn/product/123456',
          price: '1,299,000 VND',
          discount: 'Giảm 20%'
        },
        {
          platform: 'Lazada',
          url: 'https://lazada.vn/product/123456',
          price: '1,350,000 VND',
          discount: 'Miễn phí ship'
        }
      ],
      url_landing_page: 'https://yourdomain.com/review/may-lam-sua-hat-da-nang-ejm486ivy-da-nang-dung-gu-vi-ngon-dung-y-507815',
      video_thumbnail: 'https://img.youtube.com/vi/X7U_-q4AemQ/maxresdefault.jpg',
      reviewId: 'a2e7bbae-b850-4326-a229-839fe9306a47',
      timestamp: new Date().toISOString(),
      source: 'video-affiliate-app',
    };
    
    console.log('📤 Sending payload to Make.com:', {
      noi_dung_dang: webhookPayload.noi_dung_dang.substring(0, 100) + '...',
      video_url: webhookPayload.video_url,
      url_landing_page: webhookPayload.url_landing_page,
      reviewId: webhookPayload.reviewId
    });
    
    // Send to Make.com webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Video-Affiliate-App/1.0',
      },
      body: JSON.stringify(webhookPayload),
    });
    
    const responseText = await webhookResponse.text();
    
    if (webhookResponse.ok) {
      console.log('✅ Successfully sent to Make.com');
      console.log('📋 Response:', responseText);
      
      return NextResponse.json({
        success: true,
        message: 'Real data sent to Make.com successfully',
        data: {
          webhookUrl: webhookUrl,
          status: webhookResponse.status,
          response: responseText,
          payload: webhookPayload
        }
      });
    } else {
      console.log('❌ Make.com webhook failed:', webhookResponse.status);
      console.log('📋 Error response:', responseText);
      
      return NextResponse.json({
        success: false,
        error: 'Make.com webhook failed',
        details: {
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          response: responseText
        }
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send data to Make.com',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
