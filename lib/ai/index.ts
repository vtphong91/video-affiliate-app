import type { VideoInfo, AIAnalysis } from '@/types';
import { analyzeVideoWithOpenAI, analyzeVideoWithGPT35, generateContentWithOpenAI } from './openai';
import { analyzeVideoWithClaude, analyzeVideoWithClaudeHaiku, generateContentWithClaude } from './claude';
import { analyzeVideoWithGemini, analyzeVideoWithGeminiPro, generateContentWithGemini } from './gemini';
import { db } from '@/lib/db/supabase';
import {
  replacePromptVariables,
  mergeTemplateVariables,
} from '@/lib/templates/template-helpers';
import { removeUrlsFromContent } from '@/lib/utils/content-helpers';

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

  // Generate content using AI
  let generatedContent: string;

  switch (provider) {
    case 'gemini':
    case 'gemini-pro':
      generatedContent = await generateContentWithGemini(finalPrompt);
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
