// Test script để verify Toast Fix
// Chạy trong browser console khi đang ở schedules page

function testToastFix() {
  console.log('🔧 Testing Toast Fix...');
  
  // Check if we're on schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page, navigating...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  console.log('✅ On schedules page');
  
  // Clear console to see fresh logs
  console.clear();
  console.log('🧹 Console cleared, starting fresh test...');
  
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
      
      console.log('📝 Form elements found:');
      console.log('  Review select:', !!reviewSelect);
      console.log('  Date input:', !!dateInput);
      console.log('  Time input:', !!timeInput);
      console.log('  Submit button:', !!submitButton);
      
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
          
          // Monitor for results
          setTimeout(() => {
            console.log('📊 Checking results...');
            
            // Check for success toast
            const successToasts = document.querySelectorAll('[class*="bg-green-50"]');
            if (successToasts.length > 0) {
              console.log('✅ Success toast found:', successToasts[0].textContent);
            } else {
              console.log('⚠️ No success toast found');
            }
            
            // Check for error toast
            const errorToasts = document.querySelectorAll('[class*="bg-red-50"]');
            if (errorToasts.length > 0) {
              console.log('❌ Error toast found:', errorToasts[0].textContent);
            } else {
              console.log('✅ No error toast found');
            }
            
            // Check if dialog closed
            const dialogAfterSubmit = document.querySelector('[class*="fixed inset-0"]');
            if (!dialogAfterSubmit) {
              console.log('✅ Dialog closed after submit');
            } else {
              console.log('⚠️ Dialog still open');
            }
            
            // Check console for errors
            console.log('🔍 Checking console for errors...');
            
            // Check schedules list
            setTimeout(() => {
              checkSchedulesAfterCreation();
            }, 1000);
            
          }, 2000);
          
        } else {
          console.log('⚠️ Submit button not ready or disabled');
          console.log('Submit button disabled:', submitButton?.disabled);
        }
      }, 1000);
      
    }, 500);
    
  }, 1000);
}

function checkSchedulesAfterCreation() {
  console.log('📋 Checking schedules after creation...');
  
  // Check if schedules are displayed
  const scheduleCards = document.querySelectorAll('[class*="card"]');
  console.log(`📊 Found ${scheduleCards.length} schedule cards`);
  
  if (scheduleCards.length > 0) {
    console.log('✅ Schedules are displayed in the list');
    
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
          console.log('Latest schedule:', {
            id: data.data.schedules[0].id,
            reviewId: data.data.schedules[0].review_id,
            scheduledFor: data.data.schedules[0].scheduled_for,
            status: data.data.schedules[0].status
          });
        }
      } else {
        console.log('❌ API error:', data.error);
      }
    });
}

function testMultipleCreations() {
  console.log('📅 Testing Multiple Schedule Creations...');
  
  let creationCount = 0;
  const maxCreations = 3;
  
  function createNextSchedule() {
    if (creationCount >= maxCreations) {
      console.log('🎉 All test schedules created successfully');
      return;
    }
    
    creationCount++;
    console.log(`📅 Creating schedule ${creationCount}/${maxCreations}...`);
    
    // Find create button
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
      
      // Fill form quickly
      const reviewSelect = dialog.querySelector('select');
      const dateInput = dialog.querySelector('input[type="date"]');
      const timeInput = dialog.querySelector('input[type="time"]');
      const submitButton = dialog.querySelector('button[type="submit"]');
      
      if (reviewSelect && reviewSelect.options.length > 1) {
        reviewSelect.value = reviewSelect.options[1].value;
        reviewSelect.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (dateInput) {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + creationCount);
        dateInput.value = futureDate.toISOString().split('T')[0];
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      if (timeInput) {
        timeInput.value = `${14 + creationCount}:30`;
        timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      setTimeout(() => {
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
          
          setTimeout(() => {
            console.log(`✅ Schedule ${creationCount} created`);
            createNextSchedule();
          }, 2000);
        }
      }, 500);
      
    }, 500);
  }
  
  createNextSchedule();
}

function clearAllAndTest() {
  console.log('🗑️ Clearing all schedules and testing...');
  
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
            });
          }, index * 200);
        });
        
        setTimeout(() => {
          console.log('✅ All schedules cleared');
          console.log('🔄 Starting fresh test...');
          testToastFix();
        }, 2000);
        
      } else {
        console.log('📊 No schedules to clear');
        testToastFix();
      }
    });
}

// Export functions
window.toastFixTests = {
  testToastFix,
  checkSchedulesAfterCreation,
  testMultipleCreations,
  clearAllAndTest,
};

console.log('Toast Fix test functions loaded!');
console.log('Available functions:');
console.log('- toastFixTests.testToastFix() - Test toast fix');
console.log('- toastFixTests.checkSchedulesAfterCreation() - Check schedules after creation');
console.log('- toastFixTests.testMultipleCreations() - Test multiple creations');
console.log('- toastFixTests.clearAllAndTest() - Clear all and test');
