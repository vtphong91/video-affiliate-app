// Test webhook directly
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test-webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Testing webhook directly to Make.com...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('✅ Webhook Test Result:');
      console.log(`Success: ${json.success}`);
      console.log(`Status: ${json.status}`);
      console.log(`Status Text: ${json.statusText}`);
      console.log(`Response: ${json.response}`);
      console.log(`Webhook URL: ${json.webhookUrl}`);
      console.log(`Timestamp: ${json.timestamp}`);
      
      if (json.success) {
        console.log('✅ Webhook sent successfully to Make.com!');
      } else {
        console.log('❌ Webhook failed:', json.error);
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
