// Kiểm tra status của review "Góc bếp trở nên hiện đại hơn..."
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkReview() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Tìm review bằng video title
  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, video_title, status, updated_at')
    .eq('user_id', userId)
    .ilike('video_title', '%Góc bếp%')
    .order('created_at', { ascending: false });

  console.log('\n📋 Reviews matching "Góc bếp":\n');

  if (reviews && reviews.length > 0) {
    reviews.forEach((r, i) => {
      console.log(`${i + 1}. ID: ${r.id}`);
      console.log(`   Title: ${r.video_title}`);
      console.log(`   Status: ${r.status}`);
      console.log(`   Updated: ${r.updated_at}\n`);
    });
  } else {
    console.log('❌ No reviews found\n');
  }
}

checkReview().catch(console.error);
