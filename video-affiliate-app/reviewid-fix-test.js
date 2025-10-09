// Test script để verify ReviewId Fix
// Chạy trong browser console khi đang ở schedules page

function testReviewIdFix() {
  console.log('🔍 Testing ReviewId Fix...');
  
  // Check if we're on schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page, navigating...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  console.log('✅ On schedules page');
  
  // Clear console to see fresh logs
  console.clear();
  console.log('🧹 Console cleared, starting ReviewId fix test...');
  
  // Step 1: Check current schedules
  console.log('📊 Step 1: Checking current schedules...');
  fetch('/api/schedules-get')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(`✅ Found ${data.data.schedules.length} schedules`);
        
        // Check for different review_ids
        const reviewIds = [...new Set(data.data.schedules.map(s => s.review_id))];
        console.log('📋 Unique review_ids:', reviewIds);
        
        if (reviewIds.length > 1) {
          console.log('✅ Multiple review_ids found - Fix working!');
        } else {
          console.log('❌ Only one review_id found - Still has issue');
        }
        
        // Show details
        data.data.schedules.forEach((schedule, index) => {
          console.log(`📋 Schedule ${index + 1}:`, {
            id: schedule.id,
            review_id: schedule.review_id,
            post_message_preview: schedule.post_message.substring(0, 50) + '...',
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
    console.log('📅 Step 2: Testing schedule creation via UI...');
    
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
        // Select a different review if available
        const selectedIndex = reviewSelect.options.length > 2 ? 2 : 1;
        reviewSelect.value = reviewSelect.options[selectedIndex].value;
        reviewSelect.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Selected review:', reviewSelect.value);
        console.log('📝 Review title:', reviewSelect.options[selectedIndex].text);
      }
      
      if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.value = tomorrow.toISOString().split('T')[0];
        dateInput.dispatchEvent(new Event('change', { bubbles: true }));
        console.log('✅ Set date to:', dateInput.value);
      }
      
      if (timeInput) {
        timeInput.value = '23:30';
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
            
            // Step 4: Verify different review_id was saved
            setTimeout(() => {
              console.log('🗄️ Step 4: Verifying different review_id was saved...');
              
              fetch('/api/schedules-get')
                .then(response => response.json())
                .then(data => {
                  if (data.success && data.data.schedules.length > 0) {
                    const latestSchedule = data.data.schedules[0];
                    console.log('📋 Latest schedule:', {
                      id: latestSchedule.id,
                      review_id: latestSchedule.review_id,
                      post_message_preview: latestSchedule.post_message.substring(0, 100) + '...',
                      created_at: latestSchedule.created_at
                    });
                    
                    // Check if it's different from the hardcoded one
                    const hardcodedReviewId = '45e448df-d4ef-4d5d-9303-33109f9d6c30';
                    if (latestSchedule.review_id !== hardcodedReviewId) {
                      console.log('✅ SUCCESS: Different review_id saved!');
                      console.log('🎉 Fix is working - No more hardcoded review_id!');
                    } else {
                      console.log('❌ Still using hardcoded review_id');
                    }
                    
                    // Check all review_ids
                    const allReviewIds = [...new Set(data.data.schedules.map(s => s.review_id))];
                    console.log('📊 All unique review_ids:', allReviewIds);
                    
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

function clearTestDataAndTestReviewId() {
  console.log('🗑️ Clearing test data and testing ReviewId fix...');
  
  // First, get all schedules
  fetch('/api/schedules-get')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.schedules.length > 0) {
        console.log(`📊 Found ${data.data.schedules.length} schedules`);
        
        // Delete all schedules to start fresh
        data.data.schedules.forEach((schedule, index) => {
          setTimeout(() => {
            fetch(`/api/schedules/${schedule.id}`, {
              method: 'DELETE'
            })
            .then(response => response.json())
            .then(result => {
              if (result.success) {
                console.log(`✅ Deleted schedule ${schedule.id}`);
              } else {
                console.log(`❌ Failed to delete schedule ${schedule.id}:`, result.error);
              }
            });
          }, index * 200);
        });
        
        setTimeout(() => {
          console.log('✅ All schedules cleared');
          console.log('🔄 Starting ReviewId fix test...');
          testReviewIdFix();
        }, 2000);
        
      } else {
        console.log('📊 No schedules found');
        testReviewIdFix();
      }
    })
    .catch(error => {
      console.log('❌ Error clearing test data:', error);
    });
}

// Export functions
window.reviewIdTests = {
  testReviewIdFix,
  clearTestDataAndTestReviewId,
};

console.log('ReviewId Fix test functions loaded!');
console.log('Available functions:');
console.log('- reviewIdTests.testReviewIdFix() - Test ReviewId fix');
console.log('- reviewIdTests.clearTestDataAndTestReviewId() - Clear test data and test ReviewId fix');
