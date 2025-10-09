// Test script để verify Schedule Creation với Mock Storage
// Chạy trong browser console khi đang ở schedules page

function testScheduleCreationWithMock() {
  console.log('🧪 Testing Schedule Creation with Mock Storage...');
  
  // Check if we're on schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page, navigating...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  console.log('✅ On schedules page');
  
  // Clear console to see fresh logs
  console.clear();
  console.log('🧹 Console cleared, starting mock storage test...');
  
  // Step 1: Check current mock schedules
  console.log('📊 Step 1: Checking current mock schedules...');
  fetch('/api/schedules-mock-storage')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(`✅ Mock API: Found ${data.data.schedules.length} schedules`);
        console.log('📋 Current mock schedules:', data.data.schedules);
      } else {
        console.log('❌ Mock API error:', data.error);
      }
    })
    .catch(error => {
      console.log('❌ Mock API fetch error:', error);
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
        timeInput.value = '17:30';
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
            
            // Check if dialog closed
            const dialogAfterSubmit = document.querySelector('[class*="fixed inset-0"]');
            if (!dialogAfterSubmit) {
              console.log('✅ Dialog closed after submit');
            } else {
              console.log('⚠️ Dialog still open');
            }
            
            // Step 4: Verify schedule was saved to mock storage
            setTimeout(() => {
              console.log('🗄️ Step 4: Verifying schedule in mock storage...');
              
              fetch('/api/schedules-mock-storage')
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    console.log(`📊 Mock storage now has ${data.data.schedules.length} schedules`);
                    
                    if (data.data.schedules.length > 0) {
                      const latestSchedule = data.data.schedules[0];
                      console.log('✅ Latest schedule in mock storage:', {
                        id: latestSchedule.id,
                        reviewId: latestSchedule.review_id,
                        scheduledFor: latestSchedule.scheduled_for,
                        status: latestSchedule.status,
                        createdAt: latestSchedule.created_at
                      });
                      
                    } else {
                      console.log('❌ No schedules found in mock storage');
                    }
                    
                  } else {
                    console.log('❌ Failed to fetch schedules from mock storage:', data.error);
                  }
                })
                .catch(error => {
                  console.log('❌ Error fetching schedules from mock storage:', error);
                });
              
              // Step 5: Check UI display
              setTimeout(() => {
                console.log('🖥️ Step 5: Checking UI display...');
                
                const scheduleCards = document.querySelectorAll('[class*="card"]');
                console.log(`📊 UI shows ${scheduleCards.length} schedule cards`);
                
                if (scheduleCards.length > 0) {
                  console.log('✅ Schedules are displayed in the UI');
                  
                  // Check stats cards
                  const statsCards = document.querySelectorAll('[class*="bg-white"]');
                  console.log(`📊 Found ${statsCards.length} stats cards`);
                  
                  // Check for pending count
                  const pendingCard = Array.from(document.querySelectorAll('[class*="card"]')).find(card => 
                    card.textContent.includes('Chờ Đăng') || card.textContent.includes('Pending')
                  );
                  
                  if (pendingCard) {
                    console.log('✅ Pending card found:', pendingCard.textContent);
                  }
                  
                } else {
                  console.log('⚠️ No schedules displayed in the UI');
                }
                
                console.log('🎉 Mock Storage Test Complete!');
                console.log('📝 Note: Using mock storage due to database schema issues');
                console.log('🔧 Database schema needs to be fixed for real persistence');
                
              }, 1000);
              
            }, 2000);
            
          }, 2000);
          
        } else {
          console.log('⚠️ Submit button not ready or disabled');
          console.log('Submit button disabled:', submitButton?.disabled);
        }
      }, 1000);
      
    }, 500);
    
  }, 2000);
}

function clearMockSchedulesAndTest() {
  console.log('🗑️ Clearing mock schedules and testing fresh...');
  
  // First, get all mock schedules
  fetch('/api/schedules-mock-storage')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.schedules.length > 0) {
        console.log(`📊 Found ${data.data.schedules.length} mock schedules to clear`);
        
        // Delete each schedule
        data.data.schedules.forEach((schedule, index) => {
          setTimeout(() => {
            fetch(`/api/schedules-mock-storage/${schedule.id}`, {
              method: 'DELETE'
            })
            .then(response => response.json())
            .then(result => {
              if (result.success) {
                console.log(`✅ Deleted mock schedule ${schedule.id}`);
              } else {
                console.log(`❌ Failed to delete mock schedule ${schedule.id}:`, result.error);
              }
            });
          }, index * 200);
        });
        
        setTimeout(() => {
          console.log('✅ All mock schedules cleared');
          console.log('🔄 Starting fresh test...');
          testScheduleCreationWithMock();
        }, 2000);
        
      } else {
        console.log('📊 No mock schedules to clear');
        testScheduleCreationWithMock();
      }
    })
    .catch(error => {
      console.log('❌ Error clearing mock schedules:', error);
    });
}

function testDatabaseIssue() {
  console.log('🔍 Testing Database Issue...');
  
  // Test real database
  fetch('/api/test-db-basic')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Database connection works');
        console.log('📊 Database stats:', data.data);
      } else {
        console.log('❌ Database connection failed:', data.error);
      }
    })
    .catch(error => {
      console.log('❌ Database test error:', error);
    });
  
  // Test schedules insert
  setTimeout(() => {
    fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewId: '45e448df-d4ef-4d5d-9303-33109f9d6c30',
        scheduledFor: '2025-01-08T11:20:00.000Z',
        targetType: 'page'
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Real database insert works');
      } else {
        console.log('❌ Real database insert failed:', data.error);
        console.log('📝 This confirms database schema issue');
      }
    })
    .catch(error => {
      console.log('❌ Real database insert error:', error);
    });
  }, 1000);
}

// Export functions
window.mockScheduleTests = {
  testScheduleCreationWithMock,
  clearMockSchedulesAndTest,
  testDatabaseIssue,
};

console.log('Mock Schedule test functions loaded!');
console.log('Available functions:');
console.log('- mockScheduleTests.testScheduleCreationWithMock() - Test schedule creation with mock storage');
console.log('- mockScheduleTests.clearMockSchedulesAndTest() - Clear mock schedules and test fresh');
console.log('- mockScheduleTests.testDatabaseIssue() - Test database issue');
