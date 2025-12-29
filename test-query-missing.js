// Test if we can query the missing review using the same client setup as the service
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Copy the EXACT client creation from getFreshAdminClient()
function getFreshAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

async function testQuery() {
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';
  const missingId = 'ec35d7b1-c55a-406a-9fd8-2086f0f8f972';

  console.log('\n🔍 Testing queries with getFreshAdminClient() setup...\n');

  // Test 1: Get ALL reviews
  console.log('TEST 1: Get ALL reviews for user');
  const client1 = getFreshAdminClient();
  const { data: allReviews, error: error1 } = await client1
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error1) {
    console.error('❌ Error:', error1);
  } else {
    console.log(`✅ Total: ${allReviews.length} reviews`);
    const drafts = allReviews.filter(r => r.status === 'draft');
    console.log(`📊 Drafts: ${drafts.length}`);
    const hasMissing = allReviews.find(r => r.id === missingId);
    console.log(`🔍 Contains ec35d7b1?: ${hasMissing ? '✅ YES' : '❌ NO'}`);
  }

  // Test 2: Get only drafts
  console.log('\nTEST 2: Get DRAFT reviews for user');
  const client2 = getFreshAdminClient();
  const { data: draftReviews, error: error2 } = await client2
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  if (error2) {
    console.error('❌ Error:', error2);
  } else {
    console.log(`✅ Total: ${draftReviews.length} draft reviews`);
    const hasMissing = draftReviews.find(r => r.id === missingId);
    console.log(`🔍 Contains ec35d7b1?: ${hasMissing ? '✅ YES' : '❌ NO'}`);
  }

  // Test 3: Get the specific review by ID
  console.log('\nTEST 3: Get specific review by ID');
  const client3 = getFreshAdminClient();
  const { data: specificReview, error: error3 } = await client3
    .from('reviews')
    .select('*')
    .eq('id', missingId)
    .single();

  if (error3) {
    console.error('❌ Error:', error3);
  } else if (specificReview) {
    console.log(`✅ Found: ${specificReview.video_title}`);
    console.log(`📊 Status: ${specificReview.status}`);
    console.log(`👤 User ID: ${specificReview.user_id}`);
  } else {
    console.log('❌ Not found');
  }
}

testQuery().catch(console.error);
