// View formatted affiliate links
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/test-affiliate',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log('Viewing formatted affiliate links from schedules...');

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.success) {
        console.log('✅ Formatted Affiliate Links:');
        console.log(`Found ${json.data.count} schedules`);
        console.log('');
        
        json.data.schedules.forEach((schedule, index) => {
          console.log(`--- Schedule ${index + 1} ---`);
          console.log(`ID: ${schedule.id}`);
          console.log(`Created: ${schedule.created_at}`);
          console.log(`Affiliate Links:`);
          console.log(schedule.affiliate_links);
          console.log(`Post Message Preview:`);
          console.log(schedule.post_message_preview);
          console.log('');
        });
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
