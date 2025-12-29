// Test API /api/reviews trực tiếp
require('dotenv').config({ path: '.env.local' });

async function testAPI() {
  const url = 'http://localhost:3000/api/reviews?page=1&limit=50&t=' + Date.now();

  console.log('\n🔍 Calling API:', url, '\n');

  try {
    const response = await fetch(url, {
      headers: {
        'Cookie': 'sb-access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        'x-user-id': '1788ee95-7d22-4b0b-8e45-07ae2d03c7e1'
      },
      cache: 'no-store'
    });

    const data = await response.json();

    console.log('📊 API Response:');
    console.log('   Success:', data.success);
    console.log('   Total:', data.data?.total);
    console.log('   Reviews count:', data.data?.reviews?.length);

    if (data.data?.reviews) {
      const draftCount = data.data.reviews.filter(r => r.status === 'draft').length;
      const publishedCount = data.data.reviews.filter(r => r.status === 'published').length;

      console.log('\n📋 Status breakdown from API:');
      console.log('   Draft:', draftCount);
      console.log('   Published:', publishedCount);

      if (draftCount > 0) {
        console.log('\n⚠️  DRAFT REVIEWS in API response:');
        data.data.reviews.filter(r => r.status === 'draft').forEach((r, i) => {
          console.log(`   ${i + 1}. ${r.video_title?.substring(0, 60)}`);
          console.log(`      ID: ${r.id}`);
          console.log(`      Status: ${r.status}\n`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
