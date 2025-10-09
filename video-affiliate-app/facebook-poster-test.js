// Test script để kiểm tra FacebookPoster component
// Chạy trong browser console khi đang ở trang edit review

function testFacebookPosterComponent() {
  console.log('🔧 Testing FacebookPoster Component...');
  
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
    console.log('✅ On edit review page:', window.location.pathname);
    
    // Test FacebookPoster component elements
    const facebookPosterTests = [
      {
        selector: '[class*="card"]',
        name: 'FacebookPoster Card',
        required: true
      },
      {
        selector: 'button[onclick*="handlePost"]',
        name: 'Post Button',
        required: true
      },
      {
        selector: 'button:contains("Lên lịch")',
        name: 'Schedule Button',
        required: true
      },
      {
        selector: 'textarea',
        name: 'Message Textarea',
        required: true
      },
      {
        selector: '[class*="bg-blue-50"]',
        name: 'Make.com Info Box',
        required: true
      }
    ];
    
    facebookPosterTests.forEach(test => {
      const element = document.querySelector(test.selector);
      if (element) {
        console.log(`✅ ${test.name} found`);
      } else {
        console.log(`❌ ${test.name} not found`);
      }
    });
    
    // Test post button functionality
    const postButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('Gửi ngay') || btn.textContent.includes('Đang gửi')
    );
    
    if (postButton) {
      console.log('✅ Post button found');
      console.log('Post button disabled:', postButton.disabled);
      console.log('Post button text:', postButton.textContent);
      
      // Test if button is properly disabled when no message
      const textarea = document.querySelector('textarea');
      if (textarea) {
        console.log('✅ Message textarea found');
        console.log('Textarea value length:', textarea.value.length);
        
        if (textarea.value.length === 0) {
          console.log('✅ Post button should be disabled (no message)');
        } else {
          console.log('✅ Post button should be enabled (has message)');
        }
      }
    } else {
      console.log('❌ Post button not found');
    }
    
    // Test schedule button functionality
    const scheduleButton = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes('Lên lịch')
    );
    
    if (scheduleButton) {
      console.log('✅ Schedule button found');
      console.log('Schedule button disabled:', scheduleButton.disabled);
      
      // Test clicking schedule button
      console.log('🖱️ Testing schedule button click...');
      scheduleButton.click();
      
      setTimeout(() => {
        const dialog = document.querySelector('[class*="fixed inset-0"]');
        if (dialog) {
          console.log('✅ ScheduleDialog opened successfully');
          
          // Test dialog elements
          const dialogTests = [
            { selector: 'input[type="date"]', name: 'Date Input' },
            { selector: 'input[type="time"]', name: 'Time Input' },
            { selector: 'button[type="submit"]', name: 'Submit Button' },
            { selector: 'button[class*="ghost"]', name: 'Close Button' }
          ];
          
          dialogTests.forEach(test => {
            const element = dialog.querySelector(test.selector);
            if (element) {
              console.log(`✅ ${test.name} found in dialog`);
            } else {
              console.log(`❌ ${test.name} not found in dialog`);
            }
          });
          
          // Close dialog
          const closeButton = dialog.querySelector('button[class*="ghost"]');
          if (closeButton) {
            closeButton.click();
            console.log('✅ Dialog closed');
          }
          
        } else {
          console.log('❌ ScheduleDialog did not open');
        }
      }, 500);
      
    } else {
      console.log('❌ Schedule button not found');
    }
    
  }, 1000);
}

function testFacebookPosterState() {
  console.log('🔍 Testing FacebookPoster State Management...');
  
  // Check if we're on an edit review page
  if (!window.location.pathname.includes('/dashboard/reviews/') || !window.location.pathname.includes('/edit')) {
    console.log('⚠️ Not on edit review page');
    return;
  }
  
  // Test state variables
  const stateTests = [
    {
      name: 'isPosting state',
      description: 'Should be defined and used in post button disabled prop'
    },
    {
      name: 'isScheduling state', 
      description: 'Should be defined and used in schedule button disabled prop'
    },
    {
      name: 'showScheduleDialog state',
      description: 'Should control ScheduleDialog visibility'
    },
    {
      name: 'postUrl state',
      description: 'Should store the posted URL after successful post'
    }
  ];
  
  stateTests.forEach(test => {
    console.log(`📊 ${test.name}: ${test.description}`);
  });
  
  // Test message generation
  const textarea = document.querySelector('textarea');
  if (textarea) {
    console.log('✅ Message textarea found');
    console.log('Message length:', textarea.value.length);
    
    if (textarea.value.length > 0) {
      console.log('✅ Message is generated');
      console.log('Message preview:', textarea.value.substring(0, 100) + '...');
    } else {
      console.log('⚠️ Message is empty');
    }
  }
  
  // Test affiliate links display
  const affiliateSection = document.querySelector('[class*="bg-green-50"]');
  if (affiliateSection) {
    console.log('✅ Affiliate links section found');
    console.log('Affiliate section text:', affiliateSection.textContent.substring(0, 100) + '...');
  } else {
    console.log('⚠️ Affiliate links section not found');
  }
}

function testFacebookPosterErrors() {
  console.log('🚨 Testing FacebookPoster Error Handling...');
  
  // Check console for errors
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Wait a bit to catch any errors
  setTimeout(() => {
    console.error = originalError;
    
    if (errors.length > 0) {
      console.log('❌ Errors found:');
      errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    } else {
      console.log('✅ No errors found');
    }
  }, 2000);
  
  // Test component rendering
  const facebookPosterCard = document.querySelector('[class*="card"]');
  if (facebookPosterCard) {
    console.log('✅ FacebookPoster card rendered successfully');
    
    // Check for any missing elements that might cause errors
    const requiredElements = [
      'button', // Post button
      'textarea', // Message textarea
      '[class*="bg-blue-50"]' // Make.com info
    ];
    
    requiredElements.forEach(selector => {
      const element = facebookPosterCard.querySelector(selector);
      if (element) {
        console.log(`✅ Required element found: ${selector}`);
      } else {
        console.log(`❌ Required element missing: ${selector}`);
      }
    });
    
  } else {
    console.log('❌ FacebookPoster card not found');
  }
}

function testFacebookPosterIntegration() {
  console.log('🔗 Testing FacebookPoster Integration...');
  
  // Check if we're on an edit review page
  if (!window.location.pathname.includes('/dashboard/reviews/') || !window.location.pathname.includes('/edit')) {
    console.log('⚠️ Not on edit review page');
    return;
  }
  
  // Test integration with review data
  console.log('📊 Testing review data integration:');
  
  // Check if review data is available
  const reviewElements = [
    { selector: '[class*="video-title"]', name: 'Video Title' },
    { selector: '[class*="channel-name"]', name: 'Channel Name' },
    { selector: '[class*="video-url"]', name: 'Video URL' },
    { selector: '[class*="affiliate"]', name: 'Affiliate Links' }
  ];
  
  reviewElements.forEach(element => {
    const el = document.querySelector(element.selector);
    if (el) {
      console.log(`✅ ${element.name} found`);
    } else {
      console.log(`⚠️ ${element.name} not found`);
    }
  });
  
  // Test message generation from review data
  const textarea = document.querySelector('textarea');
  if (textarea && textarea.value.length > 0) {
    console.log('✅ Message generated from review data');
    
    // Check if message contains expected elements
    const messageChecks = [
      { pattern: /🔥|📺|🎥/, name: 'Emojis' },
      { pattern: /https?:\/\//, name: 'URLs' },
      { pattern: /[A-Z][a-z]+/, name: 'Proper nouns' },
      { pattern: /[0-9]+/, name: 'Numbers' }
    ];
    
    messageChecks.forEach(check => {
      if (check.pattern.test(textarea.value)) {
        console.log(`✅ Message contains ${check.name}`);
      } else {
        console.log(`⚠️ Message missing ${check.name}`);
      }
    });
    
  } else {
    console.log('❌ Message not generated from review data');
  }
}

// Export functions
window.facebookPosterTests = {
  testFacebookPosterComponent,
  testFacebookPosterState,
  testFacebookPosterErrors,
  testFacebookPosterIntegration,
};

console.log('FacebookPoster test functions loaded!');
console.log('Available functions:');
console.log('- facebookPosterTests.testFacebookPosterComponent() - Test component elements');
console.log('- facebookPosterTests.testFacebookPosterState() - Test state management');
console.log('- facebookPosterTests.testFacebookPosterErrors() - Test error handling');
console.log('- facebookPosterTests.testFacebookPosterIntegration() - Test data integration');
