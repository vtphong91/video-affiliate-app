/**
 * AI CONTENT PARSER
 * Parse generated Facebook-style content into structured data
 */

import { generateContentWithGemini } from './gemini';
import { generateContentWithOpenAI } from './openai';
import { generateContentWithClaude } from './claude';

export interface ParsedContent {
  summary: string;
  pros: string[];
  cons: string[];
  target_audience: string[];
  seo_keywords: string[];
  cta: string;
}

/**
 * Parse generated content using AI
 * Falls back to regex extraction if AI fails
 */
export async function parseGeneratedContent(
  content: string
): Promise<ParsedContent> {
  console.log('🤖 Starting AI content parsing...');

  try {
    // Try AI parsing first
    const parsed = await parseWithAI(content);
    console.log('✅ AI parsing successful');
    return parsed;
  } catch (aiError) {
    console.warn('⚠️ AI parsing failed, using regex fallback:', aiError);

    // Fallback to regex extraction
    const parsed = extractWithRegex(content);
    console.log('✅ Regex fallback extraction completed');
    return parsed;
  }
}

/**
 * Parse content using AI (Gemini → OpenAI → Claude)
 */
async function parseWithAI(content: string): Promise<ParsedContent> {
  const prompt = `Parse the following Facebook review content into structured JSON format.

CONTENT TO PARSE:
${content}

Extract and return JSON with these exact fields:
{
  "summary": "Short 2-3 sentence overview of the product/service",
  "pros": ["Advantage 1", "Advantage 2", "Advantage 3", "Advantage 4", "Advantage 5"],
  "cons": ["Disadvantage 1", "Disadvantage 2", "Disadvantage 3"],
  "target_audience": ["Target group 1", "Target group 2", "Target group 3"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
  "cta": "Call to action text encouraging purchase/action"
}

EXTRACTION RULES:
1. Extract pros from sections with ✅, ƯU ĐIỂM, TOP ĐIỂM NỔI BẬT, or positive bullet points
2. Extract cons from sections with ⚠️, NHƯỢC ĐIỂM, or negative aspects
3. Generate at least 3-5 pros and 2-3 cons (even if implied)
4. Target audience should be specific groups (e.g., "office workers", "students", "young families")
5. SEO keywords should be relevant product/service terms (8-10 keywords)
6. CTA should be action-oriented and persuasive
7. Return ONLY valid JSON, no markdown code blocks, no extra text

IMPORTANT: Your response must be ONLY the JSON object, nothing else.`;

  // Try providers in order: Gemini → OpenAI → Claude
  const providers = [
    { name: 'Gemini', fn: generateContentWithGemini },
    { name: 'OpenAI', fn: generateContentWithOpenAI },
    { name: 'Claude', fn: generateContentWithClaude },
  ];

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name} for content parsing...`);
      const result = await provider.fn(prompt);

      // Clean response (remove markdown code blocks if present)
      let cleanResult = result.trim();
      if (cleanResult.startsWith('```json')) {
        cleanResult = cleanResult.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanResult.startsWith('```')) {
        cleanResult = cleanResult.replace(/```\n?/g, '');
      }

      // Parse JSON
      const parsed = JSON.parse(cleanResult);

      // Validate required fields
      if (!parsed.summary || !parsed.pros || !parsed.cons) {
        throw new Error('Missing required fields in AI response');
      }

      // Ensure arrays
      return {
        summary: parsed.summary || '',
        pros: Array.isArray(parsed.pros) ? parsed.pros : [],
        cons: Array.isArray(parsed.cons) ? parsed.cons : [],
        target_audience: Array.isArray(parsed.target_audience) ? parsed.target_audience : [],
        seo_keywords: Array.isArray(parsed.seo_keywords) ? parsed.seo_keywords : [],
        cta: parsed.cta || '',
      };
    } catch (error) {
      console.warn(`${provider.name} parsing failed:`, error);
      continue;
    }
  }

  throw new Error('All AI providers failed to parse content');
}

/**
 * Extract structured data using regex patterns (fallback)
 */
function extractWithRegex(content: string): ParsedContent {
  console.log('📋 Extracting with regex patterns...');

  // Extract summary (first 2-3 sentences)
  const summary = extractSummary(content);

  // Extract pros
  const pros = extractPros(content);

  // Extract cons
  const cons = extractCons(content);

  // Extract target audience
  const targetAudience = extractTargetAudience(content);

  // Extract SEO keywords
  const seoKeywords = extractKeywords(content);

  // Extract CTA
  const cta = extractCTA(content);

  return {
    summary,
    pros,
    cons,
    target_audience: targetAudience,
    seo_keywords: seoKeywords,
    cta,
  };
}

/**
 * Extract summary from content
 */
function extractSummary(content: string): string {
  // Get first 2-3 sentences
  const sentences = content.split(/[.!?]+\s+/).filter(s => s.trim().length > 20);
  const summary = sentences.slice(0, 3).join('. ');
  return summary.length > 300 ? summary.substring(0, 300) + '...' : summary;
}

/**
 * Extract pros/advantages
 */
function extractPros(content: string): string[] {
  const pros: string[] = [];

  // Pattern 1: Find sections with ✅ ƯU ĐIỂM or TOP ĐIỂM NỔI BẬT
  const prosSection = content.match(/(?:✅\s*ƯU ĐIỂM|TOP ĐIỂM NỔI BẬT|✨\s*TOP):([\s\S]*?)(?=⚠️|💰|🎯|$)/i);

  if (prosSection && prosSection[1]) {
    const lines = prosSection[1]
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.match(/^[•\-\*]|^\d+\./));

    lines.forEach(line => {
      const cleaned = line
        .replace(/^[•\-\*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/\*\*/g, '')
        .trim();
      if (cleaned.length > 10 && cleaned.length < 300) {
        pros.push(cleaned);
      }
    });
  }

  // Pattern 2: Look for positive indicators throughout content
  if (pros.length < 3) {
    const positivePatterns = [
      /(?:Ưu điểm|Điểm mạnh|Điểm cộng|Tính năng nổi bật)[:\s]+([^\.!?\n]{10,200})/gi,
      /(?:Khả năng|Có thể|Giúp)[^\.!?\n]{10,200}(?:hiệu quả|tốt|tiện lợi|dễ dàng)/gi,
    ];

    positivePatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        if (match[0] && pros.length < 5) {
          pros.push(match[0].trim());
        }
      }
    });
  }

  return pros.slice(0, 5);
}

/**
 * Extract cons/disadvantages
 */
function extractCons(content: string): string[] {
  const cons: string[] = [];

  // Find sections with ⚠️ NHƯỢC ĐIỂM
  const consSection = content.match(/⚠️\s*NHƯỢC ĐIỂM:([\s\S]*?)(?=💰|🎯|🛒|$)/i);

  if (consSection && consSection[1]) {
    const lines = consSection[1]
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.match(/^[•\-\*]|^\d+\./));

    lines.forEach(line => {
      const cleaned = line
        .replace(/^[•\-\*]\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .trim();
      if (cleaned.length > 10 && cleaned.length < 300) {
        cons.push(cleaned);
      }
    });
  }

  // If no cons found, add generic ones
  if (cons.length === 0) {
    cons.push('Giá thành có thể cao hơn một số sản phẩm tương tự.');
    cons.push('Cần xem xét kỹ trước khi mua để phù hợp với nhu cầu.');
  }

  return cons.slice(0, 3);
}

/**
 * Extract target audience
 */
function extractTargetAudience(content: string): string[] {
  const audiences: string[] = [];

  // Look for audience mentions
  const patterns = [
    /(?:phù hợp|dành cho|thích hợp)\s+(?:với\s+)?([^\.!?\n]{10,100})/gi,
    /(?:Người|Bạn|ai|những người)\s+([^\.!?\n]{10,100})/gi,
  ];

  patterns.forEach(pattern => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && audiences.length < 3) {
        const audience = match[1].trim();
        if (audience.length > 10 && !audiences.includes(audience)) {
          audiences.push(audience);
        }
      }
    }
  });

  // Default audiences if none found
  if (audiences.length === 0) {
    audiences.push('Người quan tâm đến sản phẩm chất lượng');
    audiences.push('Khách hàng có nhu cầu sử dụng sản phẩm này');
  }

  return audiences.slice(0, 3);
}

/**
 * Extract SEO keywords
 */
function extractKeywords(content: string): string[] {
  const keywords = new Set<string>();

  // Extract from hashtags
  const hashtags = content.match(/#(\w+)/g);
  if (hashtags) {
    hashtags.forEach(tag => keywords.add(tag.replace('#', '')));
  }

  // Extract product/brand names (capitalized words)
  const capitalWords = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g);
  if (capitalWords) {
    capitalWords.forEach(word => {
      if (word.length > 3 && keywords.size < 10) {
        keywords.add(word);
      }
    });
  }

  // Extract from title-like sections (words in brackets or bold)
  const titleWords = content.match(/\[([^\]]+)\]/g);
  if (titleWords) {
    titleWords.forEach(title => {
      const words = title.replace(/[\[\]]/g, '').split(/\s+/);
      words.forEach(word => {
        if (word.length > 3 && keywords.size < 10) {
          keywords.add(word.toLowerCase());
        }
      });
    });
  }

  return Array.from(keywords).slice(0, 10);
}

/**
 * Extract call-to-action
 */
function extractCTA(content: string): string {
  // Look for action phrases near the end
  const ctaPatterns = [
    /🛒.{0,200}(?:Mua ngay|Đặt hàng|Order|Click)[^\.!?\n]{10,150}/i,
    /(?:Đừng bỏ lỡ|Hãy|Nhanh tay)[^\.!?\n]{10,150}/i,
    /(?:Sở hữu ngay|Trải nghiệm ngay)[^\.!?\n]{10,150}/i,
  ];

  for (const pattern of ctaPatterns) {
    const match = content.match(pattern);
    if (match && match[0]) {
      return match[0].trim();
    }
  }

  return 'Đặt hàng ngay để nhận ưu đãi hấp dẫn!';
}
