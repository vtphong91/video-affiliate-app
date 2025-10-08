// Test script để test webhook với payload thực tế
// Chạy trong browser console hoặc sử dụng curl

const testPayload = {
  reviewId: "test-review-123",
  message: "🎥 Review Chi Tiết iPhone 16 Pro Max\n\n📱 Camera mới với zoom 5x\n⚡ Chip A18 Pro siêu mạnh\n🔋 Pin cả ngày không lo\n\n#iPhone16ProMax #Apple #TechReview",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  affiliateLinks: [
    {
      platform: "Shopee",
      url: "https://shopee.vn/iphone-16-pro-max-i123456789",
      price: "29,990,000 VNĐ",
      discount: "Giảm 500K"
    },
    {
      platform: "Lazada", 
      url: "https://lazada.vn/iphone-16-pro-max-o987654321",
      price: "29,990,000 VNĐ",
      discount: "Tặng kèm AirPods"
    }
  ],
  landingPageUrl: "https://videoaffiliate.com/review/iphone-16-pro-max-review-chi-tiet-123456",
  videoThumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  imageUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  affiliateComment: "🛒 LINK MUA HÀNG:\n\n1. Shopee: https://shopee.vn/iphone-16-pro-max-i123456789 - 29,990,000 VNĐ (Giảm 500K)\n2. Lazada: https://lazada.vn/iphone-16-pro-max-o987654321 - 29,990,000 VNĐ (Tặng kèm AirPods)"
};

// Test function
async function testWebhook() {
  try {
    console.log('🧪 Testing webhook with real payload...');
    
    const response = await fetch('/api/post-facebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('✅ Webhook test successful!');
      console.log('Response:', data);
    } else {
      console.error('❌ Webhook test failed!');
      console.error('Status:', response.status);
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Uncomment để chạy test
// testWebhook();

console.log('Test payload ready. Call testWebhook() to run the test.');
