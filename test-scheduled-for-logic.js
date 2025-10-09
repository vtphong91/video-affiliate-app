// Test scheduled_for logic
const http = require('http');

function testScheduledForLogic() {
  console.log('🔍 Testing scheduled_for logic...');
  
  // Get current time in GMT+7
  const now = new Date();
  const nowGMT7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
  const nowGMT7Direct = nowGMT7.toISOString().replace('Z', '');
  
  console.log('\n=== TIME CALCULATIONS ===');
  console.log(`Current UTC: ${now.toISOString()}`);
  console.log(`Current GMT+7: ${nowGMT7.toISOString()}`);
  console.log(`GMT+7 Direct: ${nowGMT7Direct}`);
  console.log(`GMT+7 Formatted: ${nowGMT7.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
  
  // Get schedules from database
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/schedules',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`\nSchedules API Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.success) {
          console.log('\n=== SCHEDULES ANALYSIS ===');
          console.log(`Total schedules: ${json.data.pagination.total}`);
          
          if (json.data.schedules.length > 0) {
            json.data.schedules.forEach((schedule, index) => {
              console.log(`\n--- Schedule ${index + 1} ---`);
              console.log(`ID: ${schedule.id}`);
              console.log(`Status: ${schedule.status}`);
              console.log(`Scheduled For (DB): ${schedule.scheduled_for}`);
              
              // Parse scheduled time
              const scheduledTime = new Date(schedule.scheduled_for);
              console.log(`Scheduled Time (Parsed): ${scheduledTime.toISOString()}`);
              console.log(`Scheduled Time (GMT+7): ${scheduledTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
              
              // Compare with current time
              const isOverdue = scheduledTime.getTime() < nowGMT7.getTime();
              console.log(`Is Overdue: ${isOverdue}`);
              
              if (isOverdue) {
                const overdueMs = nowGMT7.getTime() - scheduledTime.getTime();
                const overdueMinutes = Math.floor(overdueMs / (1000 * 60));
                const overdueHours = Math.floor(overdueMinutes / 60);
                console.log(`Overdue by: ${overdueMinutes} minutes (${overdueHours} hours)`);
                
                if (schedule.status === 'pending') {
                  console.log(`🚨 SHOULD BE PROCESSED: Overdue and still pending`);
                } else {
                  console.log(`✅ ALREADY PROCESSED: Status is ${schedule.status}`);
                }
              } else {
                const dueInMs = scheduledTime.getTime() - nowGMT7.getTime();
                const dueInMinutes = Math.floor(dueInMs / (1000 * 60));
                console.log(`Due in: ${dueInMinutes} minutes`);
              }
            });
          } else {
            console.log('No schedules found');
          }
          
          // Test cron job logic
          setTimeout(() => {
            testCronLogic();
          }, 1000);
          
        } else {
          console.log('❌ Failed to get schedules:', json.error);
        }
      } catch (e) {
        console.log('❌ JSON Parse Error:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Request error: ${e.message}`);
  });

  req.end();
}

function testCronLogic() {
  console.log('\n🔍 Testing cron job logic...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cron/debug-schedules',
    method: 'GET',
    headers: {
      'x-cron-secret': '4c32057816828f973d578326de17767caac3e8befa4167f4bbbf01b1a46bad46',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Cron Debug Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.success) {
          console.log('\n=== CRON JOB LOGIC ===');
          console.log(`Current time (GMT+7): ${json.data.currentTime.gmt7Formatted}`);
          console.log(`Pending schedules: ${json.data.pendingSchedules.count}`);
          
          if (json.data.pendingSchedules.count > 0) {
            console.log('\n--- Pending Schedules (Cron View) ---');
            json.data.pendingSchedules.schedules.forEach((schedule, index) => {
              console.log(`\nSchedule ${index + 1}:`);
              console.log(`ID: ${schedule.id}`);
              console.log(`Scheduled For: ${schedule.scheduledFor}`);
              console.log(`Is Overdue: ${schedule.isOverdue}`);
              console.log(`Time Until Due: ${schedule.timeUntilDue} ms`);
              
              if (schedule.isOverdue) {
                console.log(`🚨 CRON WILL PROCESS: Overdue schedule`);
              } else {
                console.log(`⏰ CRON WILL WAIT: Not yet due`);
              }
            });
          } else {
            console.log('✅ No pending schedules - cron job logic working correctly');
          }
          
        } else {
          console.log('❌ Cron debug failed:', json.error);
        }
      } catch (e) {
        console.log('❌ Cron JSON Parse Error:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Cron debug request error: ${e.message}`);
  });

  req.end();
}

// Start test
console.log('🔍 STARTING SCHEDULED_FOR LOGIC TEST...');
testScheduledForLogic();
