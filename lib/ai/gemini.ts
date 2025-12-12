import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VideoInfo, AIAnalysis } from '@/types';
import { generateAnalysisPrompt, SYSTEM_PROMPT } from './prompts';

console.log('🔧 Gemini Module - Initializing...');
console.log('🔧 Gemini Module - API Key exists:', !!process.env.GOOGLE_AI_API_KEY);
console.log('🔧 Gemini Module - API Key length:', process.env.GOOGLE_AI_API_KEY?.length || 0);

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
console.log('🔧 Gemini Module - GoogleGenerativeAI instance created');

export async function analyzeVideoWithGemini(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  console.log('🤖 Gemini - FUNCTION CALLED - Starting analysis');
  console.log('🤖 Gemini - Video info received:', {
    title: videoInfo.title?.substring(0, 50),
    videoId: videoInfo.videoId,
    platform: videoInfo.platform,
    hasTranscript: !!videoInfo.transcript,
    transcriptLength: videoInfo.transcript?.length
  });

  try {
    console.log('🤖 Gemini - Entering try block');
    console.log('🤖 Gemini - Starting analysis for:', videoInfo.title);
    console.log('🤖 Gemini - Video ID:', videoInfo.videoId);
    console.log('🤖 Gemini - Has transcript:', !!videoInfo.transcript);

    const prompt = generateAnalysisPrompt(videoInfo);
    console.log('🤖 Gemini - Prompt length:', prompt.length);

    // Use Gemini 2.5 Flash (latest stable model)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8000, // Increased from 2000 to prevent truncated JSON
        responseMimeType: 'application/json', // Force JSON response
      },
    });

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;
    console.log('🤖 Gemini - Sending request to Gemini API...');

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    console.log('🤖 Gemini - Received response from Gemini');

    const text = response.text();
    console.log('🤖 Gemini - Response text length:', text?.length || 0);

    if (!text) {
      throw new Error('No content received from Gemini');
    }

    // Gemini might wrap JSON in markdown code blocks
    let jsonContent = text.trim();

    console.log('🤖 Gemini - Raw response preview:', jsonContent.substring(0, 200));

    // Try to extract JSON from markdown code blocks
    if (jsonContent.includes('```')) {
      // Try different markdown patterns
      const patterns = [
        /```json\s*([\s\S]*?)\s*```/,  // ```json ... ```
        /```\s*([\s\S]*?)\s*```/,       // ``` ... ```
      ];

      for (const pattern of patterns) {
        const match = jsonContent.match(pattern);
        if (match && match[1]) {
          jsonContent = match[1].trim();
          console.log('🤖 Gemini - Extracted from markdown, preview:', jsonContent.substring(0, 200));
          break;
        }
      }
    }

    console.log('🤖 Gemini - Attempting to parse JSON...');
    let analysis: AIAnalysis;

    try {
      analysis = JSON.parse(jsonContent) as AIAnalysis;
    } catch (parseError) {
      console.error('❌ Gemini - JSON parse failed:', parseError);
      console.error('❌ Gemini - Failed content:', jsonContent.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate required fields
    if (
      !analysis.summary ||
      !analysis.pros ||
      !analysis.cons ||
      !analysis.cta
    ) {
      throw new Error('Invalid analysis format from AI');
    }

    console.log('✅ Gemini - Analysis completed successfully');
    return analysis;
  } catch (error) {
    console.error('❌ Gemini - Error analyzing video:', error);
    if (error instanceof Error) {
      console.error('❌ Gemini - Error message:', error.message);
      console.error('❌ Gemini - Error stack:', error.stack);
    }
    throw error instanceof Error ? error : new Error('Failed to analyze video content');
  }
}

// Use Gemini 1.5 Pro for better quality (if available)
export async function analyzeVideoWithGeminiPro(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  try {
    const prompt = generateAnalysisPrompt(videoInfo);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json', // Force JSON response
      },
    });

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No content received from Gemini Pro');
    }

    let jsonContent = text.trim();

    // Try to extract JSON from markdown code blocks
    if (jsonContent.includes('```')) {
      const patterns = [
        /```json\s*([\s\S]*?)\s*```/,
        /```\s*([\s\S]*?)\s*```/,
      ];

      for (const pattern of patterns) {
        const match = jsonContent.match(pattern);
        if (match && match[1]) {
          jsonContent = match[1].trim();
          break;
        }
      }
    }

    let analysis: AIAnalysis;
    try {
      analysis = JSON.parse(jsonContent) as AIAnalysis;
    } catch (parseError) {
      console.error('❌ Gemini Pro - JSON parse failed:', parseError);
      console.error('❌ Gemini Pro - Failed content:', jsonContent.substring(0, 500));
      throw new Error('Failed to parse AI response as JSON');
    }

    if (
      !analysis.summary ||
      !analysis.pros ||
      !analysis.cons ||
      !analysis.cta
    ) {
      throw new Error('Invalid analysis format from AI');
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing video with Gemini Pro:', error);
    throw new Error('Failed to analyze video content');
  }
}

/**
 * Generate content with custom prompt using Gemini
 * Used for template-based review generation
 */
export async function generateContentWithGemini(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      },
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No content received from Gemini');
    }

    return text.trim();
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    throw new Error('Failed to generate content with Gemini');
  }
}
