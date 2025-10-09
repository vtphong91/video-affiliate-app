// Simple Node.js test script
const http = require('http');

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

console.log('Testing API...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ API Response:');
      console.log(`Pending schedules: ${json.data.pendingSchedules.count}`);
      console.log(`Failed schedules: ${json.data.failedSchedules.count}`);
      console.log(`Current time: ${json.data.currentTime.gmt7Formatted}`);
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
