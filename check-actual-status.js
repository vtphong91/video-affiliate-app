// Kiểm tra thực tế có bao nhiêu draft và published
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkActualStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Query trực tiếp từ database
  const { data: allReviews, error } = await supabase
    .from('reviews')
    .select('id, video_title, status, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`\n📊 THỐNG KÊ TRẠNG THÁI THỰC TẾ:\n`);
  console.log(`   Tổng số reviews: ${allReviews.length}`);

  const draftReviews = allReviews.filter(r => r.status === 'draft');
  const publishedReviews = allReviews.filter(r => r.status === 'published');

  console.log(`   📝 Draft: ${draftReviews.length} reviews`);
  console.log(`   ✅ Published: ${publishedReviews.length} reviews`);

  if (draftReviews.length > 0) {
    console.log(`\n📋 DANH SÁCH DRAFT REVIEWS:\n`);
    draftReviews.forEach((r, i) => {
      console.log(`   ${i + 1}. ID: ${r.id}`);
      console.log(`      Title: ${r.video_title?.substring(0, 60)}`);
      console.log(`      Status: ${r.status}\n`);
    });
  }

  console.log(`\n📋 10 PUBLISHED REVIEWS ĐẦU TIÊN:\n`);
  publishedReviews.slice(0, 10).forEach((r, i) => {
    console.log(`   ${i + 1}. ${r.id.substring(0, 8)}... - ${r.video_title?.substring(0, 60)}`);
  });
}

checkActualStatus().catch(console.error);
