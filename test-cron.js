// Test cron job processing
const http = require('http');

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

console.log('Testing cron job processing...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Cron Job Response:');
      console.log(`Success: ${json.success}`);
      console.log(`Processed: ${json.processed}`);
      console.log(`Posted: ${json.posted}`);
      console.log(`Failed: ${json.failed}`);
      console.log(`Posted without webhook: ${json.postedWithoutWebhook}`);
      console.log(`Duration: ${json.duration}`);
      console.log(`Message: ${json.message}`);
      
      if (json.results && json.results.length > 0) {
        console.log('\n=== DETAILED RESULTS ===');
        json.results.forEach(result => {
          console.log(`Schedule ${result.scheduleId}: ${result.status} - ${result.message}`);
        });
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
