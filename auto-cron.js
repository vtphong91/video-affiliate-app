require('dotenv').config({ path: '.env.local' });

const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';
const CRON_INTERVAL = 30000; // 30 seconds in development
const API_URL = 'http://localhost:3000';

console.log('🚀 Auto Cron Job Started');
console.log(`⏰ Interval: ${CRON_INTERVAL / 1000} seconds`);
console.log(`🔗 API URL: ${API_URL}`);
console.log(`🔐 Cron Secret: ${CRON_SECRET.substring(0, 10)}...`);

async function runCronJob() {
  const timestamp = new Date().toISOString();
  console.log(`\n🕐 [${timestamp}] Running cron job...`);
  
  try {
    // Call process-schedules API
    const response = await fetch(`${API_URL}/api/cron/process-schedules`, {
      method: 'POST',
      headers: {
        'x-cron-secret': CRON_SECRET,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Cron job completed:`, result);
      
      if (result.processed > 0) {
        console.log(`📤 Processed ${result.processed} schedules`);
        if (result.failed > 0) {
          console.log(`❌ Failed: ${result.failed} schedules`);
        }
      } else {
        console.log(`📋 No schedules to process`);
      }
    } else {
      const error = await response.text();
      console.error(`❌ Cron job failed: ${response.status} - ${error}`);
    }
  } catch (error) {
    console.error(`❌ Cron job error:`, error.message);
  }
}

// Run immediately
runCronJob();

// Then run every interval
setInterval(runCronJob, CRON_INTERVAL);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Auto Cron Job Stopped');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Auto Cron Job Stopped');
  process.exit(0);
});
