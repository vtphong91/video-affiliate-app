// Test script để kiểm tra Schedule UI đã hoạt động
// Chạy trong browser console khi đang ở trang dashboard/schedules

function testScheduleUI() {
  console.log('🧪 Testing Schedule UI...');
  
  // Check if we're on the schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page, navigating...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  // Check for UI elements
  const scheduleCards = document.querySelectorAll('[class*="Card"]');
  const createButton = document.querySelector('button');
  const tabs = document.querySelectorAll('[role="tab"]');
  const statsCards = document.querySelectorAll('[class*="Card"]');
  
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
    errorElements.forEach((el, index) => {
      console.log(`Error ${index + 1}:`, el.textContent);
    });
  } else {
    console.log('✅ No error elements found');
  }
  
  // Test create button
  const createBtn = document.querySelector('button[class*="Button"]');
  if (createBtn) {
    console.log('✅ Create button found');
    console.log('Button text:', createBtn.textContent);
  }
  
  // Test tabs
  if (tabs.length > 0) {
    console.log('✅ Tabs found - UI structure looks good');
    tabs.forEach((tab, index) => {
      console.log(`Tab ${index + 1}:`, tab.textContent);
    });
  }
  
  // Check for any console errors
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
  
  console.log('✅ Schedule UI test completed');
}

function testCreateScheduleDialog() {
  console.log('🧪 Testing Create Schedule Dialog...');
  
  // Find create button and click it
  const createBtn = document.querySelector('button');
  if (createBtn && createBtn.textContent.includes('Tạo')) {
    console.log('✅ Found create button, clicking...');
    createBtn.click();
    
    // Wait for dialog to appear
    setTimeout(() => {
      const dialog = document.querySelector('[class*="fixed"]');
      if (dialog) {
        console.log('✅ Create schedule dialog opened');
        
        // Check form elements
        const inputs = dialog.querySelectorAll('input, textarea, select');
        console.log(`Found ${inputs.length} form elements`);
        
        // Check close button
        const closeBtn = dialog.querySelector('button[class*="ghost"]');
        if (closeBtn) {
          console.log('✅ Close button found');
          closeBtn.click();
          console.log('✅ Dialog closed');
        }
      } else {
        console.log('❌ Dialog did not open');
      }
    }, 500);
  } else {
    console.log('❌ Create button not found');
  }
}

function testScheduleAPI() {
  console.log('🌐 Testing Schedule API...');
  
  fetch('/api/schedules')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Schedule API working');
        console.log(`📊 Found ${data.data.schedules.length} schedules`);
      } else {
        console.error('❌ Schedule API failed:', data.error);
      }
    })
    .catch(error => {
      console.error('❌ Schedule API error:', error);
    });
}

// Main test function
function runScheduleUITests() {
  console.log('🚀 Starting Schedule UI Tests...');
  console.log('=====================================');
  
  testScheduleUI();
  
  setTimeout(() => {
    testScheduleAPI();
  }, 1000);
  
  setTimeout(() => {
    testCreateScheduleDialog();
  }, 2000);
  
  setTimeout(() => {
    console.log('=====================================');
    console.log('✅ All Schedule UI tests completed!');
  }, 3000);
}

// Export functions for manual testing
window.scheduleUITests = {
  testScheduleUI,
  testCreateScheduleDialog,
  testScheduleAPI,
  runScheduleUITests,
};

console.log('Schedule UI test functions loaded!');
console.log('Available functions:');
console.log('- scheduleUITests.runScheduleUITests() - Run all UI tests');
console.log('- scheduleUITests.testScheduleUI() - Test UI elements');
console.log('- scheduleUITests.testCreateScheduleDialog() - Test dialog');
console.log('- scheduleUITests.testScheduleAPI() - Test API');
