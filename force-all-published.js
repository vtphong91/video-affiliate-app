// Force update TẤT CẢ reviews thành published
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function forceAllPublished() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  console.log('\n🔄 Force updating ALL reviews to published...\n');

  // Update ALL reviews to published
  const { data, error } = await supabase
    .from('reviews')
    .update({ status: 'published' })
    .eq('user_id', userId)
    .select('id, video_title, status');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`✅ Updated ${data.length} reviews to published\n`);

  // Verify
  const { data: allReviews } = await supabase
    .from('reviews')
    .select('status')
    .eq('user_id', userId);

  const draftCount = allReviews.filter(r => r.status === 'draft').length;
  const publishedCount = allReviews.filter(r => r.status === 'published').length;

  console.log('📊 Final status:');
  console.log(`   Total: ${allReviews.length}`);
  console.log(`   Published: ${publishedCount}`);
  console.log(`   Draft: ${draftCount}\n`);

  if (draftCount === 0) {
    console.log('🎉 SUCCESS! All reviews are published!\n');
  } else {
    console.log('⚠️  WARNING! Still have draft reviews:\n');
    const { data: drafts } = await supabase
      .from('reviews')
      .select('id, video_title, status')
      .eq('user_id', userId)
      .eq('status', 'draft');

    drafts.forEach(r => {
      console.log(`   - ${r.video_title?.substring(0, 50)}`);
    });
    console.log();
  }
}

forceAllPublished().catch(console.error);
