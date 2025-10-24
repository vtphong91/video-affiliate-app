/**
 * CONTENT HELPERS
 * Smart extraction utilities for review content
 */

/**
 * Remove URLs from text content
 * Removes http/https URLs and common patterns like bit.ly, shope.ee, etc.
 */
export function removeUrlsFromContent(content: string): string {
  if (!content) return content;

  // Remove all URLs (http, https, www)
  let cleaned = content
    // Remove full URLs with protocol
    .replace(/https?:\/\/[^\s]+/gi, '')
    // Remove URLs starting with www
    .replace(/www\.[^\s]+/gi, '')
    // Remove common short URL patterns
    .replace(/bit\.ly\/[^\s]+/gi, '')
    .replace(/shope\.ee\/[^\s]+/gi, '')
    .replace(/ti\.ki\/[^\s]+/gi, '')
    .replace(/s\.lazada\.vn\/[^\s]+/gi, '')
    .replace(/vt\.tiktok\.com\/[^\s]+/gi, '')
    .replace(/shorten\.asia\/[^\s]+/gi, '')
    // Remove lines that start with "- " and contain only URL or domain
    .replace(/^[\s-]*[a-zA-Z]+:\/\/[^\n]+$/gm, '')
    // Remove common prefixes before URLs
    .replace(/[\s-]*(Shopee|Lazada|Tiki|Website|Link|Mua tại|Xem tại):?\s*/gi, '')
    // Clean up extra whitespace
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();

  return cleaned;
}

/**
 * Extract smart summary from generated content
 * Ensures summary doesn't cut in the middle of a sentence
 */
export function extractSmartSummary(content: string, maxLength: number = 500): string {
  if (!content || content.length <= maxLength) {
    return content;
  }

  // Find the last sentence ending before maxLength
  const beforeMax = content.substring(0, maxLength);

  // Look for sentence endings: . ! ? followed by space or newline
  const sentenceEndings = [
    beforeMax.lastIndexOf('. '),
    beforeMax.lastIndexOf('! '),
    beforeMax.lastIndexOf('? '),
    beforeMax.lastIndexOf('.\n'),
    beforeMax.lastIndexOf('!\n'),
    beforeMax.lastIndexOf('?\n'),
  ];

  const lastSentenceEnd = Math.max(...sentenceEndings);

  if (lastSentenceEnd > 100) {
    // Found a good sentence ending
    return content.substring(0, lastSentenceEnd + 1).trim();
  }

  // Fallback: cut at last space to avoid cutting words
  const lastSpace = beforeMax.lastIndexOf(' ');
  if (lastSpace > 100) {
    return content.substring(0, lastSpace).trim() + '...';
  }

  // Last resort: hard cut
  return content.substring(0, maxLength) + '...';
}

/**
 * Determine review creation mode
 */
export function detectReviewMode(review: {
  custom_content?: string | null;
  pros?: any[];
  cons?: any[];
}): 'template' | 'traditional' {
  // If has custom_content but no structured data, it's template mode
  if (review.custom_content && review.custom_content.length > 100) {
    if (!review.pros || review.pros.length === 0) {
      return 'template';
    }
  }
  return 'traditional';
}

/**
 * Format structured content for display (traditional mode)
 */
export function formatStructuredContent(review: {
  summary?: string | null;
  pros?: string[];
  cons?: string[];
  key_points?: Array<{ time: string; content: string }>;
  cta?: string | null;
}): string {
  let content = '';

  if (review.summary) {
    content += `${review.summary}\n\n`;
  }

  if (review.pros && review.pros.length > 0) {
    content += `✅ ƯU ĐIỂM:\n`;
    review.pros.forEach(pro => {
      content += `• ${pro}\n`;
    });
    content += '\n';
  }

  if (review.cons && review.cons.length > 0) {
    content += `⚠️ NHƯỢC ĐIỂM:\n`;
    review.cons.forEach(con => {
      content += `• ${con}\n`;
    });
    content += '\n';
  }

  if (review.key_points && review.key_points.length > 0) {
    content += `⏱️ KEY POINTS:\n`;
    review.key_points.forEach(kp => {
      content += `${kp.time} - ${kp.content}\n`;
    });
    content += '\n';
  }

  if (review.cta) {
    content += `\n${review.cta}`;
  }

  return content.trim();
}

/**
 * Get display content based on review mode
 */
export function getDisplayContent(review: {
  custom_content?: string | null;
  summary?: string | null;
  pros?: string[];
  cons?: string[];
  key_points?: Array<{ time: string; content: string }>;
  cta?: string | null;
}): {
  content: string;
  mode: 'template' | 'traditional';
} {
  const mode = detectReviewMode(review);

  if (mode === 'template' && review.custom_content) {
    return {
      content: review.custom_content,
      mode: 'template',
    };
  }

  return {
    content: formatStructuredContent(review),
    mode: 'traditional',
  };
}
