// Test script cho Schedule Module
// Chạy trong browser console khi đang ở trang dashboard/schedules

function testScheduleModule() {
  console.log('🧪 Testing Schedule Module...');
  console.log('=====================================');
  
  // Test 1: API endpoints
  testScheduleAPIs();
  
  // Test 2: UI components
  setTimeout(() => testScheduleUI(), 1000);
  
  // Test 3: Cron job (manual trigger)
  setTimeout(() => testCronJob(), 2000);
  
  // Test 4: Callback handler
  setTimeout(() => testCallbackHandler(), 3000);
  
  setTimeout(() => {
    console.log('=====================================');
    console.log('✅ Schedule Module tests completed!');
  }, 4000);
}

async function testScheduleAPIs() {
  console.log('🌐 Testing Schedule APIs...');
  
  try {
    // Test GET /api/schedules
    const schedulesResponse = await fetch('/api/schedules');
    const schedulesData = await schedulesResponse.json();
    
    if (schedulesResponse.ok && schedulesData.success) {
      console.log('✅ GET /api/schedules - OK');
      console.log(`📊 Found ${schedulesData.data.schedules.length} schedules`);
    } else {
      console.error('❌ GET /api/schedules - Failed:', schedulesData.error);
    }
    
    // Test POST /api/schedules (create)
    const testSchedule = {
      reviewId: '45e448df-d4ef-4d5d-9303-33109f9d6c30', // Use existing review
      scheduledFor: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      targetType: 'page',
      targetId: 'test-page-123',
      targetName: 'Test Page',
      postMessage: '🧪 Test scheduled post from browser console',
      landingPageUrl: 'https://example.com/test',
    };
    
    const createResponse = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testSchedule),
    });
    
    const createData = await createResponse.json();
    
    if (createResponse.ok && createData.success) {
      console.log('✅ POST /api/schedules - OK');
      console.log('📝 Created schedule:', createData.data.id);
      
      // Test GET /api/schedules/[id]
      const getResponse = await fetch(`/api/schedules/${createData.data.id}`);
      const getData = await getResponse.json();
      
      if (getResponse.ok && getData.success) {
        console.log('✅ GET /api/schedules/[id] - OK');
      } else {
        console.error('❌ GET /api/schedules/[id] - Failed:', getData.error);
      }
      
      // Test PUT /api/schedules/[id]
      const updateResponse = await fetch(`/api/schedules/${createData.data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postMessage: '🧪 Updated test scheduled post',
          targetName: 'Updated Test Page',
        }),
      });
      
      const updateData = await updateResponse.json();
      
      if (updateResponse.ok && updateData.success) {
        console.log('✅ PUT /api/schedules/[id] - OK');
      } else {
        console.error('❌ PUT /api/schedules/[id] - Failed:', updateData.error);
      }
      
      // Test DELETE /api/schedules/[id]
      const deleteResponse = await fetch(`/api/schedules/${createData.data.id}`, {
        method: 'DELETE',
      });
      
      const deleteData = await deleteResponse.json();
      
      if (deleteResponse.ok && deleteData.success) {
        console.log('✅ DELETE /api/schedules/[id] - OK');
      } else {
        console.error('❌ DELETE /api/schedules/[id] - Failed:', deleteData.error);
      }
      
    } else {
      console.error('❌ POST /api/schedules - Failed:', createData.error);
    }
    
  } catch (error) {
    console.error('❌ Schedule API test error:', error);
  }
}

function testScheduleUI() {
  console.log('🎨 Testing Schedule UI...');
  
  // Check if we're on the schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page, navigating...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  // Check for UI elements
  const scheduleCards = document.querySelectorAll('[class*="ScheduleCard"]');
  const createButton = document.querySelector('button[class*="Button"]');
  const tabs = document.querySelectorAll('[role="tab"]');
  const statsCards = document.querySelectorAll('[class*="StatsCard"]');
  
  console.log('UI Elements found:', {
    scheduleCards: scheduleCards.length,
    createButton: createButton ? 'Yes' : 'No',
    tabs: tabs.length,
    statsCards: statsCards.length,
  });
  
  // Check for error messages
  const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
  if (errorElements.length > 0) {
    console.warn('⚠️ Error elements found:', errorElements.length);
  } else {
    console.log('✅ No error elements found');
  }
  
  // Test tab switching
  if (tabs.length > 0) {
    console.log('✅ Tabs found - UI structure looks good');
  }
  
  console.log('✅ Schedule UI test completed');
}

async function testCronJob() {
  console.log('⏰ Testing Cron Job...');
  
  try {
    // Test cron job endpoint (without secret for testing)
    const cronResponse = await fetch('/api/cron/check-schedules');
    const cronData = await cronResponse.json();
    
    if (cronResponse.status === 401) {
      console.log('✅ Cron job security - OK (401 Unauthorized as expected)');
    } else if (cronResponse.ok && cronData.success) {
      console.log('✅ Cron job - OK');
      console.log(`📊 Processed ${cronData.processed} schedules`);
    } else {
      console.error('❌ Cron job - Failed:', cronData.error);
    }
    
  } catch (error) {
    console.error('❌ Cron job test error:', error);
  }
}

async function testCallbackHandler() {
  console.log('📞 Testing Callback Handler...');
  
  try {
    // Test callback endpoint
    const callbackResponse = await fetch('/api/makecom/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scheduleId: 'test-schedule-id',
        status: 'success',
        facebookPostId: 'test-post-123',
        facebookPostUrl: 'https://facebook.com/posts/test-post-123',
      }),
    });
    
    const callbackData = await callbackResponse.json();
    
    if (callbackResponse.status === 404) {
      console.log('✅ Callback handler - OK (404 as expected for non-existent schedule)');
    } else if (callbackResponse.ok && callbackData.success) {
      console.log('✅ Callback handler - OK');
    } else {
      console.error('❌ Callback handler - Failed:', callbackData.error);
    }
    
    // Test health check
    const healthResponse = await fetch('/api/makecom/callback');
    const healthData = await healthResponse.json();
    
    if (healthResponse.ok && healthData.success) {
      console.log('✅ Callback health check - OK');
    } else {
      console.error('❌ Callback health check - Failed:', healthData.error);
    }
    
  } catch (error) {
    console.error('❌ Callback test error:', error);
  }
}

// Manual test functions
function createTestSchedule() {
  console.log('🧪 Creating test schedule...');
  
  const testSchedule = {
    reviewId: '45e448df-d4ef-4d5d-9303-33109f9d6c30',
    scheduledFor: new Date(Date.now() + 300000).toISOString(), // 5 minutes from now
    targetType: 'page',
    targetId: 'test-page-123',
    targetName: 'Test Page',
    postMessage: '🧪 Test scheduled post - will be triggered in 5 minutes',
    landingPageUrl: 'https://example.com/test',
  };
  
  fetch('/api/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testSchedule),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Test schedule created:', data.data.id);
      console.log('⏰ Will be triggered in 5 minutes by cron job');
    } else {
      console.error('❌ Failed to create test schedule:', data.error);
    }
  })
  .catch(error => {
    console.error('❌ Error creating test schedule:', error);
  });
}

function triggerCronJobManually() {
  console.log('⏰ Manually triggering cron job...');
  
  // This will fail without proper secret, but we can see the structure
  fetch('/api/cron/check-schedules', {
    headers: {
      'x-cron-secret': 'test-secret', // This won't work without proper env var
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log('Cron job response:', data);
  })
  .catch(error => {
    console.error('Cron job error:', error);
  });
}

// Export functions for manual testing
window.scheduleTests = {
  testScheduleModule,
  testScheduleAPIs,
  testScheduleUI,
  testCronJob,
  testCallbackHandler,
  createTestSchedule,
  triggerCronJobManually,
};

console.log('Schedule test functions loaded!');
console.log('Available functions:');
console.log('- scheduleTests.testScheduleModule() - Run all tests');
console.log('- scheduleTests.createTestSchedule() - Create test schedule');
console.log('- scheduleTests.triggerCronJobManually() - Test cron job');
console.log('- scheduleTests.testScheduleAPIs() - Test API endpoints');
console.log('- scheduleTests.testScheduleUI() - Test UI components');
