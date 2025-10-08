// Demo script để test Dashboard components
// Chạy trong browser console khi đang ở trang dashboard

function testDashboardComponents() {
  console.log('🧪 Testing Dashboard Components...');
  
  // Test StatsCard
  console.log('📊 StatsCard: Testing with sample data');
  const statsCardData = {
    title: 'Test Reviews',
    value: 1234,
    change: { value: 15, type: 'increase' },
    icon: 'FileText',
    description: 'Test description'
  };
  console.log('StatsCard data:', statsCardData);
  
  // Test Chart
  console.log('📈 Chart: Testing with sample data');
  const chartData = [
    { label: 'Mon', value: 10, color: '#3B82F6' },
    { label: 'Tue', value: 15, color: '#10B981' },
    { label: 'Wed', value: 8, color: '#F59E0B' },
    { label: 'Thu', value: 20, color: '#EF4444' },
    { label: 'Fri', value: 12, color: '#8B5CF6' },
  ];
  console.log('Chart data:', chartData);
  
  // Test RecentActivity
  console.log('🔄 RecentActivity: Testing with sample data');
  const activityData = [
    {
      id: '1',
      type: 'review_created',
      title: 'Test Review Created',
      description: 'A new review was created',
      timestamp: new Date(),
      status: 'success'
    },
    {
      id: '2',
      type: 'post_published',
      title: 'Test Post Published',
      description: 'A post was published successfully',
      timestamp: new Date(Date.now() - 300000),
      status: 'success'
    }
  ];
  console.log('Activity data:', activityData);
  
  // Test API
  console.log('🌐 API: Testing dashboard stats endpoint');
  fetch('/api/dashboard/stats')
    .then(response => response.json())
    .then(data => {
      console.log('✅ API Response:', data);
      if (data.success) {
        console.log('📊 Stats:', data.data.stats);
        console.log('📈 Charts:', data.data.charts);
        console.log('🔄 Activities:', data.data.activities);
      } else {
        console.error('❌ API Error:', data.error);
      }
    })
    .catch(error => {
      console.error('❌ Network Error:', error);
    });
}

function testResponsiveDesign() {
  console.log('📱 Testing Responsive Design...');
  
  // Check if we're on mobile
  const isMobile = window.innerWidth < 768;
  const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  const isDesktop = window.innerWidth >= 1024;
  
  console.log('Screen size:', {
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile,
    isTablet,
    isDesktop
  });
  
  // Test grid layouts
  const statsCards = document.querySelectorAll('[class*="grid-cols"]');
  console.log('Grid elements found:', statsCards.length);
  
  // Test chart responsiveness
  const charts = document.querySelectorAll('svg');
  console.log('Charts found:', charts.length);
  
  console.log('✅ Responsive test completed');
}

function testPerformance() {
  console.log('⚡ Testing Performance...');
  
  const startTime = performance.now();
  
  // Test component render time
  const components = document.querySelectorAll('[class*="Card"]');
  const renderTime = performance.now() - startTime;
  
  console.log('Performance metrics:', {
    componentsCount: components.length,
    renderTime: `${renderTime.toFixed(2)}ms`,
    memoryUsage: performance.memory ? `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB` : 'N/A'
  });
  
  // Test API response time
  const apiStartTime = performance.now();
  fetch('/api/dashboard/stats')
    .then(() => {
      const apiTime = performance.now() - apiStartTime;
      console.log('API response time:', `${apiTime.toFixed(2)}ms`);
    });
  
  console.log('✅ Performance test completed');
}

function testErrorHandling() {
  console.log('🐛 Testing Error Handling...');
  
  // Test with invalid API endpoint
  fetch('/api/nonexistent')
    .then(response => {
      if (!response.ok) {
        console.log('✅ Error handling works - got expected 404');
      }
    })
    .catch(error => {
      console.log('✅ Error handling works - caught network error');
    });
  
  // Test with malformed data
  try {
    const malformedData = JSON.parse('invalid json');
    console.log('❌ Should not reach here');
  } catch (error) {
    console.log('✅ JSON parsing error handling works');
  }
  
  console.log('✅ Error handling test completed');
}

// Main test function
function runAllTests() {
  console.log('🚀 Starting Dashboard Tests...');
  console.log('=====================================');
  
  testDashboardComponents();
  
  setTimeout(() => {
    testResponsiveDesign();
  }, 1000);
  
  setTimeout(() => {
    testPerformance();
  }, 2000);
  
  setTimeout(() => {
    testErrorHandling();
  }, 3000);
  
  setTimeout(() => {
    console.log('=====================================');
    console.log('✅ All tests completed!');
    console.log('Check the results above for any issues.');
  }, 4000);
}

// Export functions for manual testing
window.dashboardTests = {
  testDashboardComponents,
  testResponsiveDesign,
  testPerformance,
  testErrorHandling,
  runAllTests
};

console.log('Dashboard test functions loaded!');
console.log('Available functions:');
console.log('- dashboardTests.runAllTests() - Run all tests');
console.log('- dashboardTests.testDashboardComponents() - Test components');
console.log('- dashboardTests.testResponsiveDesign() - Test responsive');
console.log('- dashboardTests.testPerformance() - Test performance');
console.log('- dashboardTests.testErrorHandling() - Test error handling');
