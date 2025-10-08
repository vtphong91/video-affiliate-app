// Test script để kiểm tra Schedule Creation (Mock Version)
// Chạy trong browser console khi đang ở trang edit review

function testScheduleCreationMock() {
  console.log('🧪 Testing Schedule Creation (Mock Version)...');
  
  // Check if we're on an edit review page
  if (!window.location.pathname.includes('/dashboard/reviews/') || !window.location.pathname.includes('/edit')) {
    console.log('⚠️ Not on edit review page, navigating to first review...');
    fetch('/api/reviews')
      .then(response => response.json())
      .then(data => {
        if (data.success && data.data.length > 0) {
          window.location.href = `/dashboard/reviews/${data.data[0].id}/edit`;
        } else {
          console.log('❌ No reviews found to test with');
        }
      });
    return;
  }
  
  // Wait for page to load
  setTimeout(() => {
    // Find and click "Lên lịch" button
    const scheduleButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('Lên lịch')
    );
    
    if (!scheduleButton) {
      console.log('❌ "Lên lịch" button not found');
      return;
    }
    
    console.log('✅ "Lên lịch" button found');
    scheduleButton.click();
    console.log('✅ Clicked "Lên lịch" button');
    
    // Wait for dialog to appear
    setTimeout(() => {
      const dialog = document.querySelector('[class*="fixed inset-0"]');
      if (!dialog) {
        console.log('❌ ScheduleDialog did not open');
        return;
      }
      
      console.log('✅ ScheduleDialog opened successfully');
      
      // Test form submission
      const submitButton = dialog.querySelector('button[type="submit"]');
      if (submitButton) {
        console.log('✅ Submit button found');
        console.log('Submit button disabled:', submitButton.disabled);
        
        if (!submitButton.disabled) {
          console.log('✅ Form is ready for submission');
          
          // Click submit button
          submitButton.click();
          console.log('✅ Clicked submit button');
          
          // Wait for response
          setTimeout(() => {
            // Check for success toast
            const successToast = document.querySelector('[class*="bg-green-50"]');
            if (successToast) {
              console.log('✅ Schedule created successfully!');
              console.log('Success message:', successToast.textContent);
            } else {
              // Check for error toast
              const errorToast = document.querySelector('[class*="bg-red-50"]');
              if (errorToast) {
                console.log('❌ Schedule creation failed');
                console.log('Error message:', errorToast.textContent);
              } else {
                console.log('⚠️ No toast message found');
              }
            }
            
            // Check if dialog closed
            const dialogAfterSubmit = document.querySelector('[class*="fixed inset-0"]');
            if (!dialogAfterSubmit) {
              console.log('✅ Dialog closed after submission');
            } else {
              console.log('⚠️ Dialog still open');
            }
            
            // Check console for mock schedule log
            console.log('📅 Check console for mock schedule creation log');
            
          }, 2000);
          
        } else {
          console.log('⚠️ Submit button is disabled');
        }
      }
      
    }, 500);
  }, 1000);
}

function testScheduleDialogUI() {
  console.log('🎨 Testing Schedule Dialog UI...');
  
  // Check if we're on an edit review page
  if (!window.location.pathname.includes('/dashboard/reviews/') || !window.location.pathname.includes('/edit')) {
    console.log('⚠️ Not on edit review page');
    return;
  }
  
  // Find and click "Lên lịch" button
  const scheduleButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('Lên lịch')
  );
  
  if (!scheduleButton) {
    console.log('❌ "Lên lịch" button not found');
    return;
  }
  
  scheduleButton.click();
  
  setTimeout(() => {
    const dialog = document.querySelector('[class*="fixed inset-0"]');
    if (!dialog) {
      console.log('❌ ScheduleDialog did not open');
      return;
    }
    
    console.log('✅ ScheduleDialog opened');
    
    // Test UI elements
    const elements = [
      { selector: '[class*="card-title"]', name: 'Dialog Title' },
      { selector: 'input[type="date"]', name: 'Date Input' },
      { selector: 'input[type="time"]', name: 'Time Input' },
      { selector: 'button[type="submit"]', name: 'Submit Button' },
      { selector: 'button[class*="ghost"]', name: 'Close Button' },
    ];
    
    elements.forEach(element => {
      const el = dialog.querySelector(element.selector);
      if (el) {
        console.log(`✅ ${element.name} found`);
      } else {
        console.log(`❌ ${element.name} not found`);
      }
    });
    
    // Test date/time inputs
    const dateInput = dialog.querySelector('input[type="date"]');
    const timeInput = dialog.querySelector('input[type="time"]');
    
    if (dateInput && timeInput) {
      console.log('✅ Date input value:', dateInput.value);
      console.log('✅ Time input value:', timeInput.value);
      
      // Test changing values
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      dateInput.value = tomorrowStr;
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Date updated to:', tomorrowStr);
      
      timeInput.value = '15:30';
      timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Time updated to: 15:30');
    }
    
    // Close dialog
    const closeButton = dialog.querySelector('button[class*="ghost"]');
    if (closeButton) {
      closeButton.click();
      console.log('✅ Dialog closed');
    }
    
  }, 500);
}

function testScheduleMockData() {
  console.log('📊 Testing Schedule Mock Data...');
  
  // Simulate the mock schedule creation
  const mockSchedule = {
    id: 'schedule-' + Date.now(),
    reviewId: 'test-review-id',
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    targetType: 'page',
    targetId: 'make-com-handled',
    targetName: 'Make.com Auto',
    postMessage: 'Test message from mock',
    landingPageUrl: 'https://example.com/test',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  console.log('📅 Mock schedule data:', mockSchedule);
  
  // Validate mock data structure
  const requiredFields = ['id', 'reviewId', 'scheduledFor', 'targetType', 'status'];
  const missingFields = requiredFields.filter(field => !mockSchedule[field]);
  
  if (missingFields.length === 0) {
    console.log('✅ Mock schedule data structure is valid');
  } else {
    console.log('❌ Mock schedule missing fields:', missingFields);
  }
  
  // Test date formatting
  const scheduledDate = new Date(mockSchedule.scheduledFor);
  console.log('📅 Scheduled date formatted:', scheduledDate.toLocaleString('vi-VN'));
  
  // Test Vietnamese date formatting
  const vietnameseDate = scheduledDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  console.log('🇻🇳 Vietnamese date format:', vietnameseDate);
}

function testScheduleWorkflow() {
  console.log('🔄 Testing Schedule Workflow...');
  
  console.log('1. User clicks "Lên lịch" button');
  console.log('2. ScheduleDialog opens with date/time inputs');
  console.log('3. User selects date and time');
  console.log('4. User clicks "Tạo lịch đăng bài"');
  console.log('5. Mock schedule is created in memory');
  console.log('6. Success toast notification appears');
  console.log('7. Dialog closes');
  console.log('8. Schedule is ready for Make.com processing');
  
  console.log('');
  console.log('📝 Current Implementation:');
  console.log('- ✅ UI: ScheduleDialog with date/time inputs');
  console.log('- ✅ Validation: Date/time input validation');
  console.log('- ✅ Mock Creation: In-memory schedule creation');
  console.log('- ✅ Success Feedback: Toast notification');
  console.log('- ⏳ Database: Pending (schedules table not created)');
  console.log('- ⏳ API: Pending (database connection issues)');
  console.log('- ⏳ Cron Job: Pending (database integration)');
  console.log('- ⏳ Make.com: Pending (webhook integration)');
}

// Export functions
window.scheduleMockTests = {
  testScheduleCreationMock,
  testScheduleDialogUI,
  testScheduleMockData,
  testScheduleWorkflow,
};

console.log('Schedule Mock test functions loaded!');
console.log('Available functions:');
console.log('- scheduleMockTests.testScheduleCreationMock() - Test mock schedule creation');
console.log('- scheduleMockTests.testScheduleDialogUI() - Test dialog UI');
console.log('- scheduleMockTests.testScheduleMockData() - Test mock data structure');
console.log('- scheduleMockTests.testScheduleWorkflow() - Show workflow status');
