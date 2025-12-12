// Test Gemini API Key
require('dotenv').config({ path: '.env.local' });

async function testGeminiAPI() {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  console.log('🔑 Testing Gemini API Key...');
  console.log('API Key:', apiKey ? `${apiKey.substring(0, 15)}...` : 'NOT FOUND');

  if (!apiKey) {
    console.error('❌ GOOGLE_AI_API_KEY not found in .env.local');
    return;
  }

  try {
    // Test 1: List available models
    console.log('\n📋 Test 1: Fetching available models...');
    const modelsResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );

    if (!modelsResponse.ok) {
      const error = await modelsResponse.text();
      console.error('❌ Failed to fetch models:', modelsResponse.status, error);
      return;
    }

    const modelsData = await modelsResponse.json();
    console.log('✅ Available models:');

    const geminiModels = modelsData.models
      .filter(m => m.name.includes('gemini'))
      .map(m => {
        const name = m.name.replace('models/', '');
        return { name, supportedMethods: m.supportedGenerationMethods };
      });

    console.table(geminiModels);

    // Find the best model
    const flashModels = geminiModels.filter(m =>
      m.name.includes('flash') &&
      m.supportedMethods.includes('generateContent')
    );

    const recommendedModel =
      flashModels.find(m => m.name === 'gemini-2.5-flash') ||
      flashModels.find(m => m.name === 'gemini-2.0-flash-exp') ||
      flashModels.find(m => m.name === 'gemini-1.5-flash') ||
      flashModels[0];

    console.log('\n⭐ Recommended model:', recommendedModel?.name || 'NONE FOUND');

    // Test 2: Simple generation test
    console.log('\n🧪 Test 2: Testing content generation...');
    const testModel = recommendedModel?.name || 'gemini-1.5-flash';

    const generateResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${testModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Say "Hello from Gemini API!" in JSON format with a "message" field.' }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!generateResponse.ok) {
      const error = await generateResponse.text();
      console.error('❌ Generation failed:', generateResponse.status, error);
      return;
    }

    const generateData = await generateResponse.json();
    const generatedText = generateData.candidates[0].content.parts[0].text;
    console.log('✅ Generated response:', generatedText);

    console.log('\n✅ ✅ ✅ Gemini API is working correctly! ✅ ✅ ✅');
    console.log(`\n💡 Use this model in your code: "${testModel}"`);

  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message);
  }
}

testGeminiAPI();
