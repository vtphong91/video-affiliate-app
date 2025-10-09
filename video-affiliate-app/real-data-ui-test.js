// Test script để verify Real Data Integration hoạt động
// Chạy trong browser console khi đang ở schedules page

function testRealDataUI() {
  console.log('📊 Testing Real Data Integration via UI...');
  
  // Check if we're on schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page, navigating...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  console.log('✅ On schedules page');
  
  // Clear console to see fresh logs
  console.clear();
  console.log('🧹 Console cleared, starting real data UI test...');
  
  // Step 1: Check current schedules
  console.log('📊 Step 1: Checking current schedules...');
  fetch('/api/schedules-get')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(`✅ Found ${data.data.schedules.length} schedules`);
        
        // Check for real data vs test data
        data.data.schedules.forEach((schedule, index) => {
          const isRealData = !schedule.post_message.includes('Auto-generated from review') && 
                           !schedule.post_message.includes('Test message') &&
                           !schedule.landing_page_url.includes('example.com') &&
                           !schedule.landing_page_url.includes('test.com');
          
          console.log(`📋 Schedule ${index + 1}:`, {
            id: schedule.id,
            target_name: schedule.target_name,
            post_message_preview: schedule.post_message.substring(0, 50) + '...',
            landing_url: schedule.landing_page_url,
            isRealData: isRealData ? '✅ Real Data' : '❌ Test Data',
            created_at: schedule.created_at
          });
        });
      } else {
        console.log('❌ Error fetching schedules:', data.error);
      }
    })
    .catch(error => {
      console.log('❌ Error:', error);
    });
  
  // Step 2: Test creating a new schedule via UI
  setTimeout(() => {
    console.log('📅 Step 2: Testing schedule creation via UI with real data...');
    
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
        timeInput.value = '23:00';
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
            console.log('📊 Step 3: Checking results...');
            
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
            
            // Step 4: Verify real data was saved
            setTimeout(() => {
              console.log('🗄️ Step 4: Verifying real data in database...');
              
              fetch('/api/schedules-get')
                .then(response => response.json())
                .then(data => {
                  if (data.success && data.data.schedules.length > 0) {
                    const latestSchedule = data.data.schedules[0];
                    console.log('📋 Latest schedule:', {
                      id: latestSchedule.id,
                      target_name: latestSchedule.target_name,
                      post_message_preview: latestSchedule.post_message.substring(0, 100) + '...',
                      landing_url: latestSchedule.landing_page_url,
                      created_at: latestSchedule.created_at
                    });
                    
                    // Check if it's real data
                    const isRealData = !latestSchedule.post_message.includes('Auto-generated from review') && 
                                     !latestSchedule.post_message.includes('Test message') &&
                                     !latestSchedule.landing_page_url.includes('example.com') &&
                                     !latestSchedule.landing_page_url.includes('test.com');
                    
                    if (isRealData) {
                      console.log('✅ Real data saved successfully!');
                      console.log('📝 Post message contains real review content');
                      console.log('🔗 Landing URL is real review URL');
                      console.log('🎉 SUCCESS: No more test data!');
                    } else {
                      console.log('❌ Still using test/fallback data');
                    }
                    
                  } else {
                    console.log('❌ No schedules found');
                  }
                })
                .catch(error => {
                  console.log('❌ Error fetching schedules:', error);
                });
              
            }, 2000);
            
          }, 2000);
          
        } else {
          console.log('⚠️ Submit button not ready or disabled');
        }
      }, 1000);
      
    }, 500);
    
  }, 2000);
}

function clearTestDataAndTestReal() {
  console.log('🗑️ Clearing test data and testing real data...');
  
  // First, get all schedules
  fetch('/api/schedules-get')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.schedules.length > 0) {
        console.log(`📊 Found ${data.data.schedules.length} schedules`);
        
        // Delete test schedules
        data.data.schedules.forEach((schedule, index) => {
          const isTestData = schedule.post_message.includes('Auto-generated from review') || 
                           schedule.post_message.includes('Test message') ||
                           schedule.landing_page_url.includes('example.com') ||
                           schedule.landing_page_url.includes('test.com');
          
          if (isTestData) {
            setTimeout(() => {
              fetch(`/api/schedules/${schedule.id}`, {
                method: 'DELETE'
              })
              .then(response => response.json())
              .then(result => {
                if (result.success) {
                  console.log(`✅ Deleted test schedule ${schedule.id}`);
                } else {
                  console.log(`❌ Failed to delete test schedule ${schedule.id}:`, result.error);
                }
              });
            }, index * 200);
          } else {
            console.log(`📋 Keeping real schedule ${schedule.id}`);
          }
        });
        
        setTimeout(() => {
          console.log('✅ Test data cleared');
          console.log('🔄 Starting real data test...');
          testRealDataUI();
        }, 2000);
        
      } else {
        console.log('📊 No schedules found');
        testRealDataUI();
      }
    })
    .catch(error => {
      console.log('❌ Error clearing test data:', error);
    });
}

// Export functions
window.realDataUITests = {
  testRealDataUI,
  clearTestDataAndTestReal,
};

console.log('Real Data UI Integration test functions loaded!');
console.log('Available functions:');
console.log('- realDataUITests.testRealDataUI() - Test real data integration via UI');
console.log('- realDataUITests.clearTestDataAndTestReal() - Clear test data and test real data via UI');
