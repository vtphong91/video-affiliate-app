// Auto cron job runner
const http = require('http');

function runCronJob() {
  console.log(`🕐 Running cron job at ${new Date().toLocaleString('vi-VN')}...`);
  
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
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.success) {
          console.log(`✅ Cron job completed: ${json.processed} processed, ${json.posted} posted, ${json.failed} failed`);
          if (json.results && json.results.length > 0) {
            json.results.forEach(result => {
              console.log(`  - Schedule ${result.scheduleId}: ${result.status}`);
            });
          }
        } else {
          console.log(`❌ Cron job failed: ${json.error}`);
        }
      } catch (e) {
        console.log('❌ JSON Parse Error:', e.message);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Cron job error: ${e.message}`);
  });

  req.end();
}

// Run every 30 seconds
console.log('🚀 Starting auto cron job (every 30 seconds)...');
console.log('Press Ctrl+C to stop');

runCronJob(); // Run immediately
setInterval(runCronJob, 30000); // Then every 30 seconds
