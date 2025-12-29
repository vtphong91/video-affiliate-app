// Debug script to find why review ec35d7b1 is missing
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function debugMissingReview() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  console.log('\n🔍 Searching for review with ID starting with ec35d7b1...\n');

  // Get all reviews for the user
  const { data: allReviews, error: allError } = await supabase
    .from('reviews')
    .select('id, video_title, status, user_id, created_at')
    .eq('user_id', '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('❌ Error fetching all reviews:', allError);
    return;
  }

  console.log(`\n📊 Total reviews found: ${allReviews.length}\n`);

  // Find the missing review
  const missingReview = allReviews.find(r => r.id.startsWith('ec35d7b1'));

  if (missingReview) {
    console.log('✅ Found the review that should be appearing:\n');
    console.log(JSON.stringify(missingReview, null, 2));
  } else {
    console.log('❌ Review ec35d7b1... not found in database!');
  }

  // Count by status
  const draftCount = allReviews.filter(r => r.status === 'draft').length;
  const publishedCount = allReviews.filter(r => r.status === 'published').length;

  console.log(`\n📊 Status breakdown:`);
  console.log(`  - Draft: ${draftCount}`);
  console.log(`  - Published: ${publishedCount}`);
  console.log(`  - Total: ${allReviews.length}`);

  // Show all draft reviews
  const drafts = allReviews.filter(r => r.status === 'draft');
  console.log(`\n📋 All draft reviews (${drafts.length}):`);
  drafts.forEach((d, i) => {
    console.log(`  ${i + 1}. ${d.id.substring(0, 8)}... - ${d.video_title?.substring(0, 50)}`);
  });
}

debugMissingReview().catch(console.error);
