/**
 * Convert Markdown to HTML for RichTextEditor
 * Handles common markdown syntax from AI responses
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let html = markdown;

  // Convert headers (must be done before other replacements)
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Convert bold with **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Convert italic with *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');

  // Convert unordered lists
  html = html.replace(/^\s*[-*+]\s+(.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

  // Convert ordered lists
  html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<li>$1</li>');

  // Wrap consecutive <li> in <ul> or <ol>
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, (match) => {
    if (!match.includes('<ul>') && !match.includes('<ol>')) {
      return `<ul>${match}</ul>`;
    }
    return match;
  });

  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert line breaks - preserve double line breaks as paragraphs
  html = html.split('\n\n').map(paragraph => {
    // Skip if already wrapped in HTML tags
    if (paragraph.trim().startsWith('<')) {
      return paragraph;
    }
    // Wrap in <p> tag
    return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
  }).join('\n');

  // Clean up extra <br> tags in list items
  html = html.replace(/<li>(.*?)<br>(.*?)<\/li>/g, '<li>$1$2</li>');

  return html;
}

/**
 * Simple HTML cleanup - remove excessive tags
 */
export function cleanHtml(html: string): string {
  if (!html) return '';

  let cleaned = html;

  // Remove empty paragraphs
  cleaned = cleaned.replace(/<p>\s*<\/p>/g, '');

  // Remove empty list items
  cleaned = cleaned.replace(/<li>\s*<\/li>/g, '');

  // Remove empty lists
  cleaned = cleaned.replace(/<ul>\s*<\/ul>/g, '');
  cleaned = cleaned.replace(/<ol>\s*<\/ol>/g, '');

  // Normalize multiple <br> tags
  cleaned = cleaned.replace(/(<br\s*\/?>\s*){3,}/g, '<br><br>');

  return cleaned;
}

/**
 * Main function to convert AI-generated markdown content to HTML
 */
export function convertAiContentToHtml(content: string): string {
  const html = markdownToHtml(content);
  return cleanHtml(html);
}
