import OpenAI from 'openai';
import type { VideoInfo, AIAnalysis } from '@/types';
import { generateAnalysisPrompt, SYSTEM_PROMPT } from './prompts';

// Lazy initialize to avoid errors when OPENAI_API_KEY is not set
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export async function analyzeVideoWithOpenAI(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  try {
    const prompt = generateAnalysisPrompt(videoInfo);
    const client = getOpenAI();

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    const analysis = JSON.parse(content) as AIAnalysis;

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
    console.error('Error analyzing video with OpenAI:', error);
    throw new Error('Failed to analyze video content');
  }
}

// Alternative: Use GPT-3.5-turbo for cost savings
export async function analyzeVideoWithGPT35(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  try {
    const prompt = generateAnalysisPrompt(videoInfo);
    const client = getOpenAI();

    const completion = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // GPT-3.5 might not always return perfect JSON, so we need to extract it
    let jsonContent = content;
    if (content.includes('```json')) {
      const match = content.match(/```json\n([\s\S]*?)\n```/);
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
    console.error('Error analyzing video with GPT-3.5:', error);
    throw new Error('Failed to analyze video content');
  }
}
