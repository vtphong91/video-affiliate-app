// Check if review ec35d7b1 is scheduled
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkSchedule() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const reviewId = 'ec35d7b1-c55a-406a-9fd8-2086f0f8f972';

  console.log(`\n🔍 Checking if review ${reviewId} is in schedules table...\n`);

  const { data: schedules, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('review_id', reviewId);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  if (schedules && schedules.length > 0) {
    console.log(`✅ Review IS scheduled:\n`);
    console.log(JSON.stringify(schedules, null, 2));
  } else {
    console.log(`❌ Review is NOT in schedules table`);
  }
}

checkSchedule().catch(console.error);
