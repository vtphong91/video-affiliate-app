const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GOOGLE_AI_API_KEY;
console.log('Testing Gemini API...');
console.log('API Key exists:', apiKey ? 'YES' : 'NO');

const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
  try {
    console.log('Testing gemini-pro...');
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent('Say hello');
    console.log('SUCCESS gemini-pro');
  } catch (error) {
    console.log('FAILED gemini-pro:', error.message);
  }

  try {
    console.log('Testing gemini-1.5-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello');
    console.log('SUCCESS gemini-1.5-flash');
  } catch (error) {
    console.log('FAILED gemini-1.5-flash:', error.message);
  }
}

testGemini();
