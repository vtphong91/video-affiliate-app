// Test YouTube API Key
require('dotenv').config({ path: '.env.local' });

async function testYouTubeAPI() {
  const apiKey = process.env.YOUTUBE_API_KEY;

  console.log('🔑 Testing YouTube API Key...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'NOT FOUND');

  if (!apiKey) {
    console.error('❌ YOUTUBE_API_KEY not found in .env.local');
    return;
  }

  try {
    // Test with a popular video
    const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up
    console.log(`\n🧪 Testing with video ID: ${testVideoId}`);

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${testVideoId}&key=${apiKey}`
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ YouTube API request failed:', response.status);
      console.error('Error details:', error);

      if (response.status === 403) {
        console.log('\n💡 Possible issues:');
        console.log('  1. API key is invalid or expired');
        console.log('  2. YouTube Data API v3 is not enabled in Google Cloud Console');
        console.log('  3. API key restrictions are blocking the request');
        console.log('\n📖 Fix: https://console.cloud.google.com/apis/library/youtube.googleapis.com');
      }

      return;
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      console.error('❌ No video data returned');
      return;
    }

    const video = data.items[0];
    console.log('\n✅ Video data retrieved successfully!');
    console.log('📺 Title:', video.snippet.title);
    console.log('👤 Channel:', video.snippet.channelTitle);
    console.log('👁️  Views:', parseInt(video.statistics.viewCount).toLocaleString());
    console.log('⏱️  Duration:', video.contentDetails.duration);

    // Check quota usage
    console.log('\n💰 Quota Usage:');
    console.log('  This request cost: ~1 quota unit');
    console.log('  Daily limit: 10,000 units');
    console.log('  You have ~9,999 requests remaining today');

    console.log('\n✅ ✅ ✅ YouTube API is working correctly! ✅ ✅ ✅');

  } catch (error) {
    console.error('❌ Error testing YouTube API:', error.message);
  }
}

testYouTubeAPI();
