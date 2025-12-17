/**
 * Test script to verify product name extraction from YouTube video
 * Video: https://www.youtube.com/watch?v=f4HJXmD-nMI
 * Expected product: Lock&Lock EJJ231 (NOT LocknLock EJM311)
 */

const videoUrl = 'https://www.youtube.com/watch?v=f4HJXmD-nMI';

async function testProductExtraction() {
  console.log('🧪 Testing Product Extraction Fix');
  console.log('=' .repeat(60));
  console.log('Video URL:', videoUrl);
  console.log('Expected Product: Lock&Lock EJJ231');
  console.log('Previous Wrong Output: LocknLock EJM311');
  console.log('=' .repeat(60));
  console.log('');

  try {
    console.log('📡 Calling /api/analyze-video endpoint...');

    const response = await fetch('http://localhost:3001/api/analyze-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    console.log('✅ API Response received');
    console.log('');

    // Extract video info
    console.log('📺 Video Info:');
    console.log('  Title:', data.videoInfo?.title);
    console.log('  Description (first 100 chars):', data.videoInfo?.description?.substring(0, 100));
    console.log('');

    // Extract product name from comparison table
    const comparisonTable = data.analysis?.comparisonTable;
    if (comparisonTable && comparisonTable.headers) {
      const productName = comparisonTable.headers[1]; // Second column is product name

      console.log('🔍 Comparison Table Analysis:');
      console.log('  Headers:', comparisonTable.headers);
      console.log('  Extracted Product Name:', productName);
      console.log('');

      // Validation
      console.log('✅ Validation Results:');

      // Check if product name contains Lock&Lock or EJJ231
      const hasLockLock = productName?.toLowerCase().includes('lock&lock') ||
                          productName?.toLowerCase().includes('lock lock') ||
                          productName?.toLowerCase().includes('locknlock');
      const hasCorrectModel = productName?.includes('EJJ231');
      const hasWrongModel = productName?.includes('EJM311');

      console.log(`  Contains Lock&Lock brand: ${hasLockLock ? '✅ YES' : '❌ NO'}`);
      console.log(`  Contains correct model EJJ231: ${hasCorrectModel ? '✅ YES' : '❌ NO'}`);
      console.log(`  Contains wrong model EJM311: ${hasWrongModel ? '❌ FOUND (BAD!)' : '✅ NOT FOUND (GOOD!)'}`);
      console.log('');

      if (hasCorrectModel && !hasWrongModel) {
        console.log('🎉 SUCCESS! Product name extracted correctly!');
      } else if (hasWrongModel) {
        console.log('❌ FAILED! AI still using wrong product model (EJM311)');
        console.log('   This means the prompt fix did not work as expected.');
      } else if (!hasCorrectModel && !hasWrongModel) {
        console.log('⚠️  WARNING! Product model not detected in output.');
        console.log('   Extracted product name:', productName);
      }
    } else {
      console.log('❌ ERROR: No comparison table found in analysis');
    }

    console.log('');
    console.log('📋 Full Analysis Summary:');
    console.log('  Summary:', data.analysis?.summary?.substring(0, 100) + '...');
    console.log('  Pros count:', data.analysis?.pros?.length);
    console.log('  Cons count:', data.analysis?.cons?.length);
    console.log('  Comparison table rows:', comparisonTable?.rows?.length);

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error('');
    console.error('Make sure:');
    console.error('  1. Dev server is running: npm run dev');
    console.error('  2. Server is on port 3001 (or update script)');
    console.error('  3. GOOGLE_AI_API_KEY is configured in .env.local');
    console.error('  4. YOUTUBE_API_KEY is configured in .env.local');
  }
}

// Run test
testProductExtraction();
