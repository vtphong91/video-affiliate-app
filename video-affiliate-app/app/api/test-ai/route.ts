import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const result = await model.generateContent('Say "Hello World" in Vietnamese');
    const text = result.response.text();

    return NextResponse.json({ 
      success: true,
      model: 'gemini-2.0-flash',
      response: text
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message
    }, { status: 500 });
  }
}
