// Test script để kiểm tra Schedule Creation
// Chạy trong browser console khi đang ở trang edit review

function testScheduleCreation() {
  console.log('🧪 Testing Schedule Creation...');
  
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
          }, 2000);
          
        } else {
          console.log('⚠️ Submit button is disabled');
        }
      }
      
    }, 500);
  }, 1000);
}

function testScheduleAPI() {
  console.log('🌐 Testing Schedule API...');
  
  // Get a review ID first
  fetch('/api/reviews')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.length > 0) {
        const reviewId = data.data[0].id;
        console.log('✅ Found review ID:', reviewId);
        
        // Test creating schedule
        const scheduleData = {
          reviewId: reviewId,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          targetType: 'page',
          targetId: '',
          targetName: '',
          postMessage: 'Test message from API',
          landingPageUrl: 'https://example.com/test',
        };
        
        console.log('📤 Sending schedule data:', scheduleData);
        
        fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scheduleData)
        })
        .then(response => response.json())
        .then(result => {
          console.log('📥 API Response:', result);
          
          if (result.success) {
            console.log('✅ Schedule created successfully via API');
            console.log('Schedule ID:', result.data.id);
            console.log('Scheduled for:', result.data.scheduled_for);
            console.log('Status:', result.data.status);
          } else {
            console.error('❌ Schedule creation failed via API');
            console.error('Error:', result.error);
            if (result.details) {
              console.error('Validation details:', result.details);
            }
          }
        })
        .catch(error => {
          console.error('❌ Schedule API error:', error);
        });
        
      } else {
        console.log('❌ No reviews found to test schedule creation');
      }
    })
    .catch(error => {
      console.error('❌ Error fetching reviews:', error);
    });
}

function testScheduleValidation() {
  console.log('🔍 Testing Schedule Validation...');
  
  const testCases = [
    {
      name: 'Valid Schedule',
      data: {
        reviewId: '123e4567-e89b-12d3-a456-426614174000', // Valid UUID format
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        targetType: 'page',
        targetId: '',
        targetName: '',
        postMessage: 'Test message',
        landingPageUrl: 'https://example.com/test',
      },
      shouldPass: true,
    },
    {
      name: 'Invalid UUID',
      data: {
        reviewId: 'invalid-uuid',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        targetType: 'page',
        targetId: '',
        targetName: '',
        postMessage: 'Test message',
        landingPageUrl: 'https://example.com/test',
      },
      shouldPass: false,
    },
    {
      name: 'Invalid Date',
      data: {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        scheduledFor: 'invalid-date',
        targetType: 'page',
        targetId: '',
        targetName: '',
        postMessage: 'Test message',
        landingPageUrl: 'https://example.com/test',
      },
      shouldPass: false,
    },
    {
      name: 'Invalid Target Type',
      data: {
        reviewId: '123e4567-e89b-12d3-a456-426614174000',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        targetType: 'invalid',
        targetId: '',
        targetName: '',
        postMessage: 'Test message',
        landingPageUrl: 'https://example.com/test',
      },
      shouldPass: false,
    },
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`Test case ${index + 1}: ${testCase.name}`);
    
    fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testCase.data)
    })
    .then(response => response.json())
    .then(result => {
      const passed = result.success === testCase.shouldPass;
      console.log(`${passed ? '✅' : '❌'} ${testCase.name}: ${passed ? 'PASSED' : 'FAILED'}`);
      
      if (!passed) {
        console.log('Expected:', testCase.shouldPass ? 'Success' : 'Error');
        console.log('Got:', result.success ? 'Success' : 'Error');
        if (result.error) {
          console.log('Error:', result.error);
        }
        if (result.details) {
          console.log('Details:', result.details);
        }
      }
    })
    .catch(error => {
      console.error(`❌ ${testCase.name} error:`, error);
    });
  });
}

function testScheduleList() {
  console.log('📋 Testing Schedule List...');
  
  fetch('/api/schedules')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✅ Schedules API working');
        console.log(`📊 Found ${data.data.schedules.length} schedules`);
        
        if (data.data.schedules.length > 0) {
          console.log('First schedule:', {
            id: data.data.schedules[0].id,
            reviewId: data.data.schedules[0].review_id,
            scheduledFor: data.data.schedules[0].scheduled_for,
            status: data.data.schedules[0].status,
            targetType: data.data.schedules[0].target_type
          });
        }
        
        console.log('Pagination:', data.data.pagination);
      } else {
        console.error('❌ Schedules API failed:', data.error);
      }
    })
    .catch(error => {
      console.error('❌ Schedules API error:', error);
    });
}

// Export functions
window.scheduleCreationTests = {
  testScheduleCreation,
  testScheduleAPI,
  testScheduleValidation,
  testScheduleList,
};

console.log('Schedule Creation test functions loaded!');
console.log('Available functions:');
console.log('- scheduleCreationTests.testScheduleCreation() - Test schedule creation UI');
console.log('- scheduleCreationTests.testScheduleAPI() - Test schedule API');
console.log('- scheduleCreationTests.testScheduleValidation() - Test validation');
console.log('- scheduleCreationTests.testScheduleList() - Test schedule list');
