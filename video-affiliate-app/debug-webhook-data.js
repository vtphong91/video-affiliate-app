// Debug script để kiểm tra dữ liệu thực tế được gửi trong webhook
// Chạy trong browser console khi đang ở trang review detail

function debugWebhookData() {
  console.log('🔍 Debugging webhook data...');
  
  // Lấy dữ liệu từ trang hiện tại
  const reviewData = {
    // Có thể lấy từ DOM hoặc từ state của component
    reviewId: 'current-review-id',
    message: 'current-message-content',
    videoUrl: 'current-video-url',
    affiliateLinks: 'current-affiliate-links',
    landingPageUrl: 'current-landing-url',
    videoThumbnail: 'current-thumbnail'
  };
  
  console.log('📊 Review Data:', reviewData);
  
  // Kiểm tra payload sẽ được gửi
  const expectedPayload = {
    noi_dung_dang: reviewData.message,
    video_url: reviewData.videoUrl,
    affiliate_links: reviewData.affiliateLinks,
    url_landing_page: reviewData.landingPageUrl,
    video_thumbnail: reviewData.videoThumbnail,
    reviewId: reviewData.reviewId,
    timestamp: new Date().toISOString(),
    source: 'video-affiliate-app'
  };
  
  console.log('📤 Expected Webhook Payload:', expectedPayload);
  
  return expectedPayload;
}

// Function để test với dữ liệu thực tế
async function testRealWebhook() {
  try {
    console.log('🧪 Testing webhook with real review data...');
    
    // Lấy dữ liệu từ trang hiện tại (cần customize theo trang)
    const payload = debugWebhookData();
    
    const response = await fetch('/api/post-facebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    
    console.log('📥 Response:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Real webhook test successful!');
    } else {
      console.error('❌ Real webhook test failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

console.log('Debug functions ready:');
console.log('- debugWebhookData() - Check current data');
console.log('- testRealWebhook() - Test with real data');
