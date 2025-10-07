import Anthropic from '@anthropic-ai/sdk';
import type { VideoInfo, AIAnalysis } from '@/types';
import { generateAnalysisPrompt, SYSTEM_PROMPT } from './prompts';

// Lazy initialize to avoid errors when ANTHROPIC_API_KEY is not set
let anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

export async function analyzeVideoWithClaude(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  try {
    const prompt = generateAnalysisPrompt(videoInfo);
    const client = getAnthropic();

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Invalid response type from Claude');
    }

    let jsonContent = content.text;

    // Claude might wrap JSON in markdown code blocks
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
    console.error('Error analyzing video with Claude:', error);
    throw new Error('Failed to analyze video content');
  }
}

// Use Claude Haiku for faster/cheaper analysis
export async function analyzeVideoWithClaudeHaiku(
  videoInfo: VideoInfo
): Promise<AIAnalysis> {
  try {
    const prompt = generateAnalysisPrompt(videoInfo);
    const client = getAnthropic();

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2000,
      temperature: 0.7,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Invalid response type from Claude');
    }

    let jsonContent = content.text;

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
    console.error('Error analyzing video with Claude Haiku:', error);
    throw new Error('Failed to analyze video content');
  }
}
