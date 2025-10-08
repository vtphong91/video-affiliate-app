// Test script để kiểm tra lỗi timestamp đã được sửa
// Chạy trong browser console khi đang ở trang dashboard

function testTimestampFix() {
  console.log('🔧 Testing timestamp fix...');
  
  // Test với Date object
  const dateObj = new Date();
  console.log('Date object test:', dateObj);
  console.log('Date object type:', typeof dateObj);
  console.log('Date object instanceof Date:', dateObj instanceof Date);
  
  // Test với string
  const dateString = new Date().toISOString();
  console.log('Date string test:', dateString);
  console.log('Date string type:', typeof dateString);
  console.log('Date string instanceof Date:', dateString instanceof Date);
  
  // Test formatTimestamp function
  function formatTimestamp(timestamp) {
    const now = new Date();
    const timestampDate = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const diff = now.getTime() - timestampDate.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return timestampDate.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  // Test với Date object
  try {
    const result1 = formatTimestamp(dateObj);
    console.log('✅ Date object format result:', result1);
  } catch (error) {
    console.error('❌ Date object format error:', error);
  }
  
  // Test với string
  try {
    const result2 = formatTimestamp(dateString);
    console.log('✅ Date string format result:', result2);
  } catch (error) {
    console.error('❌ Date string format error:', error);
  }
  
  // Test với invalid string
  try {
    const result3 = formatTimestamp('invalid-date');
    console.log('⚠️ Invalid date format result:', result3);
  } catch (error) {
    console.error('❌ Invalid date format error:', error);
  }
  
  console.log('✅ Timestamp fix test completed!');
}

function testDashboardAPI() {
  console.log('🌐 Testing Dashboard API...');
  
  fetch('/api/dashboard/stats')
    .then(response => response.json())
    .then(data => {
      console.log('✅ API Response:', data);
      
      if (data.success && data.data.activities) {
        console.log('📊 Activities data:');
        data.data.activities.forEach((activity, index) => {
          console.log(`Activity ${index + 1}:`, {
            id: activity.id,
            title: activity.title,
            timestamp: activity.timestamp,
            timestampType: typeof activity.timestamp,
            isDate: activity.timestamp instanceof Date
          });
        });
        
        // Test formatTimestamp với data từ API
        data.data.activities.forEach((activity, index) => {
          try {
            const now = new Date();
            const timestampDate = activity.timestamp instanceof Date ? 
              activity.timestamp : new Date(activity.timestamp);
            const diff = now.getTime() - timestampDate.getTime();
            const minutes = Math.floor(diff / 60000);
            
            console.log(`✅ Activity ${index + 1} timestamp processed successfully:`, {
              original: activity.timestamp,
              processed: timestampDate,
              minutesAgo: minutes
            });
          } catch (error) {
            console.error(`❌ Activity ${index + 1} timestamp error:`, error);
          }
        });
      }
    })
    .catch(error => {
      console.error('❌ API Error:', error);
    });
}

function testDashboardUI() {
  console.log('🎨 Testing Dashboard UI...');
  
  // Check if dashboard elements exist
  const statsCards = document.querySelectorAll('[class*="StatsCard"]');
  const charts = document.querySelectorAll('[class*="Chart"]');
  const activities = document.querySelectorAll('[class*="RecentActivity"]');
  
  console.log('UI Elements found:', {
    statsCards: statsCards.length,
    charts: charts.length,
    activities: activities.length
  });
  
  // Check for any error messages
  const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
  if (errorElements.length > 0) {
    console.warn('⚠️ Error elements found:', errorElements.length);
    errorElements.forEach((el, index) => {
      console.log(`Error ${index + 1}:`, el.textContent);
    });
  } else {
    console.log('✅ No error elements found');
  }
  
  // Check console for errors
  const originalError = console.error;
  const errors = [];
  console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.warn('⚠️ Console errors detected:', errors.length);
      errors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error);
      });
    } else {
      console.log('✅ No console errors detected');
    }
  }, 1000);
  
  console.log('✅ Dashboard UI test completed!');
}

// Main test function
function runTimestampTests() {
  console.log('🚀 Starting Timestamp Fix Tests...');
  console.log('=====================================');
  
  testTimestampFix();
  
  setTimeout(() => {
    testDashboardAPI();
  }, 1000);
  
  setTimeout(() => {
    testDashboardUI();
  }, 2000);
  
  setTimeout(() => {
    console.log('=====================================');
    console.log('✅ All timestamp tests completed!');
    console.log('If no errors above, the timestamp fix is working correctly.');
  }, 3000);
}

// Export functions for manual testing
window.timestampTests = {
  testTimestampFix,
  testDashboardAPI,
  testDashboardUI,
  runTimestampTests
};

console.log('Timestamp test functions loaded!');
console.log('Available functions:');
console.log('- timestampTests.runTimestampTests() - Run all tests');
console.log('- timestampTests.testTimestampFix() - Test timestamp formatting');
console.log('- timestampTests.testDashboardAPI() - Test API data');
console.log('- timestampTests.testDashboardUI() - Test UI elements');
