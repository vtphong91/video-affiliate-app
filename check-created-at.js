// Check if the missing review has unusual created_at timestamp
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkTimestamp() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
  const missingId = 'ec35d7b1-c55a-406a-9fd8-2086f0f8f972';

  // Get all reviews
  const { data: allReviews } = await supabase
    .from('reviews')
    .select('id, video_title, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Get reviews with gte filter (like the new query)
  const { data: gteReviews } = await supabase
    .from('reviews')
    .select('id, video_title, status, created_at')
    .eq('user_id', userId)
    .gte('created_at', '2000-01-01')
    .order('created_at', { ascending: false });

  console.log('\n📊 Comparison:');
  console.log(`Without gte filter: ${allReviews.length} reviews`);
  console.log(`With gte filter: ${gteReviews.length} reviews`);

  const missingInAll = allReviews.find(r => r.id === missingId);
  const missingInGte = gteReviews.find(r => r.id === missingId);

  console.log('\n🔍 Missing review (ec35d7b1):');
  console.log(`In query without gte: ${missingInAll ? '✅ YES' : '❌ NO'}`);
  console.log(`In query with gte: ${missingInGte ? '✅ YES' : '❌ NO'}`);

  if (missingInAll) {
    console.log('\n📅 Timestamp details:');
    console.log(`Created at: ${missingInAll.created_at}`);
    console.log(`Type: ${typeof missingInAll.created_at}`);
    console.log(`Is valid date: ${!isNaN(new Date(missingInAll.created_at))}`);
  }

  // Show first 3 from each query
  console.log('\n📋 First 3 reviews (no gte filter):');
  allReviews.slice(0, 3).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.id.substring(0, 8)}... (${r.status}) - ${r.created_at}`);
  });

  console.log('\n📋 First 3 reviews (with gte filter):');
  gteReviews.slice(0, 3).forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.id.substring(0, 8)}... (${r.status}) - ${r.created_at}`);
  });
}

checkTimestamp().catch(console.error);
