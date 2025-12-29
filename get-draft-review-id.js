// Lấy ID của review draft đầu tiên
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function getDraftReview() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, video_title, status')
    .eq('user_id', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false })
    .limit(1);

  if (reviews && reviews.length > 0) {
    const review = reviews[0];
    console.log('\n✅ Found draft review:');
    console.log(`  ID: ${review.id}`);
    console.log(`  Title: ${review.video_title}`);
    console.log(`  Status: ${review.status}\n`);
  } else {
    console.log('\n❌ No draft reviews found\n');
  }
}

getDraftReview().catch(console.error);
