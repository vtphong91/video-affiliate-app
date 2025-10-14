import { NextRequest, NextResponse } from 'next/server';
import { formatFacebookPost } from '@/lib/apis/facebook';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Test formatFacebookPost API called');
    
    // Test data với đầy đủ thông tin
    const testData = {
      title: '[QUẠT TUẦN HOÀN KHÔNG KHÍ - ENF156IVY] GIÓ MÁT TUẦN HOÀN, THOÁNG ĐÃNG KHÔNG GIAN',
      summary: 'Quạt tuần hoàn không khí LocknLock ENF156IVY với thiết kế hiện đại, tiết kiệm điện năng và tạo luồng gió mát mẻ cho không gian sống.',
      pros: [
        'Thiết kế hiện đại, sang trọng',
        'Tiết kiệm điện năng hiệu quả',
        'Tạo luồng gió mát mẻ, thoáng đãng',
        'Dễ dàng vệ sinh và bảo trì',
        'Hoạt động êm ái, không gây tiếng ồn'
      ],
      cons: [
        'Giá thành khá cao so với các sản phẩm cùng loại',
        'Cần không gian đủ rộng để đặt máy'
      ],
      targetAudience: [
        'Gia đình có trẻ nhỏ',
        'Người cao tuổi',
        'Người làm việc tại nhà',
        'Người quan tâm đến chất lượng không khí'
      ],
      keywords: [
        'quạt tuần hoàn',
        'locknlock',
        'không khí',
        'tiết kiệm điện',
        'gia đình',
        'văn phòng',
        'hiện đại'
      ],
      videoUrl: 'https://youtube.com/watch?v=xFSbSF1n_rk',
      channelName: 'Dealaz VN',
      landingUrl: 'http://localhost:3000/review/quat-tuan-hoan-khong-khi-enf156ivy',
      affiliateLinks: [
        {
          platform: 'SHOPEE MALL',
          price: '920.000',
          url: 'https://shorten.asia/D9u33yDr'
        },
        {
          platform: 'TIKI TRADING', 
          price: '1.539.000',
          url: 'https://shorten.asia/GBVjvr2t'
        }
      ]
    };
    
    // Test formatFacebookPost
    const formattedMessage = formatFacebookPost(testData);
    
    console.log('📝 Formatted message:', formattedMessage);
    
    return NextResponse.json({
      success: true,
      data: {
        testData,
        formattedMessage,
        messageLength: formattedMessage.length,
        linesCount: formattedMessage.split('\n').length
      }
    });
    
  } catch (error) {
    console.error('❌ Error in test formatFacebookPost API:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test formatFacebookPost',
      details: error
    }, { status: 500 });
  }
}


