// Test webhook payload by creating a test schedule
const http = require('http');

// First, let's create a test schedule
const createScheduleData = {
  reviewId: '1660f68c-bd9c-467e-9837-afebf4952dbd', // Use existing review ID
  scheduledFor: new Date(Date.now() + 60000).toISOString().replace('Z', ''), // 1 minute from now
  targetType: 'page',
  targetId: 'facebook-page-real',
  targetName: 'Facebook Page Real',
  postMessage: 'Test webhook payload',
  landingPageUrl: 'http://localhost:3000/test',
  videoUrl: 'https://www.youtube.com/watch?v=test',
  videoThumbnail: 'https://i.ytimg.com/vi/test/maxresdefault.jpg',
  affiliateLinks: [{ url: 'https://test.com', price: '100.000đ', platform: 'Test' }],
  channelName: 'Test Channel'
};

console.log('Creating test schedule...');

const createOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/schedules',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const createReq = http.request(createOptions, (res) => {
  console.log(`Create Status: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.success) {
        console.log('✅ Test schedule created:', json.data.id);
        
        // Wait 2 seconds then run cron
        setTimeout(() => {
          console.log('Running cron job to process test schedule...');
          
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
                console.log('✅ Cron Job Result:');
                console.log(`Processed: ${cronJson.processed}`);
                console.log(`Posted: ${cronJson.posted}`);
                console.log(`Failed: ${cronJson.failed}`);
                
                if (cronJson.results && cronJson.results.length > 0) {
                  cronJson.results.forEach(result => {
                    console.log(`Schedule ${result.scheduleId}: ${result.status} - ${result.message}`);
                  });
                }
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
        console.log('❌ Failed to create test schedule:', json.error);
      }
    } catch (e) {
      console.log('❌ JSON Parse Error:', e.message);
      console.log('Raw response:', data);
    }
  });
});

createReq.on('error', (e) => {
  console.error(`❌ Create Request error: ${e.message}`);
});

createReq.write(JSON.stringify(createScheduleData));
createReq.end();
