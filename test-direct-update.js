// Test direct update với service role key để bypass RLS
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testDirectUpdate() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Review ID từ screenshot
  const reviewId = 'f57e838a-a6c5-4f33-8330-78e6967c9dd2';

  console.log('\n🔍 Testing direct update with service role key...\n');

  // Get current status
  const { data: before } = await supabase
    .from('reviews')
    .select('id, video_title, status')
    .eq('id', reviewId)
    .single();

  console.log('📋 BEFORE update:');
  console.log(`  ID: ${before.id}`);
  console.log(`  Title: ${before.video_title?.substring(0, 50)}`);
  console.log(`  Status: ${before.status}`);

  // Update ONLY status field
  console.log('\n🔄 Updating ONLY status field to "published"...\n');

  const { data: updated, error } = await supabase
    .from('reviews')
    .update({ status: 'published' })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('📋 AFTER update:');
  console.log(`  ID: ${updated.id}`);
  console.log(`  Title: ${updated.video_title?.substring(0, 50)}`);
  console.log(`  Status: ${updated.status}`);

  // Verify
  const { data: verified } = await supabase
    .from('reviews')
    .select('id, status')
    .eq('id', reviewId)
    .single();

  if (verified.status === 'published') {
    console.log('\n✅ SUCCESS! Status updated to published.\n');
  } else {
    console.log('\n❌ FAILED! Status is still:', verified.status, '\n');
  }
}

testDirectUpdate().catch(console.error);
