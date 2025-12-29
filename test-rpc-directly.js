// Test RPC function trực tiếp
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testRPC() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  console.log('\n🧪 TEST 1: RPC get_user_reviews (ALL)\n');
  const { data: allReviews, error: error1 } = await supabase
    .rpc('get_user_reviews', { p_user_id: userId });

  if (error1) {
    console.error('❌ Error:', error1);
  } else {
    console.log(`   Total: ${allReviews.length} reviews`);
    console.log(`   First 3 IDs:`);
    allReviews.slice(0, 3).forEach((r, i) => {
      console.log(`      ${i + 1}. ${r.id.substring(0, 8)}... - ${r.status} - ${r.video_title?.substring(0, 50)}`);
    });
  }

  console.log('\n🧪 TEST 2: RPC get_user_reviews_by_status (DRAFT)\n');
  const { data: draftReviews, error: error2 } = await supabase
    .rpc('get_user_reviews_by_status', {
      p_user_id: userId,
      p_status: 'draft'
    });

  if (error2) {
    console.error('❌ Error:', error2);
  } else {
    console.log(`   Total: ${draftReviews.length} draft reviews`);
    draftReviews.forEach((r, i) => {
      console.log(`      ${i + 1}. ${r.id.substring(0, 8)}... - ${r.status} - ${r.video_title?.substring(0, 50)}`);
    });
  }

  console.log('\n🧪 TEST 3: RPC get_user_reviews_by_status (PUBLISHED)\n');
  const { data: publishedReviews, error: error3 } = await supabase
    .rpc('get_user_reviews_by_status', {
      p_user_id: userId,
      p_status: 'published'
    });

  if (error3) {
    console.error('❌ Error:', error3);
  } else {
    console.log(`   Total: ${publishedReviews.length} published reviews`);
    console.log(`   First 3 IDs:`);
    publishedReviews.slice(0, 3).forEach((r, i) => {
      console.log(`      ${i + 1}. ${r.id.substring(0, 8)}... - ${r.status} - ${r.video_title?.substring(0, 50)}`);
    });
  }

  console.log('\n🧪 TEST 4: Direct query (no RPC) for comparison\n');
  const { data: directReviews, error: error4 } = await supabase
    .from('reviews')
    .select('id, video_title, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error4) {
    console.error('❌ Error:', error4);
  } else {
    console.log(`   Total: ${directReviews.length} reviews`);
    console.log(`   First 3 IDs:`);
    directReviews.slice(0, 3).forEach((r, i) => {
      console.log(`      ${i + 1}. ${r.id.substring(0, 8)}... - ${r.status} - ${r.video_title?.substring(0, 50)}`);
    });

    const draftCount = directReviews.filter(r => r.status === 'draft').length;
    const publishedCount = directReviews.filter(r => r.status === 'published').length;
    console.log(`\n   📊 Status breakdown:`);
    console.log(`      Draft: ${draftCount}`);
    console.log(`      Published: ${publishedCount}`);
  }
}

testRPC().catch(console.error);
