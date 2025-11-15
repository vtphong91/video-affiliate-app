/**
 * Script kiểm tra hệ thống cron và scheduling
 * Chạy với: npx tsx debug-cron-system.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required:');
  console.log('  - NEXT_PUBLIC_SUPABASE_URL');
  console.log('  - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCronSystem() {
  console.log('🔍 ============================================');
  console.log('🔍 KIỂM TRA HỆ THỐNG CRON VÀ SCHEDULING');
  console.log('🔍 ============================================\n');

  // 1. Kiểm tra environment variables
  console.log('1️⃣ KIỂM TRA ENVIRONMENT VARIABLES');
  console.log('─────────────────────────────────────────');
  const envChecks = {
    'NEXT_PUBLIC_SUPABASE_URL': !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    'SUPABASE_SERVICE_ROLE_KEY': !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    'MAKECOM_WEBHOOK_URL': !!process.env.MAKECOM_WEBHOOK_URL,
    'CRON_SECRET': !!process.env.CRON_SECRET,
    'VERCEL_APP_URL': !!process.env.VERCEL_APP_URL || !!process.env.NEXT_PUBLIC_APP_URL,
  };

  for (const [key, value] of Object.entries(envChecks)) {
    console.log(`  ${value ? '✅' : '❌'} ${key}: ${value ? 'Configured' : 'MISSING'}`);
  }

  if (!envChecks.MAKECOM_WEBHOOK_URL) {
    console.log('\n  ⚠️  WARNING: MAKECOM_WEBHOOK_URL không được config!');
    console.log('      Schedules sẽ được mark "posted_without_webhook" và KHÔNG đăng lên Facebook');
  }

  if (!envChecks.CRON_SECRET) {
    console.log('\n  ⚠️  WARNING: CRON_SECRET không được config!');
    console.log('      GitHub Actions sẽ không thể trigger cron endpoint');
  }

  // 2. Kiểm tra database connection
  console.log('\n\n2️⃣ KIỂM TRA KẾT NỐI DATABASE');
  console.log('─────────────────────────────────────────');
  try {
    const { data, error } = await supabase.from('schedules').select('count').limit(1);
    if (error) throw error;
    console.log('  ✅ Database connection: OK');
  } catch (error) {
    console.log('  ❌ Database connection: FAILED');
    console.error('  Error:', error);
    process.exit(1);
  }

  // 3. Kiểm tra pending schedules
  console.log('\n\n3️⃣ KIỂM TRA PENDING SCHEDULES');
  console.log('─────────────────────────────────────────');

  const nowUTC = new Date();
  const nowTime = nowUTC.getTime();

  console.log(`  Current UTC Time: ${nowUTC.toISOString()}`);
  console.log(`  Current GMT+7 Time: ${new Date(nowTime + 7 * 60 * 60 * 1000).toISOString()}\n`);

  const { data: pendingSchedules, error: pendingError } = await supabase
    .from('schedules')
    .select('*')
    .eq('status', 'pending')
    .order('scheduled_for', { ascending: true });

  if (pendingError) {
    console.error('  ❌ Error fetching pending schedules:', pendingError);
  } else {
    console.log(`  📋 Total pending schedules: ${pendingSchedules?.length || 0}`);

    if (pendingSchedules && pendingSchedules.length > 0) {
      console.log('\n  Analyzing each schedule:\n');

      let overdueCount = 0;
      let futureCount = 0;

      for (const schedule of pendingSchedules) {
        const scheduledTime = new Date(schedule.scheduled_for).getTime();
        const isDue = scheduledTime <= nowTime;
        const diffMinutes = Math.round((scheduledTime - nowTime) / 60000);

        if (isDue) {
          overdueCount++;
          console.log(`  🔴 QUÁHẠN: ${schedule.id.substring(0, 8)}...`);
        } else {
          futureCount++;
          console.log(`  🟢 Chưa đến: ${schedule.id.substring(0, 8)}...`);
        }

        console.log(`     - Video: ${schedule.video_title || 'N/A'}`);
        console.log(`     - Scheduled (UTC): ${schedule.scheduled_for}`);
        console.log(`     - Scheduled (GMT+7): ${new Date(scheduledTime + 7 * 60 * 60 * 1000).toISOString()}`);
        console.log(`     - Is Due: ${isDue ? 'YES' : 'NO'}`);
        console.log(`     - Time Diff: ${isDue ? `Quá hạn ${Math.abs(diffMinutes)} phút` : `Còn ${diffMinutes} phút`}`);
        console.log(`     - Timezone field: ${schedule.timezone || 'N/A'}`);
        console.log('');
      }

      console.log(`  📊 Summary:`);
      console.log(`     - Quá hạn (cần đăng ngay): ${overdueCount}`);
      console.log(`     - Chưa đến hạn: ${futureCount}`);

      if (overdueCount > 0) {
        console.log('\n  ⚠️  CÓ SCHEDULES QUÁ HẠN CHƯA ĐƯỢC XỬ LÝ!');
        console.log('      Nguyên nhân có thể:');
        console.log('      1. GitHub Actions không chạy hoặc bị lỗi');
        console.log('      2. CRON_SECRET không đúng');
        console.log('      3. VERCEL_APP_URL không đúng');
        console.log('      4. Webhook endpoint bị lỗi');
      }
    } else {
      console.log('  ℹ️  Không có pending schedules nào');
    }
  }

  // 4. Kiểm tra failed schedules
  console.log('\n\n4️⃣ KIỂM TRA FAILED SCHEDULES');
  console.log('─────────────────────────────────────────');

  const { data: failedSchedules, error: failedError } = await supabase
    .from('schedules')
    .select('*')
    .eq('status', 'failed')
    .order('next_retry_at', { ascending: true })
    .limit(10);

  if (failedError) {
    console.error('  ❌ Error fetching failed schedules:', failedError);
  } else {
    console.log(`  📋 Total failed schedules (top 10): ${failedSchedules?.length || 0}\n`);

    if (failedSchedules && failedSchedules.length > 0) {
      for (const schedule of failedSchedules) {
        console.log(`  Schedule: ${schedule.id.substring(0, 8)}...`);
        console.log(`     - Video: ${schedule.video_title || 'N/A'}`);
        console.log(`     - Retry Count: ${schedule.retry_count}/${schedule.max_retries || 3}`);
        console.log(`     - Error: ${schedule.error_message || 'N/A'}`);
        console.log(`     - Next Retry: ${schedule.next_retry_at || 'N/A'}`);
        console.log('');
      }
    }
  }

  // 5. Kiểm tra posted schedules (recent)
  console.log('\n5️⃣ KIỂM TRA RECENT POSTED SCHEDULES');
  console.log('─────────────────────────────────────────');

  const { data: postedSchedules, error: postedError } = await supabase
    .from('schedules')
    .select('*')
    .eq('status', 'posted')
    .order('posted_at', { ascending: false })
    .limit(5);

  if (postedError) {
    console.error('  ❌ Error fetching posted schedules:', postedError);
  } else {
    console.log(`  📋 Recent posted schedules (last 5): ${postedSchedules?.length || 0}\n`);

    if (postedSchedules && postedSchedules.length > 0) {
      for (const schedule of postedSchedules) {
        console.log(`  Schedule: ${schedule.id.substring(0, 8)}...`);
        console.log(`     - Video: ${schedule.video_title || 'N/A'}`);
        console.log(`     - Scheduled For: ${schedule.scheduled_for}`);
        console.log(`     - Posted At: ${schedule.posted_at}`);
        console.log('');
      }
    } else {
      console.log('  ℹ️  Chưa có schedule nào được posted');
    }
  }

  // 6. Kiểm tra webhook logs
  console.log('\n6️⃣ KIỂM TRA WEBHOOK LOGS (RECENT)');
  console.log('─────────────────────────────────────────');

  const { data: webhookLogs, error: webhookError } = await supabase
    .from('webhook_logs')
    .select('*')
    .order('request_sent_at', { ascending: false })
    .limit(5);

  if (webhookError) {
    console.error('  ❌ Error fetching webhook logs:', webhookError);
  } else {
    console.log(`  📋 Recent webhook logs (last 5): ${webhookLogs?.length || 0}\n`);

    if (webhookLogs && webhookLogs.length > 0) {
      for (const log of webhookLogs) {
        console.log(`  Webhook: ${log.id.substring(0, 8)}...`);
        console.log(`     - Schedule ID: ${log.schedule_id.substring(0, 8)}...`);
        console.log(`     - Status: ${log.response_status || 'No response'}`);
        console.log(`     - Sent At: ${log.request_sent_at}`);
        console.log(`     - Error: ${log.error_message || 'None'}`);
        console.log('');
      }
    } else {
      console.log('  ℹ️  Chưa có webhook nào được gửi');
    }
  }

  console.log('\n🔍 ============================================');
  console.log('🔍 KẾT THÚC KIỂM TRA');
  console.log('🔍 ============================================\n');
}

// Run the check
checkCronSystem().catch(console.error);
