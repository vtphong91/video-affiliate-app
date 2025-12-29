// Find the correct ID for "Mang đến..." review
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function findReview() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, video_title, status')
    .eq('user_id', userId)
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  console.log('\n📋 All DRAFT reviews:\n');
  reviews?.forEach((r, i) => {
    console.log(`${i + 1}. ${r.id}`);
    console.log(`   Title: ${r.video_title?.substring(0, 70)}`);
    console.log(`   Status: ${r.status}\n`);
  });
}

findReview().catch(console.error);
