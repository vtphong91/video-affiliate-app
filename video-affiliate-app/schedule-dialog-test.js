// Test script để kiểm tra ScheduleDialog trong FacebookPoster
// Chạy trong browser console khi đang ở trang edit review

function testScheduleDialog() {
  console.log('🧪 Testing Schedule Dialog in FacebookPoster...');
  
  // Check if we're on an edit review page
  if (!window.location.pathname.includes('/dashboard/reviews/') || !window.location.pathname.includes('/edit')) {
    console.log('⚠️ Not on edit review page, navigating to first review...');
    // Try to navigate to first review edit page
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
    // Check if FacebookPoster component is rendered
    const facebookPoster = document.querySelector('[class*="card"]');
    if (!facebookPoster) {
      console.log('❌ FacebookPoster component not found');
      return;
    }
    
    console.log('✅ FacebookPoster component found');
    
    // Check if "Lên lịch" button exists
    const scheduleButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('Lên lịch')
    );
    
    if (scheduleButton) {
      console.log('✅ "Lên lịch" button found');
      
      // Click the button
      scheduleButton.click();
      console.log('✅ Clicked "Lên lịch" button');
      
      // Wait for dialog to appear
      setTimeout(() => {
        const dialog = document.querySelector('[class*="fixed inset-0"]');
        if (dialog) {
          console.log('✅ ScheduleDialog opened successfully');
          
          // Check if Input components are rendered
          const dateInput = dialog.querySelector('input[type="date"]');
          const timeInput = dialog.querySelector('input[type="time"]');
          
          if (dateInput) {
            console.log('✅ Date input found');
            console.log('Date input value:', dateInput.value);
          } else {
            console.log('❌ Date input not found');
          }
          
          if (timeInput) {
            console.log('✅ Time input found');
            console.log('Time input value:', timeInput.value);
          } else {
            console.log('❌ Time input not found');
          }
          
          // Check if form elements are working
          if (dateInput && timeInput) {
            console.log('✅ All form elements rendered correctly');
            
            // Test form interaction
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            
            dateInput.value = tomorrowStr;
            dateInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Date input updated to:', tomorrowStr);
            
            timeInput.value = '14:30';
            timeInput.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('✅ Time input updated to: 14:30');
          }
          
          // Check submit button
          const submitButton = dialog.querySelector('button[type="submit"]');
          if (submitButton) {
            console.log('✅ Submit button found');
            console.log('Submit button text:', submitButton.textContent);
            console.log('Submit button disabled:', submitButton.disabled);
          }
          
          // Check close button
          const closeButton = dialog.querySelector('button[class*="ghost"]');
          if (closeButton) {
            console.log('✅ Close button found');
            closeButton.click();
            console.log('✅ Dialog closed');
          }
          
        } else {
          console.log('❌ ScheduleDialog did not open');
        }
      }, 500);
      
    } else {
      console.log('❌ "Lên lịch" button not found');
      
      // Check if there are any buttons at all
      const allButtons = document.querySelectorAll('button');
      console.log(`Found ${allButtons.length} buttons on page`);
      allButtons.forEach((btn, index) => {
        if (index < 5) { // Show first 5 buttons
          console.log(`Button ${index + 1}:`, btn.textContent?.trim());
        }
      });
    }
  }, 1000);
}

function testFacebookPosterComponents() {
  console.log('🔍 Checking FacebookPoster components...');
  
  // Check for all expected components
  const components = [
    { selector: '[class*="card"]', name: 'Card container' },
    { selector: 'textarea', name: 'Message textarea' },
    { selector: 'button', name: 'Action buttons' },
    { selector: 'input[readonly]', name: 'Landing URL input' },
  ];
  
  components.forEach(comp => {
    const element = document.querySelector(comp.selector);
    if (element) {
      console.log(`✅ ${comp.name} found`);
    } else {
      console.log(`❌ ${comp.name} not found`);
    }
  });
  
  // Check for specific text content
  const textChecks = [
    'Đăng Lên Facebook',
    'Gửi ngay',
    'Lên lịch',
    'Powered by Make.com'
  ];
  
  textChecks.forEach(text => {
    const element = Array.from(document.querySelectorAll('*')).find(el => 
      el.textContent?.includes(text)
    );
    if (element) {
      console.log(`✅ Text "${text}" found`);
    } else {
      console.log(`❌ Text "${text}" not found`);
    }
  });
}

function testScheduleAPI() {
  console.log('🌐 Testing Schedule API...');
  
  // First get a review ID
  fetch('/api/reviews')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.length > 0) {
        const reviewId = data.data[0].id;
        console.log('✅ Found review ID:', reviewId);
        
        // Test creating a schedule
        const scheduleData = {
          reviewId: reviewId,
          scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
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
            console.log('✅ Schedule created successfully');
            console.log('Schedule ID:', result.schedule.id);
            console.log('Scheduled for:', result.schedule.scheduled_for);
          } else {
            console.error('❌ Schedule creation failed:', result.error);
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

// Export functions
window.scheduleDialogTests = {
  testScheduleDialog,
  testFacebookPosterComponents,
  testScheduleAPI,
};

console.log('Schedule Dialog test functions loaded!');
console.log('Available functions:');
console.log('- scheduleDialogTests.testScheduleDialog() - Test schedule dialog functionality');
console.log('- scheduleDialogTests.testFacebookPosterComponents() - Check FacebookPoster components');
console.log('- scheduleDialogTests.testScheduleAPI() - Test schedule API');