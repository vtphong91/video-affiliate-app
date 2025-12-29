// Test updating review status directly
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testUpdate() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // ID của review "Unbox máy xay sinh tố"
  const reviewId = 'e3f48581-3304-4c88-a2ac-4a8331057240';

  console.log('\n🔍 Testing direct status update...\n');

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

  // Update status to published
  console.log('\n🔄 Updating status to "published"...\n');

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

  // Verify by fetching again
  console.log('\n🔍 Verifying update by fetching again...\n');

  const { data: verified } = await supabase
    .from('reviews')
    .select('id, video_title, status')
    .eq('id', reviewId)
    .single();

  console.log('📋 VERIFIED:');
  console.log(`  Status: ${verified.status}`);

  if (verified.status === 'published') {
    console.log('\n✅ SUCCESS! Status updated correctly.\n');
  } else {
    console.log('\n❌ FAILED! Status did not update.\n');
  }

  // Change back to draft
  console.log('🔄 Changing back to draft for testing...\n');
  await supabase
    .from('reviews')
    .update({ status: 'draft' })
    .eq('id', reviewId);

  console.log('✅ Reset to draft');
}

testUpdate().catch(console.error);
