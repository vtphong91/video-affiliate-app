// Test to find missing review
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'SET' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMissingReview() {
  console.log('🔍 Testing to find missing review...\n');

  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  // Test 1: Count using SQL
  console.log('📊 Test 1: Direct SQL COUNT');
  const { count: sqlCount, error: countError } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  console.log('  SQL COUNT result:', sqlCount);
  console.log('  Error:', countError);

  // Test 2: Fetch with select('*')
  console.log('\n📊 Test 2: Fetch with select(\'*\')');
  const { data: allData, error: allError } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log('  Fetched rows:', allData?.length);
  console.log('  Error:', allError);

  // Test 3: Fetch with specific fields
  console.log('\n📊 Test 3: Fetch with specific fields');
  const { data: specificData, error: specificError } = await supabase
    .from('reviews')
    .select('id, video_title, created_at, category_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  console.log('  Fetched rows:', specificData?.length);
  console.log('  Error:', specificError);

  // Test 4: Fetch in batches to check for pagination bug
  console.log('\n📊 Test 4: Fetch in batches');
  let allReviews = [];
  let page = 0;
  const pageSize = 100;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, video_title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      console.error('  Error fetching page', page, ':', error);
      break;
    }

    if (data && data.length > 0) {
      console.log(`  Page ${page}: ${data.length} reviews`);
      allReviews = allReviews.concat(data);
      page++;
      hasMore = data.length === pageSize;
    } else {
      hasMore = false;
    }
  }

  console.log('  Total fetched:', allReviews.length);

  // Compare results
  console.log('\n📊 COMPARISON:');
  console.log(`  SQL COUNT: ${sqlCount}`);
  console.log(`  select('*'): ${allData?.length}`);
  console.log(`  select(specific): ${specificData?.length}`);
  console.log(`  Batched fetch: ${allReviews.length}`);

  // Find the missing review(s)
  if (allReviews.length < sqlCount) {
    console.log('\n❌ MISSING REVIEWS DETECTED!');
    console.log(`  Missing: ${sqlCount - allReviews.length} review(s)`);

    // Get all IDs from database directly
    const { data: allIds } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', userId);

    const fetchedIds = new Set(allReviews.map(r => r.id));
    const missingIds = allIds.filter(r => !fetchedIds.has(r.id));

    if (missingIds.length > 0) {
      console.log('\n  Missing review IDs:', missingIds.map(r => r.id));

      // Get details of missing reviews
      for (const { id } of missingIds) {
        const { data: review } = await supabase
          .from('reviews')
          .select('*')
          .eq('id', id)
          .single();

        console.log('\n  Missing review details:');
        console.log('    ID:', review.id);
        console.log('    Title:', review.video_title);
        console.log('    Status:', review.status);
        console.log('    Category ID:', review.category_id);
        console.log('    Created:', review.created_at);
        console.log('    Has null fields:', Object.entries(review).filter(([k, v]) => v === null).map(([k]) => k));
      }
    }
  } else {
    console.log('\n✅ No missing reviews detected');
  }
}

testMissingReview().catch(console.error);
