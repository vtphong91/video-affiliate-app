// Test affiliate links formatting
const http = require('http');

// Test with real review data
const createScheduleData = {
  reviewId: '1660f68c-bd9c-467e-9837-afebf4952dbd', // Hair dryer review with affiliate links
  scheduledFor: new Date(Date.now() + 60000).toISOString().replace('Z', ''), // 1 minute from now
  targetType: 'page',
  targetId: 'facebook-page-real',
  targetName: 'Facebook Page Real',
  postMessage: 'Test affiliate links formatting',
  landingPageUrl: 'http://localhost:3000/test',
  videoUrl: 'https://www.youtube.com/watch?v=test',
  videoThumbnail: 'https://i.ytimg.com/vi/test/maxresdefault.jpg',
  affiliateLinks: [
    { url: 'https://shorten.asia/Xdt9g47b', price: '1.501.000đ', platform: 'ĐẶT MUA TẠI SHOPEE MALL' }
  ],
  channelName: 'LocknLock Vietnam'
};

console.log('Testing affiliate links formatting...');
console.log('Input affiliate links:', JSON.stringify(createScheduleData.affiliateLinks, null, 2));

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/schedules',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

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
        console.log('✅ Schedule created successfully:', json.data.id);
        console.log('✅ Affiliate links should be formatted in database');
        console.log('✅ Check server logs for formatted affiliate links');
      } else {
        console.log('❌ Failed to create schedule:', json.error);
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

req.write(JSON.stringify(createScheduleData));
req.end();
