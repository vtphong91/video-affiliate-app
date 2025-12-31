/**
 * Clean AI-generated content from unwanted formatting
 * Removes emojis and markdown bold markers (***) from text
 */

/**
 * Remove emojis from text
 */
export function removeEmojis(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // Emoji regex pattern - covers most common emojis
  const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]/gu;

  return text.replace(emojiRegex, '').trim();
}

/**
 * Remove markdown bold markers (*** or **)
 */
export function removeBoldMarkers(text: string): string {
  if (!text || typeof text !== 'string') return '';

  // Remove *** at start/end of words
  let cleaned = text.replace(/\*\*\*(.+?)\*\*\*/g, '$1');

  // Remove ** at start/end of words
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1');

  return cleaned.trim();
}

/**
 * Clean array items (for pros, cons, target_audience, etc.)
 */
export function cleanArrayItems(items: string[]): string[] {
  if (!Array.isArray(items)) return [];

  return items
    .filter(item => item && typeof item === 'string') // Filter out non-strings
    .map(item => {
      let cleaned = removeEmojis(item);
      cleaned = removeBoldMarkers(cleaned);
      return cleaned.trim();
    })
    .filter(item => item.length > 0); // Remove empty items
}

/**
 * Remove URLs and links from text
 * Patterns: http://, https://, www., shortened links, etc.
 */
export function removeUrls(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // Remove full URLs (http://, https://, ftp://)
  cleaned = cleaned.replace(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi, '');
  cleaned = cleaned.replace(/ftp:\/\/[^\s<>"{}|\\^`\[\]]+/gi, '');

  // Remove www. links
  cleaned = cleaned.replace(/www\.[^\s<>"{}|\\^`\[\]]+/gi, '');

  // Remove common shortened link patterns
  cleaned = cleaned.replace(/\b[a-z]+\.ee\/[a-zA-Z0-9]+/gi, ''); // vn.shp.ee/xxx
  cleaned = cleaned.replace(/\b[a-z]+\.ly\/[a-zA-Z0-9]+/gi, ''); // bit.ly/xxx
  cleaned = cleaned.replace(/\bshorten\.[a-z]+\/[a-zA-Z0-9]+/gi, ''); // shorten.asia/xxx

  // Remove phrases like "Link:", "URL:", "Xem tại:", "Mua tại:"
  cleaned = cleaned.replace(/(link|url|xem tại|mua tại|đặt hàng tại|order at)\s*:?\s*/gi, '');

  // Clean up multiple spaces left behind
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  return cleaned.trim();
}

/**
 * Remove phone numbers and hotlines from text
 * Patterns: 1800.xxxx, 0xxx-xxx-xxx, hotline, phone numbers, etc.
 */
export function removeContactInfo(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let cleaned = text;

  // Remove hotline mentions with numbers
  cleaned = cleaned.replace(/hotline\s*:?\s*[\d.\-\s()]+/gi, '');

  // Remove phone number patterns (Vietnamese format)
  // Matches: 1800.6161, 0123-456-789, (028) 1234 5678, etc.
  cleaned = cleaned.replace(/\b\d{4}[.\-\s]?\d{4}\b/g, ''); // 1800.6161
  cleaned = cleaned.replace(/\b0\d{2,3}[.\-\s]?\d{3,4}[.\-\s]?\d{3,4}\b/g, ''); // 0123-456-789
  cleaned = cleaned.replace(/\(\d{2,3}\)\s*\d{3,4}[.\-\s]?\d{3,4}/g, ''); // (028) 1234 5678

  // Remove "gọi", "liên hệ", "hotline" when followed by numbers or standalone
  cleaned = cleaned.replace(/(gọi|liên hệ|contact|call)\s*(ngay|now)?:?\s*[\d.\-\s()]+/gi, '');
  cleaned = cleaned.replace(/\bhotline\b/gi, '');

  // Remove email addresses
  cleaned = cleaned.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');

  // Clean up multiple spaces left behind
  cleaned = cleaned.replace(/\s{2,}/g, ' ');

  return cleaned.trim();
}

/**
 * Clean text content (for summary, CTA, etc.)
 */
export function cleanTextContent(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let cleaned = removeEmojis(text);
  cleaned = removeBoldMarkers(cleaned);
  cleaned = removeUrls(cleaned); // Remove all URLs and links
  cleaned = removeContactInfo(cleaned); // Remove phone numbers and contact info

  return cleaned.trim();
}

/**
 * Clean HTML content while preserving HTML structure
 * Removes emojis, URLs, and contact info from HTML text nodes without breaking tags
 */
export function cleanHtmlContent(html: string): string {
  if (!html || typeof html !== 'string') return '';

  // Remove emojis, URLs, and contact info from the entire HTML string
  // This will clean both text nodes and any unwanted content in attributes
  let cleaned = removeEmojis(html);
  cleaned = removeUrls(cleaned); // Remove all URLs and links from main content
  cleaned = removeContactInfo(cleaned);
  return cleaned;
}

/**
 * Clean review content object from AI response
 */
export interface ReviewContent {
  summary: string;
  pros: string[];
  cons: string[];
  keyPoints: string[]; // Simple string array for template flow
  mainContent: string;
  cta: string;
  targetAudience: string[];
  seoKeywords: string[];
}

export function cleanReviewContent(content: ReviewContent): ReviewContent {
  return {
    summary: content.summary ? cleanTextContent(content.summary) : '',
    pros: content.pros ? cleanArrayItems(content.pros) : [],
    cons: content.cons ? cleanArrayItems(content.cons) : [],
    keyPoints: content.keyPoints ? cleanArrayItems(content.keyPoints) : [],
    mainContent: content.mainContent ? cleanHtmlContent(content.mainContent) : '', // Clean HTML while preserving structure
    cta: content.cta ? cleanTextContent(content.cta) : '',
    targetAudience: content.targetAudience ? cleanArrayItems(content.targetAudience) : [],
    seoKeywords: content.seoKeywords ? cleanArrayItems(content.seoKeywords) : [],
  };
}
