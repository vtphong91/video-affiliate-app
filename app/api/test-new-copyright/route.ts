import { NextResponse } from 'next/server';
import { formatFacebookPost } from '@/lib/apis/facebook';

export const dynamic = 'force-dynamic';

// GET /api/test-new-copyright - Test new copyright format
export async function GET() {
  try {
    console.log('🔍 Testing new copyright format...');
    
    // Test data
    const testData = {
      title: '[QUẠT TUẦN HOÀN KHÔNG KHÍ - ENF156IVY] GIÓ MÁT TUẦN HOÀN, THOÁNG ĐÃNG KHÔNG GIAN',
      summary: 'Đánh giá chi tiết về sản phẩm quạt tuần hoàn không khí LocknLock ENF156IVY',
      pros: [
        'Thiết kế hiện đại, sang trọng',
        'Công nghệ tuần hoàn không khí tiên tiến',
        'Tiết kiệm điện năng',
        'Dễ dàng vệ sinh và bảo trì'
      ],
      cons: [
        'Giá thành khá cao',
        'Cần không gian rộng để đặt'
      ],
      targetAudience: [
        'Gia đình có trẻ nhỏ',
        'Người quan tâm đến chất lượng không khí',
        'Hộ gia đình có không gian sống rộng'
      ],
      keywords: [
        'quạt tuần hoàn',
        'LocknLock',
        'không khí sạch',
        'tiết kiệm điện',
        'gia đình'
      ],
      channelName: 'TechReview Channel',
      landingUrl: 'https://example.com/review/quat-tuan-hoan-locknlock'
    };
    
    // Generate post message with corrected format
    const postMessage = formatFacebookPost(testData);
    
    console.log('✅ Corrected copyright format test completed');
    
    return NextResponse.json({
      success: true,
      testData,
      postMessage,
      message: 'Corrected copyright format test completed'
    });
    
  } catch (error) {
    console.error('❌ Exception in test new copyright:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
