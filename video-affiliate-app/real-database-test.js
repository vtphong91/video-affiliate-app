// Test script để verify Real Database Integration
// Chạy trong browser console khi đang ở schedules page

function testRealDatabaseIntegration() {
  console.log('🗄️ Testing Real Database Integration...');
  
  // Check if we're on schedules page
  if (!window.location.pathname.includes('/dashboard/schedules')) {
    console.log('⚠️ Not on schedules page, navigating...');
    window.location.href = '/dashboard/schedules';
    return;
  }
  
  console.log('✅ On schedules page');
  
  // Clear console to see fresh logs
  console.clear();
  console.log('🧹 Console cleared, starting real database test...');
  
  // Step 1: Check current schedules from real API
  console.log('📊 Step 1: Checking current schedules from real database...');
  fetch('/api/schedules')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log(`✅ Real API: Found ${data.data.schedules.length} schedules`);
        console.log('📋 Current schedules:', data.data.schedules);
      } else {
        console.log('❌ Real API error:', data.error);
      }
    })
    .catch(error => {
      console.log('❌ Real API fetch error:', error);
    });
  
  // Step 2: Test creating a new schedule
  setTimeout(() => {
    console.log('📅 Step 2: Testing schedule creation with real database...');
    
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
        timeInput.value = '16:45';
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
            
            // Step 4: Verify schedule was saved to real database
            setTimeout(() => {
              console.log('🗄️ Step 4: Verifying schedule in real database...');
              
              fetch('/api/schedules')
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    console.log(`📊 Real database now has ${data.data.schedules.length} schedules`);
                    
                    if (data.data.schedules.length > 0) {
                      const latestSchedule = data.data.schedules[0];
                      console.log('✅ Latest schedule in real database:', {
                        id: latestSchedule.id,
                        reviewId: latestSchedule.review_id,
                        scheduledFor: latestSchedule.scheduled_for,
                        status: latestSchedule.status,
                        createdAt: latestSchedule.created_at
                      });
                      
                      // Check if it matches what we just created
                      const now = new Date();
                      const scheduleTime = new Date(latestSchedule.scheduled_for);
                      const timeDiff = Math.abs(scheduleTime.getTime() - now.getTime());
                      
                      if (timeDiff < 24 * 60 * 60 * 1000) { // Within 24 hours
                        console.log('✅ Schedule time matches recent creation');
                      } else {
                        console.log('⚠️ Schedule time seems old');
                      }
                      
                    } else {
                      console.log('❌ No schedules found in real database');
                    }
                    
                  } else {
                    console.log('❌ Failed to fetch schedules from real database:', data.error);
                  }
                })
                .catch(error => {
                  console.log('❌ Error fetching schedules from real database:', error);
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
                
                console.log('🎉 Real Database Integration Test Complete!');
                
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

function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  
  fetch('/api/test-db-simple')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Database connection successful');
        console.log('📊 Database stats:', data.stats);
        console.log('🔗 Connection info:', data.connection);
      } else {
        console.log('❌ Database connection failed:', data.error);
      }
    })
    .catch(error => {
      console.log('❌ Database test error:', error);
    });
}

function testMigrationStatus() {
  console.log('🔄 Checking Migration Status...');
  
  fetch('/api/migrate-schedules')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Migration status check successful');
        console.log('📊 Migration status:', data.status);
      } else {
        console.log('❌ Migration status check failed:', data.error);
      }
    })
    .catch(error => {
      console.log('❌ Migration status error:', error);
    });
}

function clearAllSchedulesAndTest() {
  console.log('🗑️ Clearing all schedules and testing fresh...');
  
  // First, get all schedules
  fetch('/api/schedules')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.schedules.length > 0) {
        console.log(`📊 Found ${data.data.schedules.length} schedules to clear`);
        
        // Delete each schedule
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
          console.log('🔄 Starting fresh test...');
          testRealDatabaseIntegration();
        }, 2000);
        
      } else {
        console.log('📊 No schedules to clear');
        testRealDatabaseIntegration();
      }
    })
    .catch(error => {
      console.log('❌ Error clearing schedules:', error);
    });
}

// Export functions
window.realDatabaseTests = {
  testRealDatabaseIntegration,
  testDatabaseConnection,
  testMigrationStatus,
  clearAllSchedulesAndTest,
};

console.log('Real Database Integration test functions loaded!');
console.log('Available functions:');
console.log('- realDatabaseTests.testRealDatabaseIntegration() - Test real database integration');
console.log('- realDatabaseTests.testDatabaseConnection() - Test database connection');
console.log('- realDatabaseTests.testMigrationStatus() - Check migration status');
console.log('- realDatabaseTests.clearAllSchedulesAndTest() - Clear all and test fresh');
