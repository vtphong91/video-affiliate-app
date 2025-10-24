// ============================================
// PROMPT TEMPLATE UTILITIES
// Helper functions for template operations
// ============================================

import { PromptTemplate, PromptPlatform } from '@/types';

/**
 * Replace variables in prompt template
 * Example: {{product_name}} => iPhone 15 Pro
 */
export function replacePromptVariables(
  promptTemplate: string,
  variables: Record<string, string>
): string {
  let result = promptTemplate;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || `[${key}]`);
  }

  return result;
}

/**
 * Estimate tokens for text (rough estimation)
 * 1 token ≈ 3 characters for Vietnamese
 * 1 token ≈ 4 characters for English
 */
export function estimateTokens(text: string): number {
  const avgCharsPerToken = 3;
  return Math.ceil(text.length / avgCharsPerToken);
}

/**
 * Get recommended template based on video content
 */
export function getRecommendedTemplate(
  videoTitle: string,
  videoDescription: string,
  platform: PromptPlatform,
  templates: PromptTemplate[]
): {
  recommended: PromptTemplate | null;
  confidence: number;
  alternatives: PromptTemplate[];
} {
  const content = `${videoTitle} ${videoDescription}`.toLowerCase();

  // Keywords for different categories
  const categoryKeywords = {
    tech: ['iphone', 'samsung', 'laptop', 'phone', 'tech', 'review', 'unboxing', 'smartphone', 'macbook', 'android', 'ios', 'tablet', 'pc', 'gaming'],
    beauty: ['skincare', 'makeup', 'beauty', 'cosmetic', 'serum', 'toner', 'moisturizer', 'foundation', 'lipstick', 'mascara', 'cleanser'],
    food: ['food', 'restaurant', 'recipe', 'cooking', 'món', 'quán', 'ăn', 'cafe', 'đồ ăn', 'món ngon'],
    travel: ['travel', 'tour', 'hotel', 'destination', 'du lịch', 'khách sạn', 'resort', 'beach', 'mountain'],
    general: [],
  };

  // Calculate scores for each category
  const scores: Record<string, number> = {
    tech: 0,
    beauty: 0,
    food: 0,
    travel: 0,
    general: 0,
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        scores[category] += 1;
      }
    }
  }

  // Find best matching category
  const bestCategory = Object.entries(scores).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];

  // Filter templates by platform and category
  const matchingTemplates = templates.filter(
    (t) => t.platform === platform && t.is_active
  );

  const categoryMatches = matchingTemplates.filter(
    (t) => t.category === bestCategory
  );

  // Calculate confidence
  const totalKeywords = Object.values(categoryKeywords).flat().length;
  const matchedKeywords = scores[bestCategory];
  const confidence = Math.min((matchedKeywords / 5) * 100, 95); // Max 95%

  // If no category match, use general or first available
  const recommended =
    categoryMatches[0] ||
    matchingTemplates.find((t) => t.category === 'general') ||
    matchingTemplates[0] ||
    null;

  // Get alternatives (other templates for same platform)
  const alternatives = matchingTemplates
    .filter((t) => t.id !== recommended?.id)
    .slice(0, 3);

  return {
    recommended,
    confidence,
    alternatives,
  };
}

/**
 * Extract variables from template string
 * Returns array of variable names found in {{variable}} format
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /{{(\w+)}}/g;
  const matches = template.matchAll(regex);
  const variables = new Set<string>();

  for (const match of matches) {
    variables.add(match[1]);
  }

  return Array.from(variables);
}

/**
 * Validate template variables
 * Check if all required variables are provided
 */
export function validateTemplateVariables(
  template: PromptTemplate,
  providedVariables: Record<string, string>
): {
  valid: boolean;
  missingVariables: string[];
  extraVariables: string[];
} {
  const requiredVariables = Object.keys(template.variables);
  const providedKeys = Object.keys(providedVariables);

  const missingVariables = requiredVariables.filter(
    (key) => !providedKeys.includes(key) || !providedVariables[key]
  );

  const extraVariables = providedKeys.filter(
    (key) => !requiredVariables.includes(key)
  );

  return {
    valid: missingVariables.length === 0,
    missingVariables,
    extraVariables,
  };
}

/**
 * Format template for display
 * Useful for showing in UI
 */
export function formatTemplatePreview(template: PromptTemplate): string {
  return `
Name: ${template.name}
Category: ${template.category}
Platform: ${template.platform}
Type: ${template.content_type}
Tone: ${template.config.tone}
Length: ${template.config.length}
Language: ${template.config.language}
Variables: ${Object.keys(template.variables).join(', ')}
  `.trim();
}

/**
 * Get template display name with emoji
 */
export function getTemplateDisplayName(template: PromptTemplate): string {
  const categoryEmojis: Record<string, string> = {
    tech: '💻',
    beauty: '💄',
    food: '🍜',
    travel: '✈️',
    general: '📝',
  };

  const platformEmojis: Record<string, string> = {
    facebook: '📘',
    instagram: '📷',
    tiktok: '🎵',
    blog: '📰',
  };

  return `${categoryEmojis[template.category] || '📝'} ${platformEmojis[template.platform] || ''} ${template.name}`;
}

/**
 * Get content type display name
 */
export function getContentTypeDisplayName(
  contentType: string
): string {
  const names: Record<string, string> = {
    review: 'Review',
    comparison: 'So sánh',
    tutorial: 'Hướng dẫn',
    unboxing: 'Mở hộp',
    listicle: 'Danh sách',
  };

  return names[contentType] || contentType;
}

/**
 * Get platform display name
 */
export function getPlatformDisplayName(platform: string): string {
  const names: Record<string, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    blog: 'Blog',
  };

  return names[platform] || platform;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
  const names: Record<string, string> = {
    tech: 'Công nghệ',
    beauty: 'Làm đẹp',
    food: 'Ẩm thực',
    travel: 'Du lịch',
    general: 'Tổng hợp',
  };

  return names[category] || category;
}

/**
 * Check if template is too long (might exceed AI token limit)
 */
export function isTemplateTooLong(
  template: string,
  maxTokens: number = 4000
): boolean {
  const estimatedTokens = estimateTokens(template);
  return estimatedTokens > maxTokens;
}

/**
 * Truncate template if too long
 */
export function truncateTemplate(
  template: string,
  maxTokens: number = 4000
): string {
  const estimatedTokens = estimateTokens(template);

  if (estimatedTokens <= maxTokens) {
    return template;
  }

  const ratio = maxTokens / estimatedTokens;
  const targetLength = Math.floor(template.length * ratio * 0.9); // 90% safety margin

  return template.substring(0, targetLength) + '\n\n[... nội dung đã được rút gọn ...]';
}

/**
 * Merge default video data with custom variables
 */
export function mergeTemplateVariables(
  videoData: {
    title: string;
    description?: string;
    transcript?: string;
    channelName?: string;
  },
  customVariables: Record<string, string>
): Record<string, string> {
  return {
    video_title: videoData.title || '',
    video_description: videoData.description || '',
    transcript: videoData.transcript || '',
    channel_name: videoData.channelName || '',
    ...customVariables,
  };
}
