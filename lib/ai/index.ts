import type { VideoInfo, AIAnalysis } from '@/types';
import { analyzeVideoWithOpenAI, analyzeVideoWithGPT35, generateContentWithOpenAI } from './openai';
import { analyzeVideoWithClaude, analyzeVideoWithClaudeHaiku, generateContentWithClaude } from './claude';
import { analyzeVideoWithGemini, analyzeVideoWithGeminiPro, generateContentWithGemini } from './gemini';
import { analyzeVideoWithGroq, analyzeVideoWithGroqMixtral, generateContentWithGroq } from './groq';
import { analyzeVideoWithMistral, analyzeVideoWithMistralSmall, generateContentWithMistral } from './mistral';
import { db } from '@/lib/db/supabase';
import {
  replacePromptVariables,
  mergeTemplateVariables,
} from '@/lib/templates/template-helpers';
import { removeUrlsFromContent } from '@/lib/utils/content-helpers';

type AIProvider =
  | 'gemini'          // FREE: 1500 req/day ⭐ RECOMMENDED
  | 'gemini-pro'      // FREE: 50 req/day
  | 'groq'            // FREE: Generous limits, 300-800 tokens/sec ⚡ SUPER FAST
  | 'groq-mixtral'    // FREE: Ultra fast
  | 'mistral'         // CHEAP: ~$2/1M tokens 💰 COST-EFFECTIVE
  | 'mistral-small'   // CHEAP: Very cheap
  | 'openai'          // PAID: $10/1M tokens
  | 'openai-gpt35'    // PAID: Lower quality
  | 'claude'          // PAID: $3/1M tokens
  | 'claude-haiku';   // PAID: $0.25/1M tokens

/**
 * Main function to analyze video using configured AI provider
 * Priority: GOOGLE_AI_API_KEY > OPENAI_API_KEY > ANTHROPIC_API_KEY
 *
 * Recommended: Use Gemini (FREE 1500 requests/day)
 *
 * Features automatic fallback when primary provider fails
 */
export async function analyzeVideo(
  videoInfo: VideoInfo,
  provider?: AIProvider
): Promise<AIAnalysis> {
  console.log('🎯 analyzeVideo - FUNCTION CALLED with:', {
    title: videoInfo.title?.substring(0, 50),
    platform: videoInfo.platform,
    videoId: videoInfo.videoId,
    hasTranscript: !!videoInfo.transcript,
    requestedProvider: provider
  });

  // Build list of available providers in priority order
  // Priority: FREE (Gemini, Groq) > CHEAP (Mistral) > PAID (OpenAI, Claude)
  const availableProviders: AIProvider[] = [];
  if (process.env.GOOGLE_AI_API_KEY) availableProviders.push('gemini');
  if (process.env.GROQ_API_KEY) availableProviders.push('groq');
  if (process.env.MISTRAL_API_KEY) availableProviders.push('mistral');
  if (process.env.OPENAI_API_KEY) availableProviders.push('openai');
  if (process.env.ANTHROPIC_API_KEY) availableProviders.push('claude');

  if (availableProviders.length === 0) {
    console.error('🎯 analyzeVideo - ERROR: No API key configured');
    throw new Error(
      'No AI API key configured. Please set GOOGLE_AI_API_KEY (free), OPENAI_API_KEY, or ANTHROPIC_API_KEY'
    );
  }

  // If provider specified, try it first, then fallback to others
  const providersToTry = provider
    ? [provider, ...availableProviders.filter(p => p !== provider)]
    : availableProviders;

  console.log('🎯 analyzeVideo - Providers to try (in order):', providersToTry);

  let lastError: Error | null = null;

  // Try each provider in order until one succeeds
  for (const currentProvider of providersToTry) {
    try {
      console.log(`🎯 analyzeVideo - Trying provider: ${currentProvider}`);

      let result: AIAnalysis;

      switch (currentProvider) {
        case 'gemini':
          result = await analyzeVideoWithGemini(videoInfo);
          break;
        case 'gemini-pro':
          result = await analyzeVideoWithGeminiPro(videoInfo);
          break;
        case 'groq':
          result = await analyzeVideoWithGroq(videoInfo);
          break;
        case 'groq-mixtral':
          result = await analyzeVideoWithGroqMixtral(videoInfo);
          break;
        case 'mistral':
          result = await analyzeVideoWithMistral(videoInfo);
          break;
        case 'mistral-small':
          result = await analyzeVideoWithMistralSmall(videoInfo);
          break;
        case 'openai':
          result = await analyzeVideoWithOpenAI(videoInfo);
          break;
        case 'openai-gpt35':
          result = await analyzeVideoWithGPT35(videoInfo);
          break;
        case 'claude':
          result = await analyzeVideoWithClaude(videoInfo);
          break;
        case 'claude-haiku':
          result = await analyzeVideoWithClaudeHaiku(videoInfo);
          break;
        default:
          throw new Error(`Unknown AI provider: ${currentProvider}`);
      }

      console.log(`✅ analyzeVideo - Success with provider: ${currentProvider}`);
      return result;

    } catch (error) {
      lastError = error as Error;
      console.error(`❌ analyzeVideo - Provider ${currentProvider} failed:`, lastError.message);

      // Continue to next provider
      if (providersToTry.indexOf(currentProvider) < providersToTry.length - 1) {
        console.log(`🔄 analyzeVideo - Trying next provider...`);
      }
    }
  }

  // All providers failed
  console.error('❌ analyzeVideo - All providers failed');
  throw new Error(
    `All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

export * from './openai';
export * from './claude';
export * from './gemini';
export * from './groq';
export * from './mistral';
export * from './prompts';

/**
 * Generate review content using a template
 *
 * @param videoInfo - Video information
 * @param templateId - Template ID to use
 * @param customVariables - Custom variables to fill in template
 * @param aiAnalysis - AI analysis (nếu có, dùng thay vì transcript)
 * @param provider - AI provider (auto-detect if not specified)
 * @returns Generated review content
 */
export async function generateReviewWithTemplate(
  videoInfo: VideoInfo,
  templateId: string,
  customVariables: Record<string, string> = {},
  aiAnalysis?: AIAnalysis,
  provider?: AIProvider
): Promise<string> {
  console.log('🎨 Generating review with template:', {
    templateId,
    videoTitle: videoInfo.title,
    hasAIAnalysis: !!aiAnalysis,
    provider: provider || 'auto',
  });

  // Get template
  const template = await db.getTemplate(templateId);

  if (!template) {
    throw new Error('Template not found');
  }

  // Merge video data with custom variables
  // ✅ Remove URLs from description to keep custom_content clean
  const cleanDescription = removeUrlsFromContent(videoInfo.description || '');

  // Nếu có AI analysis, tạo transcript từ đó
  const transcript = aiAnalysis
    ? [
        aiAnalysis.summary,
        '',
        '**Ưu điểm:**',
        ...aiAnalysis.pros.map((p, i) => `${i + 1}. ${p}`),
        '',
        '**Nhược điểm:**',
        ...aiAnalysis.cons.map((c, i) => `${i + 1}. ${c}`),
        '',
        '**Điểm nổi bật:**',
        ...aiAnalysis.keyPoints.map(kp => `- [${kp.time}] ${kp.content}`)
      ].join('\n')
    : videoInfo.transcript;

  const allVariables = mergeTemplateVariables(
    {
      title: videoInfo.title,
      description: cleanDescription, // ✅ Use cleaned description without URLs
      transcript,
      channelName: videoInfo.channelName,
    },
    customVariables
  );

  console.log('📊 Variables for template:', {
    hasTitle: !!allVariables.title,
    hasDescription: !!allVariables.description,
    transcriptLength: allVariables.transcript?.length || 0,
    customVarsCount: Object.keys(customVariables).length
  });

  // Replace variables in template
  const finalPrompt = replacePromptVariables(
    template.prompt_template,
    allVariables
  );

  console.log('📝 Final prompt length:', finalPrompt.length, 'characters');

  // Auto-detect provider if not specified
  if (!provider) {
    if (process.env.GOOGLE_AI_API_KEY) {
      provider = 'gemini'; // FREE & RECOMMENDED
    } else if (process.env.GROQ_API_KEY) {
      provider = 'groq'; // FREE & SUPER FAST
    } else if (process.env.MISTRAL_API_KEY) {
      provider = 'mistral'; // CHEAP
    } else if (process.env.OPENAI_API_KEY) {
      provider = 'openai';
    } else if (process.env.ANTHROPIC_API_KEY) {
      provider = 'claude';
    } else {
      throw new Error(
        'No AI API key configured. Please set GOOGLE_AI_API_KEY (free), GROQ_API_KEY (free), MISTRAL_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY'
      );
    }
  }

  // Generate content using AI
  let generatedContent: string;

  switch (provider) {
    case 'gemini':
    case 'gemini-pro':
      generatedContent = await generateContentWithGemini(finalPrompt);
      break;
    case 'groq':
    case 'groq-mixtral':
      generatedContent = await generateContentWithGroq(finalPrompt);
      break;
    case 'mistral':
    case 'mistral-small':
      generatedContent = await generateContentWithMistral(finalPrompt);
      break;
    case 'openai':
    case 'openai-gpt35':
      generatedContent = await generateContentWithOpenAI(finalPrompt);
      break;
    case 'claude':
    case 'claude-haiku':
      generatedContent = await generateContentWithClaude(finalPrompt);
      break;
    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }

  console.log('✅ Generated content length:', generatedContent.length, 'characters');

  // Increment template usage count (non-blocking)
  db.incrementTemplateUsage(templateId).catch((err) =>
    console.error('⚠️ Failed to increment template usage:', err)
  );

  return generatedContent;
}
