// Kiểm tra review f9713190
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function checkReview() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const reviewId = 'f9713190-c55a-406a-9fd8-2086f0f8f972';

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('id', reviewId)
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('\n📋 REVIEW f9713190:\n');
  console.log(`   ID: ${data.id}`);
  console.log(`   Title: ${data.video_title}`);
  console.log(`   Status: ${data.status}`);
  console.log(`   Created: ${data.created_at}`);
  console.log(`   Updated: ${data.updated_at}`);
}

checkReview().catch(console.error);
