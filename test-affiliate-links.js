// Test affiliate links với dữ liệu thực
const http = require('http');

// Tạo schedule với affiliate links thực
const createScheduleData = {
  reviewId: 'a2e7bbae-b850-4326-a229-839fe9306a47', // Nut milk maker review
  scheduledFor: new Date(Date.now() + 60000).toISOString().replace('Z', ''), // 1 minute from now
  targetType: 'page',
  targetId: 'facebook-page-real',
  targetName: 'Facebook Page Real',
  postMessage: 'Test affiliate links with real data',
  landingPageUrl: 'http://localhost:3000/test',
  videoUrl: 'https://www.youtube.com/watch?v=X7U_-q4AemQ',
  videoThumbnail: 'https://i.ytimg.com/vi/X7U_-q4AemQ/maxresdefault.jpg',
  affiliateLinks: [
    { url: 'https://shorten.asia/F5NpBYUQ', price: '2.386.000đ', platform: 'ĐẶT MUA TẠI SHOPEE MALL' }
  ],
  channelName: 'LocknLock Vietnam'
};

console.log('Testing affiliate links with real data...');
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
  console.log(`Create Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.success) {
        console.log('✅ Schedule created successfully:', json.data.id);
        console.log('✅ Check server logs for formatted affiliate links');
        
        // Wait 2 seconds then run cron to see the result
        setTimeout(() => {
          console.log('\n🚀 Running cron job to process schedule...');
          
          const cronOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/cron/process-schedules',
            method: 'GET',
            headers: {
              'x-cron-secret': '4c32057816828f973d578326de17767caac3e8befa4167f4bbbf01b1a46bad46',
              'Content-Type': 'application/json'
            }
          };
          
          const cronReq = http.request(cronOptions, (cronRes) => {
            console.log(`Cron Status: ${cronRes.statusCode}`);
            
            let cronData = '';
            cronRes.on('data', (chunk) => {
              cronData += chunk;
            });
            
            cronRes.on('end', () => {
              try {
                const cronJson = JSON.parse(cronData);
                console.log('\n✅ Cron Job Result:');
                console.log(`Processed: ${cronJson.processed}`);
                console.log(`Posted: ${cronJson.posted}`);
                console.log(`Failed: ${cronJson.failed}`);
                
                if (cronJson.results && cronJson.results.length > 0) {
                  cronJson.results.forEach(result => {
                    console.log(`Schedule ${result.scheduleId}: ${result.status} - ${result.message}`);
                  });
                }
                
                console.log('\n✅ Check server logs for affiliate links processing!');
                
              } catch (e) {
                console.log('❌ Cron JSON Parse Error:', e.message);
                console.log('Raw cron response:', cronData);
              }
            });
          });
          
          cronReq.on('error', (e) => {
            console.error(`❌ Cron Request error: ${e.message}`);
          });
          
          cronReq.end();
        }, 2000);
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
