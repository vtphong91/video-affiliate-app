// Test script để kiểm tra Reviews page
// Chạy trong browser console khi đang ở trang dashboard/reviews

function testReviewsPage() {
  console.log('🧪 Testing Reviews Page...');
  
  // Check if we're on the reviews page
  if (!window.location.pathname.includes('/dashboard/reviews')) {
    console.log('⚠️ Not on reviews page, navigating...');
    window.location.href = '/dashboard/reviews';
    return;
  }
  
  // Check if page loaded without errors
  const errorElements = document.querySelectorAll('[class*="error"]');
  if (errorElements.length > 0) {
    console.log('❌ Found error elements on page');
    errorElements.forEach((el, index) => {
      console.log(`Error ${index + 1}:`, el.textContent);
    });
    return;
  }
  
  // Check if reviews count is displayed
  const countElement = document.querySelector('p.text-gray-600');
  if (countElement && countElement.textContent.includes('landing pages đã tạo')) {
    console.log('✅ Reviews count displayed successfully');
    console.log('Count text:', countElement.textContent);
  } else {
    console.log('⚠️ Reviews count not found or not displayed');
  }
  
  // Check if reviews list is rendered
  const reviewsList = document.querySelectorAll('[class*="grid gap-4"] > div');
  if (reviewsList.length > 0) {
    console.log(`✅ Found ${reviewsList.length} review cards`);
    
    // Check first review card
    const firstReview = reviewsList[0];
    const title = firstReview.querySelector('h3');
    const thumbnail = firstReview.querySelector('img');
    const status = firstReview.querySelector('[class*="badge"]');
    
    if (title) console.log('✅ Review title:', title.textContent);
    if (thumbnail) console.log('✅ Review thumbnail:', thumbnail.src);
    if (status) console.log('✅ Review status:', status.textContent);
    
  } else {
    console.log('ℹ️ No reviews found (empty state)');
    
    // Check empty state
    const emptyState = document.querySelector('[class*="text-center text-gray-500"]');
    if (emptyState) {
      console.log('✅ Empty state displayed correctly');
      console.log('Empty state text:', emptyState.textContent);
    }
  }
  
  // Check action buttons
  const createButton = document.querySelector('a[href="/dashboard/create"]');
  if (createButton) {
    console.log('✅ Create button found');
  }
  
  console.log('🎉 Reviews page test completed!');
}

function testReviewsAPI() {
  console.log('🌐 Testing Reviews API...');
  
  fetch('/api/reviews')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Reviews API working');
        console.log(`📊 Found ${data.data.length} reviews`);
        console.log('API response structure:', {
          success: data.success,
          dataLength: data.data.length,
          total: data.total
        });
        
        if (data.data.length > 0) {
          console.log('First review:', {
            id: data.data[0].id,
            title: data.data[0].video_title,
            status: data.data[0].status,
            platform: data.data[0].video_platform
          });
        }
      } else {
        console.error('❌ Reviews API failed:', data.error);
      }
    })
    .catch(error => {
      console.error('❌ Reviews API error:', error);
    });
}

function testReviewsWithSchedules() {
  console.log('📅 Testing Reviews API with excludeScheduled...');
  
  fetch('/api/reviews?excludeScheduled=true')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Reviews API with excludeScheduled working');
        console.log(`📊 Found ${data.data.length} reviews without schedules`);
        
        // Compare with regular API
        fetch('/api/reviews')
          .then(response => response.json())
          .then(allData => {
            if (allData.success) {
              console.log(`📊 Total reviews: ${allData.data.length}`);
              console.log(`📊 Reviews without schedules: ${data.data.length}`);
              console.log(`📊 Reviews with schedules: ${allData.data.length - data.data.length}`);
            }
          });
      } else {
        console.error('❌ Reviews API with excludeScheduled failed:', data.error);
      }
    })
    .catch(error => {
      console.error('❌ Reviews API with excludeScheduled error:', error);
    });
}

// Export functions
window.reviewsTests = {
  testReviewsPage,
  testReviewsAPI,
  testReviewsWithSchedules,
};

console.log('Reviews test functions loaded!');
console.log('Available functions:');
console.log('- reviewsTests.testReviewsPage() - Test reviews page UI');
console.log('- reviewsTests.testReviewsAPI() - Test reviews API');
console.log('- reviewsTests.testReviewsWithSchedules() - Test reviews API with schedule filtering');
