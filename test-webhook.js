// Test webhook payload
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

console.log('Testing webhook configuration...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Webhook Configuration:');
      console.log(`Webhook URL: ${json.data.webhookConfig.webhookUrl}`);
      console.log(`Cron Secret: ${json.data.webhookConfig.cronSecret}`);
      
      if (json.data.webhookConfig.webhookUrl === 'Configured') {
        console.log('✅ Webhook URL is configured');
      } else {
        console.log('❌ Webhook URL is NOT configured');
        console.log('Please set MAKECOM_WEBHOOK_URL in environment variables');
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
