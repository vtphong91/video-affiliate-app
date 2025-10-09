// Test script để debug Schedule Creation Error
// Chạy trong browser console khi đang ở schedules page

function debugScheduleCreation() {
  console.log('🔍 Debugging Schedule Creation...');
  
  // Check if we're on schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page, navigating...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  console.log('✅ On schedules page');
  
  // Wait for page to load
  setTimeout(() => {
    // Find create button
    const createButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
      btn.textContent.includes('Tạo Lịch') || btn.textContent.includes('Tạo Mới')
    );
    
    if (createButtons.length === 0) {
      console.log('❌ Create button not found');
      return;
    }
    
    console.log('✅ Create button found:', createButtons.length);
    
    // Click create button
    const createButton = createButtons[0];
    console.log('🖱️ Clicking create button...');
    createButton.click();
    
    setTimeout(() => {
      // Check if dialog opened
      const dialog = document.querySelector('[class*="fixed inset-0"]');
      if (!dialog) {
        console.log('❌ Create dialog did not open');
        return;
      }
      
      console.log('✅ Create dialog opened');
      
      // Test form elements
      const reviewSelect = dialog.querySelector('select');
      const dateInput = dialog.querySelector('input[type="date"]');
      const timeInput = dialog.querySelector('input[type="time"]');
      const submitButton = dialog.querySelector('button[type="submit"]');
      
      console.log('📝 Form elements:');
      console.log('  Review select:', !!reviewSelect);
      console.log('  Date input:', !!dateInput);
      console.log('  Time input:', !!timeInput);
      console.log('  Submit button:', !!submitButton);
      
      if (reviewSelect) {
        console.log('  Review select value:', reviewSelect.value);
        console.log('  Review select options:', reviewSelect.options.length);
        
        // Select first review if available
        if (reviewSelect.options.length > 1) {
          reviewSelect.value = reviewSelect.options[1].value;
          reviewSelect.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('✅ Selected review:', reviewSelect.value);
        }
      }
      
      if (dateInput) {
        console.log('  Date input value:', dateInput.value);
        
        // Set tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        dateInput.value = tomorrowStr;
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Set date to:', tomorrowStr);
      }
      
      if (timeInput) {
        console.log('  Time input value:', timeInput.value);
        
        // Set time to 15:30
        timeInput.value = '15:30';
        timeInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Set time to: 15:30');
      }
      
      // Wait a bit for form to update
      setTimeout(() => {
        if (submitButton) {
          console.log('  Submit button disabled:', submitButton.disabled);
          
          if (!submitButton.disabled) {
            console.log('🖱️ Clicking submit button...');
            submitButton.click();
            
            // Monitor for errors
            setTimeout(() => {
              console.log('📊 Checking for errors...');
              
              // Check for error toasts
              const errorToasts = document.querySelectorAll('[class*="bg-red-50"]');
              if (errorToasts.length > 0) {
                console.log('❌ Error toast found:', errorToasts[0].textContent);
              } else {
                console.log('✅ No error toasts found');
              }
              
              // Check for success toasts
              const successToasts = document.querySelectorAll('[class*="bg-green-50"]');
              if (successToasts.length > 0) {
                console.log('✅ Success toast found:', successToasts[0].textContent);
              }
              
              // Check if dialog closed
              const dialogAfterSubmit = document.querySelector('[class*="fixed inset-0"]');
              if (!dialogAfterSubmit) {
                console.log('✅ Dialog closed after submit');
              } else {
                console.log('⚠️ Dialog still open');
              }
              
            }, 2000);
            
          } else {
            console.log('⚠️ Submit button is disabled');
          }
        }
      }, 1000);
      
    }, 500);
    
  }, 1000);
}

function testScheduleAPI() {
  console.log('🌐 Testing Schedule API...');
  
  // Test with valid data
  const testData = {
    reviewId: 'test-review-' + Date.now(),
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    targetType: 'page',
    targetId: 'make-com-handled',
    targetName: 'Make.com Auto',
    postMessage: 'Test message',
    landingPageUrl: 'https://example.com/test',
  };
  
  console.log('📤 Testing with data:', testData);
  
  fetch('/api/schedules-mock-storage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testData)
  })
  .then(response => {
    console.log('📥 Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📥 Response data:', data);
    
    if (data.success) {
      console.log('✅ API test successful');
      console.log('📅 Created schedule:', data.data);
    } else {
      console.log('❌ API test failed:', data.error);
      if (data.details) {
        console.log('📋 Error details:', data.details);
      }
    }
  })
  .catch(error => {
    console.error('❌ API test error:', error);
  });
}

function testFormData() {
  console.log('📝 Testing Form Data...');
  
  // Check if we're on schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page');
    return;
  }
  
  // Find create button and click it
  const createButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Tạo Lịch')
  );
  
  if (!createButton) {
    console.log('❌ Create button not found');
    return;
  }
  
  createButton.click();
  
  setTimeout(() => {
    const dialog = document.querySelector('[class*="fixed inset-0"]');
    if (!dialog) {
      console.log('❌ Dialog not found');
      return;
    }
    
    // Test form data
    const reviewSelect = dialog.querySelector('select');
    const dateInput = dialog.querySelector('input[type="date"]');
    const timeInput = dialog.querySelector('input[type="time"]');
    
    console.log('📊 Form data test:');
    
    if (reviewSelect) {
      console.log('  Review select:');
      console.log('    Value:', reviewSelect.value);
      console.log('    Options count:', reviewSelect.options.length);
      console.log('    First option:', reviewSelect.options[0]?.text);
      console.log('    Second option:', reviewSelect.options[1]?.text);
    }
    
    if (dateInput) {
      console.log('  Date input:');
      console.log('    Value:', dateInput.value);
      console.log('    Type:', dateInput.type);
      console.log('    Valid:', !isNaN(new Date(dateInput.value).getTime()));
    }
    
    if (timeInput) {
      console.log('  Time input:');
      console.log('    Value:', timeInput.value);
      console.log('    Type:', timeInput.type);
      console.log('    Valid:', /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeInput.value));
    }
    
    // Test creating a valid date
    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1);
    testDate.setHours(15, 30, 0, 0);
    
    console.log('📅 Test date object:');
    console.log('  Date:', testDate);
    console.log('  Valid:', !isNaN(testDate.getTime()));
    console.log('  ISO string:', testDate.toISOString());
    console.log('  Date part:', testDate.toISOString().split('T')[0]);
    console.log('  Time part:', testDate.toTimeString().slice(0, 5));
    
  }, 500);
}

function clearConsoleAndTest() {
  console.clear();
  console.log('🧹 Console cleared, starting fresh test...');
  
  setTimeout(() => {
    debugScheduleCreation();
  }, 1000);
}

// Export functions
window.scheduleDebugTests = {
  debugScheduleCreation,
  testScheduleAPI,
  testFormData,
  clearConsoleAndTest,
};

console.log('Schedule Debug test functions loaded!');
console.log('Available functions:');
console.log('- scheduleDebugTests.debugScheduleCreation() - Debug schedule creation flow');
console.log('- scheduleDebugTests.testScheduleAPI() - Test API directly');
console.log('- scheduleDebugTests.testFormData() - Test form data');
console.log('- scheduleDebugTests.clearConsoleAndTest() - Clear console and test');
