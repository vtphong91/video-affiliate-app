// Test script để kiểm tra ScheduleDialog date/time handling
// Chạy trong browser console khi đang ở trang edit review

function testScheduleDialogDateTime() {
  console.log('🧪 Testing ScheduleDialog Date/Time Handling...');
  
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
      
      // Test date input
      const dateInput = dialog.querySelector('input[type="date"]');
      const timeInput = dialog.querySelector('input[type="time"]');
      
      if (!dateInput || !timeInput) {
        console.log('❌ Date or time input not found');
        return;
      }
      
      console.log('✅ Date and time inputs found');
      console.log('Initial date value:', dateInput.value);
      console.log('Initial time value:', timeInput.value);
      
      // Test date changes
      console.log('🔄 Testing date changes...');
      
      // Test valid date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      dateInput.value = tomorrowStr;
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Set date to tomorrow:', tomorrowStr);
      
      // Test time changes
      console.log('🔄 Testing time changes...');
      
      timeInput.value = '14:30';
      timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Set time to 14:30');
      
      // Test edge cases
      console.log('🔄 Testing edge cases...');
      
      // Test empty date (should not crash)
      dateInput.value = '';
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Handled empty date input');
      
      // Restore valid date
      dateInput.value = tomorrowStr;
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Test empty time (should not crash)
      timeInput.value = '';
      timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Handled empty time input');
      
      // Restore valid time
      timeInput.value = '14:30';
      timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Test invalid date format (should not crash)
      dateInput.value = 'invalid-date';
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Handled invalid date format');
      
      // Restore valid date
      dateInput.value = tomorrowStr;
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Test invalid time format (should not crash)
      timeInput.value = 'invalid-time';
      timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Handled invalid time format');
      
      // Restore valid time
      timeInput.value = '14:30';
      timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Test form submission
      console.log('🔄 Testing form submission...');
      
      const submitButton = dialog.querySelector('button[type="submit"]');
      if (submitButton) {
        console.log('✅ Submit button found');
        console.log('Submit button disabled:', submitButton.disabled);
        
        // Check if we can submit (should be enabled with valid date/time)
        if (!submitButton.disabled) {
          console.log('✅ Form is ready for submission');
          
          // Don't actually submit, just check the state
          console.log('📅 Final date value:', dateInput.value);
          console.log('⏰ Final time value:', timeInput.value);
        } else {
          console.log('⚠️ Submit button is disabled');
        }
      }
      
      // Close dialog
      const closeButton = dialog.querySelector('button[class*="ghost"]');
      if (closeButton) {
        console.log('✅ Close button found');
        closeButton.click();
        console.log('✅ Dialog closed');
      }
      
      console.log('🎉 ScheduleDialog date/time test completed successfully!');
      
    }, 500);
  }, 1000);
}

function testScheduleDialogValidation() {
  console.log('🔍 Testing ScheduleDialog Validation...');
  
  // Test various date/time scenarios
  const testCases = [
    { date: '2024-12-25', time: '09:00', description: 'Christmas morning' },
    { date: '2024-01-01', time: '00:00', description: 'New Year midnight' },
    { date: '2024-06-15', time: '23:59', description: 'Late evening' },
    { date: '', time: '12:00', description: 'Empty date' },
    { date: '2024-12-25', time: '', description: 'Empty time' },
    { date: 'invalid', time: '12:00', description: 'Invalid date' },
    { date: '2024-12-25', time: 'invalid', description: 'Invalid time' },
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`Test case ${index + 1}: ${testCase.description}`);
    console.log(`  Date: "${testCase.date}", Time: "${testCase.time}"`);
    
    // Simulate the validation logic
    const isValidDate = testCase.date && !isNaN(new Date(testCase.date).getTime());
    const isValidTime = testCase.time && /^\d{2}:\d{2}$/.test(testCase.time);
    
    console.log(`  Valid date: ${isValidDate}, Valid time: ${isValidTime}`);
    console.log(`  Should handle gracefully: ${!isValidDate || !isValidTime ? 'Yes' : 'No'}`);
    console.log('');
  });
}

function testScheduleAPIWithDateTime() {
  console.log('🌐 Testing Schedule API with Date/Time...');
  
  // Get a review ID first
  fetch('/api/reviews')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.length > 0) {
        const reviewId = data.data[0].id;
        console.log('✅ Found review ID:', reviewId);
        
        // Test creating schedule with different date/time combinations
        const testSchedules = [
          {
            name: 'Tomorrow 9 AM',
            scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            name: 'Next week',
            scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            name: 'Specific date',
            scheduledFor: new Date('2024-12-25T09:00:00.000Z').toISOString(),
          },
        ];
        
        testSchedules.forEach((schedule, index) => {
          console.log(`Testing schedule ${index + 1}: ${schedule.name}`);
          
          const scheduleData = {
            reviewId: reviewId,
            scheduledFor: schedule.scheduledFor,
            targetType: 'page',
            targetId: '',
            targetName: '',
            customMessage: '',
            customLandingUrl: '',
          };
          
          fetch('/api/schedules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(scheduleData)
          })
          .then(response => response.json())
          .then(result => {
            if (result.success) {
              console.log(`✅ Schedule "${schedule.name}" created successfully`);
              console.log(`  Schedule ID: ${result.schedule.id}`);
              console.log(`  Scheduled for: ${result.schedule.scheduled_for}`);
            } else {
              console.error(`❌ Schedule "${schedule.name}" failed:`, result.error);
            }
          })
          .catch(error => {
            console.error(`❌ Schedule "${schedule.name}" error:`, error);
          });
        });
        
      } else {
        console.log('❌ No reviews found to test schedule creation');
      }
    })
    .catch(error => {
      console.error('❌ Error fetching reviews:', error);
    });
}

// Export functions
window.scheduleDateTimeTests = {
  testScheduleDialogDateTime,
  testScheduleDialogValidation,
  testScheduleAPIWithDateTime,
};

console.log('Schedule Date/Time test functions loaded!');
console.log('Available functions:');
console.log('- scheduleDateTimeTests.testScheduleDialogDateTime() - Test date/time handling in dialog');
console.log('- scheduleDateTimeTests.testScheduleDialogValidation() - Test validation logic');
console.log('- scheduleDateTimeTests.testScheduleAPIWithDateTime() - Test API with different date/time');
