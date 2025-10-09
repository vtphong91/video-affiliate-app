import type { VideoInfo, AIAnalysis } from '@/types';
import { analyzeVideoWithOpenAI, analyzeVideoWithGPT35 } from './openai';
import { analyzeVideoWithClaude, analyzeVideoWithClaudeHaiku } from './claude';
import { analyzeVideoWithGemini, analyzeVideoWithGeminiPro } from './gemini';

type AIProvider =
  | 'gemini'        // FREE: 1500 req/day ⭐ RECOMMENDED
  | 'gemini-pro'    // FREE: 50 req/day
  | 'openai'        // PAID: $0.0012/req
  | 'openai-gpt35'  // PAID: $0.004/req
  | 'claude'        // PAID: $0.004/req
  | 'claude-haiku'; // PAID: $0.0015/req

/**
 * Main function to analyze video using configured AI provider
 * Priority: GOOGLE_AI_API_KEY > OPENAI_API_KEY > ANTHROPIC_API_KEY
 *
 * Recommended: Use Gemini (FREE 1500 requests/day)
 */
export async function analyzeVideo(
  videoInfo: VideoInfo,
  provider?: AIProvider
): Promise<AIAnalysis> {
  // Auto-detect provider if not specified
  if (!provider) {
    if (process.env.GOOGLE_AI_API_KEY) {
      provider = 'gemini'; // FREE & RECOMMENDED
    } else if (process.env.OPENAI_API_KEY) {
      provider = 'openai';
    } else if (process.env.ANTHROPIC_API_KEY) {
      provider = 'claude';
    } else {
      throw new Error(
        'No AI API key configured. Please set GOOGLE_AI_API_KEY (free), OPENAI_API_KEY, or ANTHROPIC_API_KEY'
      );
    }
  }

  switch (provider) {
    case 'gemini':
      return analyzeVideoWithGemini(videoInfo);
    case 'gemini-pro':
      return analyzeVideoWithGeminiPro(videoInfo);
    case 'openai':
      return analyzeVideoWithOpenAI(videoInfo);
    case 'openai-gpt35':
      return analyzeVideoWithGPT35(videoInfo);
    case 'claude':
      return analyzeVideoWithClaude(videoInfo);
    case 'claude-haiku':
      return analyzeVideoWithClaudeHaiku(videoInfo);
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}

export * from './openai';
export * from './claude';
export * from './gemini';
export * from './prompts';
