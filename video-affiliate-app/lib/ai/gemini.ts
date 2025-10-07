import { GoogleGenerativeAI } from '@google/generative-ai';
import type { VideoInfo, AIAnalysis } from '@/types';
import { generateAnalysisPrompt, SYSTEM_PROMPT } from './prompts';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export async function analyzeVideoWithGemini(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  try {
    const prompt = generateAnalysisPrompt(videoInfo);

    // Use Gemini Pro (stable model)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No content received from Gemini');
    }

    // Gemini might wrap JSON in markdown code blocks
    let jsonContent = text;

    if (jsonContent.includes('```json')) {
      const match = jsonContent.match(/```json\n([\s\S]*?)\n```/);
      if (match) {
        jsonContent = match[1];
      }
    } else if (jsonContent.includes('```')) {
      const match = jsonContent.match(/```\n([\s\S]*?)\n```/);
      if (match) {
        jsonContent = match[1];
      }
    }

    const analysis = JSON.parse(jsonContent) as AIAnalysis;

    // Validate required fields
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
    console.error('Error analyzing video with Gemini:', error);
    throw new Error('Failed to analyze video content');
  }
}

// Use Gemini 1.5 Pro for better quality (if available)
export async function analyzeVideoWithGeminiPro(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  try {
    const prompt = generateAnalysisPrompt(videoInfo);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      },
    });

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No content received from Gemini Pro');
    }

    let jsonContent = text;

    if (jsonContent.includes('```json')) {
      const match = jsonContent.match(/```json\n([\s\S]*?)\n```/);
      if (match) {
        jsonContent = match[1];
      }
    } else if (jsonContent.includes('```')) {
      const match = jsonContent.match(/```\n([\s\S]*?)\n```/);
      if (match) {
        jsonContent = match[1];
      }
    }

    const analysis = JSON.parse(jsonContent) as AIAnalysis;

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
