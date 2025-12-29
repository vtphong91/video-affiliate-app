// Update the "Mang đến..." review to published status
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function updateToPublished() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // "Mang đến những bữa ăn..." review ID
  const reviewId = 'e66ffc01-9789-4b27-8742-035b637db97f';

  console.log('\n🔄 Updating review to published...\n');

  const { data, error } = await supabase
    .from('reviews')
    .update({ status: 'published' })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Updated successfully!');
  console.log('   ID:', data.id);
  console.log('   Title:', data.video_title?.substring(0, 60));
  console.log('   Status:', data.status);
  console.log('\n👉 Now reload the Reviews page to see if it appears in "Đã xuất bản" tab\n');
}

updateToPublished().catch(console.error);
