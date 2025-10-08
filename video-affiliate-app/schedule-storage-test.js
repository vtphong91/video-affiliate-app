// Test script để kiểm tra Schedule Storage và Module Lịch Đăng Bài
// Chạy trong browser console

function testScheduleStorage() {
  console.log('💾 Testing Schedule Storage...');
  
  // Test 1: Fetch existing schedules
  fetch('/api/schedules-mock-storage')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Schedules API working');
        console.log('📊 Current schedules:', data.data.schedules.length);
        console.log('Schedules data:', data.data.schedules);
      } else {
        console.error('❌ Schedules API failed:', data.error);
      }
    })
    .catch(error => {
      console.error('❌ Schedules API error:', error);
    });
}

function testScheduleCreation() {
  console.log('📅 Testing Schedule Creation...');
  
  const scheduleData = {
    reviewId: 'test-review-' + Date.now(),
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    targetType: 'page',
    targetId: 'make-com-handled',
    targetName: 'Make.com Auto',
    postMessage: 'Test message from browser',
    landingPageUrl: 'https://example.com/test',
  };
  
  console.log('📤 Creating schedule:', scheduleData);
  
  fetch('/api/schedules-mock-storage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scheduleData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Schedule created successfully');
      console.log('📅 Created schedule:', data.data);
      
      // Test fetching schedules again
      setTimeout(() => {
        testScheduleStorage();
      }, 1000);
      
    } else {
      console.error('❌ Schedule creation failed:', data.error);
    }
  })
  .catch(error => {
    console.error('❌ Schedule creation error:', error);
  });
}

function testScheduleModule() {
  console.log('📋 Testing Schedule Module...');
  
  // Navigate to schedules page
  if (window.location.pathname !== '/dashboard/schedules') {
    console.log('🔄 Navigating to schedules page...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  console.log('✅ On schedules page');
  
  // Wait for page to load
  setTimeout(() => {
    // Check for schedule elements
    const scheduleElements = [
      { selector: '[class*="card"]', name: 'Schedule Cards' },
      { selector: 'button:contains("Tạo Lịch")', name: 'Create Button' },
      { selector: '[class*="stats"]', name: 'Stats Cards' },
      { selector: '[class*="tabs"]', name: 'Status Tabs' }
    ];
    
    scheduleElements.forEach(element => {
      const el = document.querySelector(element.selector);
      if (el) {
        console.log(`✅ ${element.name} found`);
      } else {
        console.log(`❌ ${element.name} not found`);
      }
    });
    
    // Check for schedules list
    const scheduleCards = document.querySelectorAll('[class*="card"]');
    console.log(`📊 Found ${scheduleCards.length} schedule cards`);
    
    if (scheduleCards.length === 0) {
      console.log('⚠️ No schedules displayed');
      
      // Try to create a schedule
      const createButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('Tạo Lịch')
      );
      
      if (createButton) {
        console.log('🖱️ Clicking create button...');
        createButton.click();
        
        setTimeout(() => {
          const dialog = document.querySelector('[class*="fixed inset-0"]');
          if (dialog) {
            console.log('✅ Create schedule dialog opened');
          } else {
            console.log('❌ Create schedule dialog did not open');
          }
        }, 500);
      }
    }
    
  }, 2000);
}

function testScheduleWorkflow() {
  console.log('🔄 Testing Complete Schedule Workflow...');
  
  console.log('Step 1: Create schedule via API');
  testScheduleCreation();
  
  setTimeout(() => {
    console.log('Step 2: Check schedules module');
    testScheduleModule();
  }, 3000);
}

function testSchedulePersistence() {
  console.log('💾 Testing Schedule Persistence...');
  
  // Create multiple schedules
  const schedules = [
    {
      reviewId: 'review-1',
      scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      postMessage: 'Schedule 1'
    },
    {
      reviewId: 'review-2', 
      scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
      postMessage: 'Schedule 2'
    },
    {
      reviewId: 'review-3',
      scheduledFor: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours
      postMessage: 'Schedule 3'
    }
  ];
  
  let createdCount = 0;
  
  schedules.forEach((schedule, index) => {
    setTimeout(() => {
      fetch('/api/schedules-mock-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schedule)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          createdCount++;
          console.log(`✅ Schedule ${index + 1} created:`, data.data.id);
          
          if (createdCount === schedules.length) {
            console.log('🎉 All schedules created successfully');
            
            // Check final count
            setTimeout(() => {
              fetch('/api/schedules-mock-storage')
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    console.log(`📊 Total schedules in storage: ${data.data.schedules.length}`);
                    console.log('Schedules:', data.data.schedules.map(s => ({
                      id: s.id,
                      reviewId: s.review_id,
                      scheduledFor: s.scheduled_for,
                      status: s.status
                    })));
                  }
                });
            }, 1000);
          }
        } else {
          console.error(`❌ Schedule ${index + 1} failed:`, data.error);
        }
      })
      .catch(error => {
        console.error(`❌ Schedule ${index + 1} error:`, error);
      });
    }, index * 500);
  });
}

function clearScheduleStorage() {
  console.log('🗑️ Clearing Schedule Storage...');
  
  fetch('/api/schedules-mock-storage')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.schedules.length > 0) {
        console.log(`📊 Found ${data.data.schedules.length} schedules to delete`);
        
        data.data.schedules.forEach((schedule, index) => {
          setTimeout(() => {
            fetch(`/api/schedules-mock-storage`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: schedule.id })
            })
            .then(response => response.json())
            .then(result => {
              if (result.success) {
                console.log(`✅ Schedule ${schedule.id} deleted`);
              } else {
                console.error(`❌ Failed to delete schedule ${schedule.id}:`, result.error);
              }
            })
            .catch(error => {
              console.error(`❌ Error deleting schedule ${schedule.id}:`, error);
            });
          }, index * 200);
        });
        
      } else {
        console.log('📊 No schedules to delete');
      }
    })
    .catch(error => {
      console.error('❌ Error fetching schedules:', error);
    });
}

// Export functions
window.scheduleStorageTests = {
  testScheduleStorage,
  testScheduleCreation,
  testScheduleModule,
  testScheduleWorkflow,
  testSchedulePersistence,
  clearScheduleStorage,
};

console.log('Schedule Storage test functions loaded!');
console.log('Available functions:');
console.log('- scheduleStorageTests.testScheduleStorage() - Test storage API');
console.log('- scheduleStorageTests.testScheduleCreation() - Test creating schedule');
console.log('- scheduleStorageTests.testScheduleModule() - Test schedules module');
console.log('- scheduleStorageTests.testScheduleWorkflow() - Test complete workflow');
console.log('- scheduleStorageTests.testSchedulePersistence() - Test data persistence');
console.log('- scheduleStorageTests.clearScheduleStorage() - Clear all schedules');
