// Test API endpoints để xem response
async function testAPI() {
  const baseUrl = 'http://localhost:3002';
  const userId = '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1';

  console.log('\n🧪 TEST 1: GET /api/reviews (ALL, no status filter)\n');
  try {
    const res1 = await fetch(`${baseUrl}/api/reviews?page=1&limit=100&t=${Date.now()}`, {
      headers: { 'x-user-id': userId },
      cache: 'no-store'
    });
    const data1 = await res1.json();
    console.log(`   Success: ${data1.success}`);
    console.log(`   Total: ${data1.data?.total}`);
    console.log(`   Reviews returned: ${data1.data?.reviews?.length}`);

    if (data1.data?.reviews) {
      const draftCount = data1.data.reviews.filter(r => r.status === 'draft').length;
      const publishedCount = data1.data.reviews.filter(r => r.status === 'published').length;
      console.log(`   Draft: ${draftCount}, Published: ${publishedCount}`);
      console.log(`   First 3:`);
      data1.data.reviews.slice(0, 3).forEach((r, i) => {
        console.log(`      ${i + 1}. ${r.id.substring(0, 8)}... - ${r.status} - ${r.video_title?.substring(0, 40)}`);
      });
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }

  console.log('\n🧪 TEST 2: GET /api/reviews?status=draft\n');
  try {
    const res2 = await fetch(`${baseUrl}/api/reviews?page=1&limit=100&status=draft&t=${Date.now()}`, {
      headers: { 'x-user-id': userId },
      cache: 'no-store'
    });
    const data2 = await res2.json();
    console.log(`   Success: ${data2.success}`);
    console.log(`   Total: ${data2.data?.total}`);
    console.log(`   Reviews returned: ${data2.data?.reviews?.length}`);

    if (data2.data?.reviews) {
      data2.data.reviews.forEach((r, i) => {
        console.log(`      ${i + 1}. ${r.id.substring(0, 8)}... - ${r.status} - ${r.video_title?.substring(0, 40)}`);
      });
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }

  console.log('\n🧪 TEST 3: GET /api/reviews?status=published\n');
  try {
    const res3 = await fetch(`${baseUrl}/api/reviews?page=1&limit=100&status=published&t=${Date.now()}`, {
      headers: { 'x-user-id': userId },
      cache: 'no-store'
    });
    const data3 = await res3.json();
    console.log(`   Success: ${data3.success}`);
    console.log(`   Total: ${data3.data?.total}`);
    console.log(`   Reviews returned: ${data3.data?.reviews?.length}`);

    if (data3.data?.reviews) {
      console.log(`   First 3:`);
      data3.data.reviews.slice(0, 3).forEach((r, i) => {
        console.log(`      ${i + 1}. ${r.id.substring(0, 8)}... - ${r.status} - ${r.video_title?.substring(0, 40)}`);
      });
    }
  } catch (error) {
    console.error('   ❌ Error:', error.message);
  }
}

testAPI().catch(console.error);
