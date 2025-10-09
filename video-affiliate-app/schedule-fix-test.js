// Test script để verify Schedule Creation Fix
// Chạy trong browser console khi đang ở schedules page

function testScheduleCreationFix() {
  console.log('🔧 Testing Schedule Creation Fix...');
  
  // Check if we're on schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page, navigating...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  console.log('✅ On schedules page');
  
  // Clear any existing schedules first
  console.log('🗑️ Clearing existing schedules...');
  fetch('/api/schedules-mock-storage')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.schedules.length > 0) {
        console.log(`📊 Found ${data.data.schedules.length} existing schedules`);
        // Clear them
        data.data.schedules.forEach(schedule => {
          fetch('/api/schedules-mock-storage', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: schedule.id })
          });
        });
        console.log('✅ Existing schedules cleared');
      } else {
        console.log('📊 No existing schedules to clear');
      }
      
      // Wait a bit then test creation
      setTimeout(() => {
        testScheduleCreation();
      }, 1000);
    });
}

function testScheduleCreation() {
  console.log('📅 Testing Schedule Creation...');
  
  // Find create button
  const createButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
    btn.textContent.includes('Tạo Lịch') || btn.textContent.includes('Tạo Mới')
  );
  
  if (createButtons.length === 0) {
    console.log('❌ Create button not found');
    return;
  }
  
  console.log('✅ Create button found');
  
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
    
    // Fill form
    const reviewSelect = dialog.querySelector('select');
    const dateInput = dialog.querySelector('input[type="date"]');
    const timeInput = dialog.querySelector('input[type="time"]');
    const submitButton = dialog.querySelector('button[type="submit"]');
    
    if (reviewSelect && reviewSelect.options.length > 1) {
      reviewSelect.value = reviewSelect.options[1].value;
      reviewSelect.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Selected review:', reviewSelect.value);
    }
    
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Set date to:', dateInput.value);
    }
    
    if (timeInput) {
      timeInput.value = '15:30';
      timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('✅ Set time to:', timeInput.value);
    }
    
    // Wait for form to update
    setTimeout(() => {
      if (submitButton && !submitButton.disabled) {
        console.log('🖱️ Clicking submit button...');
        submitButton.click();
        
        // Monitor results
        setTimeout(() => {
          console.log('📊 Checking results...');
          
          // Check for success toast
          const successToasts = document.querySelectorAll('[class*="bg-green-50"]');
          if (successToasts.length > 0) {
            console.log('✅ Success toast found:', successToasts[0].textContent);
          }
          
          // Check for error toast
          const errorToasts = document.querySelectorAll('[class*="bg-red-50"]');
          if (errorToasts.length > 0) {
            console.log('❌ Error toast found:', errorToasts[0].textContent);
          }
          
          // Check if dialog closed
          const dialogAfterSubmit = document.querySelector('[class*="fixed inset-0"]');
          if (!dialogAfterSubmit) {
            console.log('✅ Dialog closed after submit');
          } else {
            console.log('⚠️ Dialog still open');
          }
          
          // Check schedules list
          setTimeout(() => {
            checkSchedulesList();
          }, 1000);
          
        }, 2000);
        
      } else {
        console.log('⚠️ Submit button not ready or disabled');
      }
    }, 1000);
    
  }, 500);
}

function checkSchedulesList() {
  console.log('📋 Checking schedules list...');
  
  // Check if schedules are displayed
  const scheduleCards = document.querySelectorAll('[class*="card"]');
  console.log(`📊 Found ${scheduleCards.length} schedule cards`);
  
  if (scheduleCards.length > 0) {
    console.log('✅ Schedules are displayed in the list');
    
    // Check stats
    const statsCards = document.querySelectorAll('[class*="stats"]');
    console.log(`📊 Found ${statsCards.length} stats cards`);
    
    // Check for pending count
    const pendingCard = Array.from(document.querySelectorAll('[class*="card"]')).find(card => 
      card.textContent.includes('Chờ Đăng') || card.textContent.includes('Pending')
    );
    
    if (pendingCard) {
      console.log('✅ Pending card found:', pendingCard.textContent);
    }
    
  } else {
    console.log('⚠️ No schedules displayed in the list');
  }
  
  // Also check API
  fetch('/api/schedules-mock-storage')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(`📊 API shows ${data.data.schedules.length} schedules`);
        if (data.data.schedules.length > 0) {
          console.log('✅ Schedule persisted in API');
          console.log('Latest schedule:', data.data.schedules[0]);
        }
      } else {
        console.log('❌ API error:', data.error);
      }
    });
}

function testMultipleSchedules() {
  console.log('📅 Testing Multiple Schedule Creation...');
  
  const schedules = [
    { reviewId: 'test-review-1', scheduledFor: new Date(Date.now() + 60 * 60 * 1000).toISOString() },
    { reviewId: 'test-review-2', scheduledFor: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
    { reviewId: 'test-review-3', scheduledFor: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString() }
  ];
  
  let createdCount = 0;
  
  schedules.forEach((schedule, index) => {
    setTimeout(() => {
      fetch('/api/schedules-mock-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...schedule,
          targetType: 'page',
          targetId: 'make-com-handled',
          targetName: 'Make.com Auto',
          postMessage: `Test schedule ${index + 1}`,
          landingPageUrl: 'https://example.com/test',
        })
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          createdCount++;
          console.log(`✅ Schedule ${index + 1} created:`, data.data.id);
          
          if (createdCount === schedules.length) {
            console.log('🎉 All schedules created successfully');
            
            // Refresh page to see schedules
            setTimeout(() => {
              window.location.reload();
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

function clearAllSchedules() {
  console.log('🗑️ Clearing All Schedules...');
  
  fetch('/api/schedules-mock-storage')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.schedules.length > 0) {
        console.log(`📊 Found ${data.data.schedules.length} schedules to clear`);
        
        data.data.schedules.forEach((schedule, index) => {
          setTimeout(() => {
            fetch('/api/schedules-mock-storage', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: schedule.id })
            })
            .then(response => response.json())
            .then(result => {
              if (result.success) {
                console.log(`✅ Schedule ${schedule.id} deleted`);
              }
            });
          }, index * 200);
        });
        
        setTimeout(() => {
          console.log('🔄 Refreshing page...');
          window.location.reload();
        }, 2000);
        
      } else {
        console.log('📊 No schedules to clear');
      }
    });
}

// Export functions
window.scheduleFixTests = {
  testScheduleCreationFix,
  testScheduleCreation,
  checkSchedulesList,
  testMultipleSchedules,
  clearAllSchedules,
};

console.log('Schedule Fix test functions loaded!');
console.log('Available functions:');
console.log('- scheduleFixTests.testScheduleCreationFix() - Test complete fix');
console.log('- scheduleFixTests.testScheduleCreation() - Test single creation');
console.log('- scheduleFixTests.checkSchedulesList() - Check schedules display');
console.log('- scheduleFixTests.testMultipleSchedules() - Test multiple schedules');
console.log('- scheduleFixTests.clearAllSchedules() - Clear all schedules');
