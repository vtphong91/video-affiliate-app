// Detailed cron debug script
const http = require('http');

function debugSchedules() {
  console.log('🔍 DEBUG: Getting detailed schedule information...');
  
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
    console.log(`Debug Status: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.success) {
          console.log('\n=== CURRENT TIME ===');
          console.log(`UTC: ${json.data.currentTime.utc}`);
          console.log(`GMT+7: ${json.data.currentTime.gmt7}`);
          console.log(`GMT+7 Formatted: ${json.data.currentTime.gmt7Formatted}`);
          
          console.log('\n=== PENDING SCHEDULES ===');
          console.log(`Count: ${json.data.pendingSchedules.count}`);
          
          if (json.data.pendingSchedules.count > 0) {
            json.data.pendingSchedules.schedules.forEach((schedule, index) => {
              console.log(`\n--- Schedule ${index + 1} ---`);
              console.log(`ID: ${schedule.id}`);
              console.log(`Scheduled For: ${schedule.scheduledFor}`);
              console.log(`Status: ${schedule.status}`);
              console.log(`Retry Count: ${schedule.retryCount}`);
              console.log(`Is Overdue: ${schedule.isOverdue}`);
              console.log(`Time Until Due: ${schedule.timeUntilDue} ms`);
              console.log(`Review Title: ${schedule.reviewTitle}`);
              
              // Calculate time difference
              const scheduledTime = new Date(schedule.scheduledFor);
              const currentTime = new Date(json.data.currentTime.utc);
              const diffMs = scheduledTime.getTime() - currentTime.getTime();
              const diffMinutes = Math.floor(diffMs / (1000 * 60));
              const diffHours = Math.floor(diffMinutes / 60);
              
              console.log(`Time Difference: ${diffMinutes} minutes (${diffHours} hours)`);
              
              if (diffMs < 0) {
                console.log(`❌ OVERDUE by ${Math.abs(diffMinutes)} minutes`);
              } else {
                console.log(`⏰ Due in ${diffMinutes} minutes`);
              }
            });
          }
          
          console.log('\n=== FAILED SCHEDULES ===');
          console.log(`Count: ${json.data.failedSchedules.count}`);
          
          if (json.data.failedSchedules.count > 0) {
            json.data.failedSchedules.schedules.forEach((schedule, index) => {
              console.log(`\n--- Failed Schedule ${index + 1} ---`);
              console.log(`ID: ${schedule.id}`);
              console.log(`Scheduled For: ${schedule.scheduledFor}`);
              console.log(`Status: ${schedule.status}`);
              console.log(`Retry Count: ${schedule.retryCount}/${schedule.maxRetries}`);
              console.log(`Next Retry: ${schedule.nextRetryAt}`);
              console.log(`Error: ${schedule.errorMessage}`);
            });
          }
          
          console.log('\n=== WEBHOOK CONFIG ===');
          console.log(`Webhook URL: ${json.data.webhookConfig.webhookUrl}`);
          console.log(`Cron Secret: ${json.data.webhookConfig.cronSecret}`);
          
        } else {
          console.log('❌ Debug failed:', json.error);
        }
      } catch (e) {
        console.log('❌ JSON Parse Error:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Debug request error: ${e.message}`);
  });

  req.end();
}

function runCronJob() {
  console.log('\n🚀 RUNNING CRON JOB...');
  
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
    console.log(`Cron Status: ${res.statusCode}`);
    
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
        console.log(`Posted without webhook: ${json.postedWithoutWebhook}`);
        console.log(`Duration: ${json.duration}`);
        console.log(`Message: ${json.message}`);
        
        if (json.results && json.results.length > 0) {
          console.log('\n=== DETAILED RESULTS ===');
          json.results.forEach((result, index) => {
            console.log(`\n--- Result ${index + 1} ---`);
            console.log(`Schedule ID: ${result.scheduleId}`);
            console.log(`Status: ${result.status}`);
            console.log(`Message: ${result.message}`);
            if (result.error) {
              console.log(`Error: ${result.error}`);
            }
          });
        }
        
        // Check schedules again after processing
        setTimeout(() => {
          console.log('\n🔍 CHECKING SCHEDULES AFTER PROCESSING...');
          debugSchedules();
        }, 2000);
        
      } catch (e) {
        console.log('❌ Cron JSON Parse Error:', e.message);
        console.log('Raw response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Cron request error: ${e.message}`);
  });

  req.end();
}

// Run debug
console.log('🔍 STARTING DETAILED CRON DEBUG...');
debugSchedules();

// Run cron job after 3 seconds
setTimeout(() => {
  runCronJob();
}, 3000);
