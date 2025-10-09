// Test script để kiểm tra cả 2 luồng tạo lịch đăng bài
// Chạy trong browser console

function testScheduleWorkflows() {
  console.log('🔄 Testing Both Schedule Workflows...');
  
  console.log('');
  console.log('📋 WORKFLOW 1: Tích hợp vào Review Edit (Facebook Tab)');
  console.log('1. Vào /dashboard/reviews');
  console.log('2. Click vào một review để edit');
  console.log('3. Tab Facebook → Click "Lên lịch"');
  console.log('4. Chọn date/time → Click "Tạo lịch đăng bài"');
  console.log('5. Xem success toast và console log');
  
  console.log('');
  console.log('📋 WORKFLOW 2: Module Lịch Đăng Bài riêng biệt');
  console.log('1. Vào /dashboard/schedules');
  console.log('2. Click "Tạo Lịch Mới"');
  console.log('3. Chọn review chưa có schedule');
  console.log('4. Chọn date/time → Click "Tạo Lịch Đăng Bài"');
  console.log('5. Xem success toast và console log');
  
  console.log('');
  console.log('🎯 Expected Results:');
  console.log('- ✅ Both workflows should work with mock implementation');
  console.log('- ✅ Loading states should be visible');
  console.log('- ✅ Success toasts should appear');
  console.log('- ✅ Console logs should show mock schedule data');
  console.log('- ✅ Dialogs should close after success');
  
  console.log('');
  console.log('🔍 Check Points:');
  console.log('- Schedule menu item in dashboard sidebar');
  console.log('- "Lên lịch" button in FacebookPoster');
  console.log('- "Tạo Lịch Mới" button in schedules page');
  console.log('- Date/time input validation');
  console.log('- Loading states during submission');
  console.log('- Success feedback (toast + console)');
}

function testScheduleMenuIntegration() {
  console.log('📱 Testing Schedule Menu Integration...');
  
  // Check if we're on dashboard
  if (!window.location.pathname.includes('/dashboard')) {
    console.log('⚠️ Not on dashboard, navigating to dashboard...');
    window.location.href = '/dashboard';
    return;
  }
  
  // Look for schedule menu item
  const scheduleMenuItems = Array.from(document.querySelectorAll('a')).filter(link => 
    link.textContent.includes('Lịch Đăng Bài') || link.textContent.includes('Calendar')
  );
  
  if (scheduleMenuItems.length > 0) {
    console.log('✅ Schedule menu item found:', scheduleMenuItems.length);
    scheduleMenuItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.textContent.trim()} - ${item.href}`);
    });
    
    // Test clicking schedule menu
    const scheduleMenuItem = scheduleMenuItems[0];
    console.log('🖱️ Clicking schedule menu item...');
    scheduleMenuItem.click();
    
    setTimeout(() => {
      if (window.location.pathname.includes('/schedules')) {
        console.log('✅ Successfully navigated to schedules page');
        
        // Check for create button
        const createButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.includes('Tạo Lịch') || btn.textContent.includes('Tạo Mới')
        );
        
        if (createButtons.length > 0) {
          console.log('✅ Create schedule button found');
        } else {
          console.log('❌ Create schedule button not found');
        }
        
      } else {
        console.log('❌ Failed to navigate to schedules page');
      }
    }, 1000);
    
  } else {
    console.log('❌ Schedule menu item not found');
    console.log('Available menu items:');
    const menuItems = Array.from(document.querySelectorAll('a')).map(link => link.textContent.trim());
    console.log(menuItems);
  }
}

function testScheduleDialogUI() {
  console.log('🎨 Testing Schedule Dialog UI...');
  
  // Test Workflow 1: FacebookPoster ScheduleDialog
  console.log('Testing Workflow 1: FacebookPoster ScheduleDialog');
  
  // Navigate to a review edit page
  fetch('/api/reviews')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data.length > 0) {
        const reviewId = data.data[0].id;
        console.log('📝 Navigating to review edit page:', reviewId);
        window.location.href = `/dashboard/reviews/${reviewId}/edit`;
        
        setTimeout(() => {
          // Look for "Lên lịch" button
          const scheduleButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('Lên lịch')
          );
          
          if (scheduleButtons.length > 0) {
            console.log('✅ "Lên lịch" button found');
            scheduleButtons[0].click();
            
            setTimeout(() => {
              // Check if dialog opened
              const dialog = document.querySelector('[class*="fixed inset-0"]');
              if (dialog) {
                console.log('✅ ScheduleDialog opened');
                
                // Test form elements
                const dateInput = dialog.querySelector('input[type="date"]');
                const timeInput = dialog.querySelector('input[type="time"]');
                const submitButton = dialog.querySelector('button[type="submit"]');
                
                if (dateInput && timeInput && submitButton) {
                  console.log('✅ All form elements found');
                  console.log('Date input:', dateInput.value);
                  console.log('Time input:', timeInput.value);
                  console.log('Submit button disabled:', submitButton.disabled);
                } else {
                  console.log('❌ Some form elements missing');
                }
                
              } else {
                console.log('❌ ScheduleDialog did not open');
              }
            }, 500);
            
          } else {
            console.log('❌ "Lên lịch" button not found');
          }
        }, 2000);
        
      } else {
        console.log('❌ No reviews found to test with');
      }
    })
    .catch(error => {
      console.error('❌ Error fetching reviews:', error);
    });
}

function testMockScheduleCreation() {
  console.log('📅 Testing Mock Schedule Creation...');
  
  // Test mock data structure
  const mockSchedule = {
    id: 'schedule-' + Date.now(),
    reviewId: 'test-review-id',
    scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    targetType: 'page',
    targetId: 'make-com-handled',
    targetName: 'Make.com Auto',
    postMessage: 'Test message from mock',
    landingPageUrl: 'https://example.com/test',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  console.log('📊 Mock schedule data:', mockSchedule);
  
  // Validate mock data
  const requiredFields = ['id', 'reviewId', 'scheduledFor', 'targetType', 'status'];
  const missingFields = requiredFields.filter(field => !mockSchedule[field]);
  
  if (missingFields.length === 0) {
    console.log('✅ Mock schedule data structure is valid');
  } else {
    console.log('❌ Mock schedule missing fields:', missingFields);
  }
  
  // Test date formatting
  const scheduledDate = new Date(mockSchedule.scheduledFor);
  console.log('📅 Scheduled date:', scheduledDate.toLocaleString('vi-VN'));
  
  // Test Vietnamese formatting
  const vietnameseDate = scheduledDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  console.log('🇻🇳 Vietnamese format:', vietnameseDate);
}

function testScheduleWorkflowStatus() {
  console.log('📊 Schedule Workflow Status:');
  
  console.log('');
  console.log('✅ COMPLETED:');
  console.log('- Schedule menu item added to dashboard');
  console.log('- FacebookPoster has "Lên lịch" button');
  console.log('- ScheduleDialog with date/time inputs');
  console.log('- Mock schedule creation implementation');
  console.log('- Loading states and success feedback');
  console.log('- CreateScheduleDialog for dedicated module');
  console.log('- Toast notifications for success/error');
  
  console.log('');
  console.log('⏳ PENDING (Database Issues):');
  console.log('- Real database integration');
  console.log('- Schedules table creation');
  console.log('- API endpoint fixes');
  console.log('- Cron job integration');
  console.log('- Make.com webhook integration');
  
  console.log('');
  console.log('🎯 CURRENT STATUS:');
  console.log('- UI: Fully functional with mock data');
  console.log('- UX: Smooth workflow with loading states');
  console.log('- Feedback: Clear success/error messages');
  console.log('- Integration: Both workflows working');
  console.log('- Database: Mock implementation ready for real data');
}

// Export functions
window.scheduleWorkflowTests = {
  testScheduleWorkflows,
  testScheduleMenuIntegration,
  testScheduleDialogUI,
  testMockScheduleCreation,
  testScheduleWorkflowStatus,
};

console.log('Schedule Workflow test functions loaded!');
console.log('Available functions:');
console.log('- scheduleWorkflowTests.testScheduleWorkflows() - Show both workflows');
console.log('- scheduleWorkflowTests.testScheduleMenuIntegration() - Test menu integration');
console.log('- scheduleWorkflowTests.testScheduleDialogUI() - Test dialog UI');
console.log('- scheduleWorkflowTests.testMockScheduleCreation() - Test mock data');
console.log('- scheduleWorkflowTests.testScheduleWorkflowStatus() - Show status');
