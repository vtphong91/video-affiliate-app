// Kiểm tra tất cả reviews theo status
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkAllReviews() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Get all reviews
  const { data: all } = await supabase
    .from('reviews')
    .select('id, video_title, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log(`\n📊 Total reviews: ${all.length}\n`);

  const draftCount = all.filter(r => r.status === 'draft').length;
  const publishedCount = all.filter(r => r.status === 'published').length;

  console.log(`✅ Published: ${publishedCount}`);
  console.log(`📝 Draft: ${draftCount}\n`);

  if (draftCount > 0) {
    console.log('📋 Draft reviews:');
    all.filter(r => r.status === 'draft').forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.video_title?.substring(0, 60)} (ID: ${r.id})`);
    });
    console.log();
  }
}

checkAllReviews().catch(console.error);
