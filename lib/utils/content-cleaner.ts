/**
 * Content Cleaner Utility
 * Removes emojis, markdown syntax, and special characters from AI-generated content
 */

/**
 * Remove all emojis from text
 */
export function removeEmojis(text: string): string {
  // Comprehensive emoji regex pattern
  const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23FA}]|[\u{25AA}-\u{25AB}]|[\u{25B6}]|[\u{25C0}]|[\u{25FB}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]|[\u{2B50}]|[\u{2B55}]/gu;

  return text.replace(emojiPattern, '');
}

/**
 * Remove markdown bold syntax (**text**)
 */
export function removeMarkdownBold(text: string): string {
  // Remove **text** and keep text
  return text.replace(/\*\*([^*]+)\*\*/g, '$1');
}

/**
 * Remove markdown italic syntax (*text* or _text_)
 */
export function removeMarkdownItalic(text: string): string {
  // Remove *text* and _text_ and keep text
  return text.replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1');
}

/**
 * Remove markdown headers (##, ###, etc.)
 */
export function removeMarkdownHeaders(text: string): string {
  // Remove leading # symbols but keep the text
  return text.replace(/^#{1,6}\s+(.+)$/gm, '$1');
}

/**
 * Replace bullet points (•) with dashes (-)
 */
export function replaceBulletPoints(text: string): string {
  return text.replace(/•/g, '-');
}

/**
 * Replace markdown list bullets (* or -) at start of line with simple dash
 */
export function normalizeListBullets(text: string): string {
  // Replace * at start of line with -
  return text.replace(/^\*\s+/gm, '- ');
}

/**
 * Remove multiple consecutive spaces
 */
export function removeExtraSpaces(text: string): string {
  return text.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Clean section headers with emojis (e.g., "🔥 HOOK" → "HOOK")
 */
export function cleanSectionHeaders(text: string): string {
  // Remove emoji + space at start of UPPERCASE headers
  const emojiHeaderPattern = /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]\s+([A-ZẮẰẲẴẶẾỀỂỄỆÍÌỈĨỊỐỒỔỖỘỚỜỞỠỢÚÙỦŨỤỨỪỬỮỰÝỲỶỸỴĐ\s:-]+)$/gmu;

  return text.replace(emojiHeaderPattern, '$1');
}

/**
 * Clean all markdown and emojis from content
 * This is the main function to use
 */
export function cleanContent(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Step 1: Remove emojis from section headers first
  cleaned = cleanSectionHeaders(cleaned);

  // Step 2: Remove all remaining emojis
  cleaned = removeEmojis(cleaned);

  // Step 3: Remove markdown formatting
  cleaned = removeMarkdownBold(cleaned);
  cleaned = removeMarkdownItalic(cleaned);
  cleaned = removeMarkdownHeaders(cleaned);

  // Step 4: Normalize bullets
  cleaned = replaceBulletPoints(cleaned);
  cleaned = normalizeListBullets(cleaned);

  // Step 5: Clean up extra spaces
  cleaned = removeExtraSpaces(cleaned);

  return cleaned;
}

/**
 * Clean content but preserve line breaks and paragraph structure
 */
export function cleanContentPreserveStructure(text: string): string {
  if (!text) return '';

  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/);

  // Clean each paragraph individually
  const cleanedParagraphs = paragraphs.map(para => {
    const lines = para.split('\n');
    const cleanedLines = lines.map(line => cleanContent(line));
    return cleanedLines.join('\n');
  });

  // Rejoin paragraphs with double line breaks
  return cleanedParagraphs.join('\n\n');
}
