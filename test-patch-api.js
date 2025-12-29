// Test PATCH API directly
const reviewId = 'e66ffc01-5763-4b27-874e-093f5851d697';

async function testPatch() {
  console.log('\n🔍 Testing PATCH /api/reviews/${reviewId}...\n');

  const response = await fetch(`http://localhost:3000/api/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      // Need to add auth header - get from browser
      'Cookie': 'sb-access-token=YOUR_TOKEN_HERE'
    },
    body: JSON.stringify({
      status: 'published'
    })
  });

  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);

  const data = await response.json();
  console.log('\nResponse:');
  console.log(JSON.stringify(data, null, 2));

  if (data.success) {
    console.log('\n✅ Update successful!');
    console.log('New status:', data.review?.status);
  } else {
    console.log('\n❌ Update failed!');
    console.log('Error:', data.error);
  }
}

testPatch().catch(console.error);
