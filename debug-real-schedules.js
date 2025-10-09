// Debug với dữ liệu thực từ bảng schedules
const http = require('http');

function getRealSchedules() {
  console.log('🔍 Getting real schedules from database...');
  
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
    console.log(`Schedules API Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.success) {
          console.log('\n=== REAL SCHEDULES FROM DATABASE ===');
          console.log(`Total schedules: ${json.data.pagination.total}`);
          console.log(`Current page: ${json.data.pagination.page}`);
          console.log(`Schedules on this page: ${json.data.schedules.length}`);
          
          if (json.data.schedules.length > 0) {
            const now = new Date();
            const nowGMT7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
            
            console.log(`\nCurrent time (GMT+7): ${nowGMT7.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
            console.log(`Current time (UTC): ${now.toISOString()}`);
            
            json.data.schedules.forEach((schedule, index) => {
              console.log(`\n--- Schedule ${index + 1} ---`);
              console.log(`ID: ${schedule.id}`);
              console.log(`Status: ${schedule.status}`);
              console.log(`Scheduled For (DB): ${schedule.scheduled_for}`);
              console.log(`Timezone: ${schedule.timezone}`);
              console.log(`Target: ${schedule.target_name} (${schedule.target_id})`);
              console.log(`Retry Count: ${schedule.retry_count}/${schedule.max_retries}`);
              console.log(`Created: ${schedule.created_at}`);
              console.log(`Updated: ${schedule.updated_at}`);
              
              // Parse scheduled time
              const scheduledTime = new Date(schedule.scheduled_for);
              console.log(`Scheduled Time (Parsed): ${scheduledTime.toISOString()}`);
              console.log(`Scheduled Time (GMT+7): ${scheduledTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`);
              
              // Calculate time difference
              const diffMs = scheduledTime.getTime() - nowGMT7.getTime();
              const diffMinutes = Math.floor(diffMs / (1000 * 60));
              const diffHours = Math.floor(diffMinutes / 60);
              const diffDays = Math.floor(diffHours / 24);
              
              console.log(`Time Difference: ${diffMinutes} minutes (${diffHours} hours, ${diffDays} days)`);
              
              if (diffMs < 0) {
                const overdueMinutes = Math.abs(diffMinutes);
                const overdueHours = Math.abs(diffHours);
                console.log(`❌ OVERDUE by ${overdueMinutes} minutes (${overdueHours} hours)`);
                
                if (schedule.status === 'pending') {
                  console.log(`🚨 ISSUE: Schedule is overdue but still pending!`);
                } else {
                  console.log(`✅ Status updated: ${schedule.status}`);
                }
              } else {
                console.log(`⏰ Due in ${diffMinutes} minutes`);
              }
              
              // Check if should be processed by cron
              const shouldBeProcessed = diffMs < 0 && schedule.status === 'pending';
              console.log(`Should be processed by cron: ${shouldBeProcessed ? 'YES' : 'NO'}`);
              
              if (shouldBeProcessed) {
                console.log(`🔧 ACTION NEEDED: This schedule should be processed by cron job`);
              }
            });
          } else {
            console.log('No schedules found in database');
          }
          
          // Now check what cron job sees
          setTimeout(() => {
            checkCronView();
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
    console.error(`❌ Schedules request error: ${e.message}`);
  });

  req.end();
}

function checkCronView() {
  console.log('\n🔍 Checking what cron job sees...');
  
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
          console.log('\n=== CRON JOB VIEW ===');
          console.log(`Current time (GMT+7): ${json.data.currentTime.gmt7Formatted}`);
          console.log(`Pending schedules: ${json.data.pendingSchedules.count}`);
          console.log(`Failed schedules: ${json.data.failedSchedules.count}`);
          
          if (json.data.pendingSchedules.count > 0) {
            console.log('\n--- Pending Schedules (Cron View) ---');
            json.data.pendingSchedules.schedules.forEach((schedule, index) => {
              console.log(`\nSchedule ${index + 1}:`);
              console.log(`ID: ${schedule.id}`);
              console.log(`Scheduled For: ${schedule.scheduledFor}`);
              console.log(`Status: ${schedule.status}`);
              console.log(`Is Overdue: ${schedule.isOverdue}`);
              console.log(`Time Until Due: ${schedule.timeUntilDue} ms`);
              console.log(`Review: ${schedule.reviewTitle}`);
            });
          }
          
          if (json.data.failedSchedules.count > 0) {
            console.log('\n--- Failed Schedules (Cron View) ---');
            json.data.failedSchedules.schedules.forEach((schedule, index) => {
              console.log(`\nFailed Schedule ${index + 1}:`);
              console.log(`ID: ${schedule.id}`);
              console.log(`Scheduled For: ${schedule.scheduledFor}`);
              console.log(`Status: ${schedule.status}`);
              console.log(`Retry Count: ${schedule.retryCount}/${schedule.maxRetries}`);
              console.log(`Error: ${schedule.errorMessage}`);
            });
          }
          
          // Run cron job to process
          setTimeout(() => {
            runCronJob();
          }, 2000);
          
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

function runCronJob() {
  console.log('\n🚀 Running cron job to process schedules...');
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/cron/process-schedules',
    method: 'GET',
    headers: {
      'x-cron-secret': '4c32057816828f973d578326de17767caac3e8befa4167f4bbbf01b1a46bad46',
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    console.log(`Cron Job Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        console.log('\n=== CRON JOB RESULTS ===');
        console.log(`Success: ${json.success}`);
        console.log(`Processed: ${json.processed}`);
        console.log(`Posted: ${json.posted}`);
        console.log(`Failed: ${json.failed}`);
        console.log(`Duration: ${json.duration}`);
        console.log(`Message: ${json.message}`);
        
        if (json.results && json.results.length > 0) {
          console.log('\n--- Processing Results ---');
          json.results.forEach((result, index) => {
            console.log(`Result ${index + 1}:`);
            console.log(`  Schedule ID: ${result.scheduleId}`);
            console.log(`  Status: ${result.status}`);
            console.log(`  Message: ${result.message}`);
            if (result.error) {
              console.log(`  Error: ${result.error}`);
            }
          });
        }
        
        // Check schedules again after processing
        setTimeout(() => {
          console.log('\n🔍 Final check - schedules after processing...');
          getRealSchedules();
        }, 3000);
        
      } catch (e) {
        console.log('❌ Cron JSON Parse Error:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Cron job request error: ${e.message}`);
  });

  req.end();
}

// Start debug
console.log('🔍 STARTING REAL SCHEDULES DEBUG...');
getRealSchedules();
