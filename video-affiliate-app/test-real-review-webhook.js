// Test với dữ liệu thực tế từ review
// Chạy trong browser console khi đang ở trang review detail

async function testRealReviewWebhook() {
  try {
    console.log('🧪 Testing webhook with REAL review data...');
    
    const realPayload = {
      reviewId: "45e448df-d4ef-4d5d-9303-33109f9d6c30",
      message: `🔥 [MÁY HÚT BỤI CẦM TAY MINI ENV136WHT] TRỢ LÝ DỌN DẸP - SẠCH MỌI NGÓC NGÁCH

📝 Máy hút bụi cầm tay mini LocknLock ENV136WHT, một giải pháp dọn dẹp tiện lợi cho mọi ngóc ngách trong nhà. Sản phẩm nổi bật với thiết kế nhỏ gọn, không dây, lực hút mạnh mẽ và bộ lọc HEPA, giúp việc dọn dẹp trở nên dễ dàng và hiệu quả hơn.

✅ ƯU ĐIỂM:
• Thiết kế nhỏ gọn, không dây, dễ dàng di chuyển và sử dụng ở mọi nơi trong nhà
• Lực hút mạnh mẽ 6000 PA giúp hút sạch bụi bẩn, tóc và các mảnh vụn nhỏ
• Bộ lọc HEPA và màng lọc SS có khả năng lọc bụi mịn, bảo vệ sức khỏe gia đình

⚠️ NHƯỢC ĐIỂM CẦN LƯU Ý:
• Thời gian hoạt động có thể bị giới hạn bởi dung lượng pin
• Lực hút 6000 PA có thể không đủ mạnh cho các loại bụi bẩn cứng đầu

👥 PHÙ HỢP VỚI:
• Người sống trong căn hộ nhỏ hoặc nhà có diện tích hạn chế
• Người có ô tô riêng, muốn giữ cho xe luôn sạch sẽ

🎥 Xem video gốc:
https://www.youtube.com/watch?v=q36T0U1DTn4

📱 Xem phân tích chi tiết + so sánh:
https://videoaffiliate.com/review/may-hut-bui-cam-tay-mini-env136wht-tro-ly-don-dep-sach-moi-ngoc-ngach-007019

⚖️ Bản quyền video thuộc về LocknLock Vietnam
Mọi quyền thuộc về kênh gốc. Đây chỉ là nội dung tham khảo.

#máyhútbụicầmtay #máyhútbụimini #LocknLockENV136WHT #máyhútbụikhôngdây #máyhútbụigiađình`,
      videoUrl: "https://www.youtube.com/watch?v=q36T0U1DTn4",
      affiliateLinks: [
        {
          platform: "ĐẶT MUA TẠI SHOPEE",
          url: "https://shorten.asia/jFAYzMA1",
          price: "1.056.000đ"
        }
      ],
      landingPageUrl: "https://videoaffiliate.com/review/may-hut-bui-cam-tay-mini-env136wht-tro-ly-don-dep-sach-moi-ngoc-ngach-007019",
      videoThumbnail: "https://i.ytimg.com/vi/q36T0U1DTn4/maxresdefault.jpg",
      imageUrl: "https://i.ytimg.com/vi/q36T0U1DTn4/maxresdefault.jpg",
      affiliateComment: "🛒 LINK MUA HÀNG:\n\n1. ĐẶT MUA TẠI SHOPEE: https://shorten.asia/jFAYzMA1 - 1.056.000đ"
    };
    
    console.log('📤 Sending REAL payload:', realPayload);
    
    const response = await fetch('/api/post-facebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(realPayload),
    });

    const data = await response.json();
    
    console.log('📥 Response:', data);
    
    if (response.ok && data.success) {
      console.log('✅ REAL webhook test successful!');
      console.log('🎉 Make.com should receive REAL review content now!');
    } else {
      console.error('❌ REAL webhook test failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

console.log('Real review test ready! Call testRealReviewWebhook() to test with actual review data.');
