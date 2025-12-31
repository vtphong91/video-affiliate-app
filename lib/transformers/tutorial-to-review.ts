/**
 * Tutorial to Review Transformer
 *
 * Transforms Tutorial-specific structure to Review-compatible structure
 * This allows Tutorial content to work seamlessly with existing:
 * - Reviews table schema
 * - Schedules system
 * - Cron service
 * - Facebook posting webhook
 *
 * Key Mapping Strategy:
 * - materials_needed → pros (creative mapping)
 * - common_mistakes → cons (with solutions)
 * - steps → key_points (with timestamps)
 * - Full tutorial → custom_content (rich formatted)
 */

export interface Material {
  item_name: string;
  quantity: string;
  why_this_product: string;
  affiliate_link?: string;
  recommended_brands?: string[];
}

export interface Step {
  step_number: number;
  title: string;
  description: string;
  timestamp?: string;
  tips?: string[];
  products_used?: string[]; // References to materials
}

export interface CommonMistake {
  mistake: string;
  why_it_happens: string;
  how_to_avoid: string;
}

export interface TutorialContent {
  tutorial_title: string;
  goal_statement: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  time_estimate: string;
  materials_needed: Material[];
  steps: Step[];
  tips_and_tricks: string[];
  common_mistakes: CommonMistake[];
  final_result: string;
  cta: string;
  target_audience: string[];
  seo_keywords: string[];
}

export interface VideoData {
  videoTitle: string;
  videoDescription?: string;
  channelName?: string;
  platform: string;
  videoUrl?: string;
  transcript?: string;
}

export interface ReviewData {
  title: string;
  summary: string;
  pros: string[];
  cons: string[];
  key_points: Array<{ time: string; content: string }>;
  custom_content: string;
  cta: string;
  target_audience: string[];
  seo_keywords: string[];
  affiliate_links: string[];
}

/**
 * Transform Tutorial content to Review-compatible structure
 *
 * @param tutorial - Tutorial content from AI generation
 * @param videoData - Original video metadata
 * @returns Review-compatible data structure
 */
export function transformTutorialToReview(
  tutorial: TutorialContent,
  videoData: VideoData
): ReviewData {
  console.log('🔄 Transforming Tutorial to Review structure...');
  console.log('📚 Tutorial:', tutorial.tutorial_title);
  console.log('📹 Video:', videoData.videoTitle);

  // Extract affiliate links from materials
  const affiliateLinks = tutorial.materials_needed
    .filter(m => m.affiliate_link)
    .map(m => m.affiliate_link!);

  console.log('🔗 Extracted', affiliateLinks.length, 'affiliate links');

  // Map materials to pros (creative semantic mapping)
  const pros = tutorial.materials_needed.map(material => {
    let proText = `**${material.item_name}** (${material.quantity})`;

    if (material.why_this_product) {
      proText += ` - ${material.why_this_product}`;
    }

    if (material.recommended_brands && material.recommended_brands.length > 0) {
      proText += ` | Thương hiệu đề xuất: ${material.recommended_brands.join(', ')}`;
    }

    return proText;
  });

  console.log('✅ Mapped', pros.length, 'materials to pros');

  // Map common mistakes to cons (with solutions)
  const cons = tutorial.common_mistakes.map(mistake => {
    return `❌ **${mistake.mistake}** - ${mistake.why_it_happens} → ✅ Giải pháp: ${mistake.how_to_avoid}`;
  });

  console.log('✅ Mapped', cons.length, 'mistakes to cons');

  // Map steps to key_points (with timestamps)
  const keyPoints = tutorial.steps.map(step => ({
    time: step.timestamp || '00:00',
    content: `**Bước ${step.step_number}: ${step.title}** - ${step.description}${
      step.tips && step.tips.length > 0
        ? ` | 💡 Mẹo: ${step.tips.join('; ')}`
        : ''
    }`
  }));

  console.log('✅ Mapped', keyPoints.length, 'steps to key_points');

  // Build rich custom_content with full tutorial formatting
  const customContent = buildRichTutorialContent(tutorial);

  console.log('✅ Built rich custom_content:', customContent.length, 'chars');

  // Build comprehensive summary
  const summary = `${tutorial.goal_statement} | Độ khó: ${tutorial.difficulty} | Thời gian: ${tutorial.time_estimate} | Video từ: ${videoData.channelName || videoData.platform}`;

  console.log('✅ Built summary');

  // Build title with SEO optimization
  const title = tutorial.tutorial_title.includes(videoData.videoTitle.substring(0, 20))
    ? tutorial.tutorial_title
    : `${tutorial.tutorial_title} - ${videoData.videoTitle}`;

  console.log('✅ Built title:', title.substring(0, 50));

  const transformed: ReviewData = {
    title,
    summary,
    pros,
    cons,
    key_points: keyPoints,
    custom_content: customContent,
    cta: tutorial.cta,
    target_audience: tutorial.target_audience,
    seo_keywords: tutorial.seo_keywords,
    affiliate_links: affiliateLinks,
  };

  console.log('🎉 Transformation complete!');
  console.log('📊 Result:', {
    title: transformed.title.length,
    summary: transformed.summary.length,
    pros: transformed.pros.length,
    cons: transformed.cons.length,
    keyPoints: transformed.key_points.length,
    affiliateLinks: transformed.affiliate_links.length,
    customContent: transformed.custom_content.length,
  });

  return transformed;
}

/**
 * Build rich formatted custom_content for tutorial
 *
 * Creates a comprehensive, well-formatted tutorial document
 * that can be displayed on landing pages or in Facebook posts
 *
 * @param tutorial - Tutorial content
 * @returns Formatted markdown content
 */
function buildRichTutorialContent(tutorial: TutorialContent): string {
  const sections: string[] = [];

  // Header with metadata
  sections.push(`# ${tutorial.tutorial_title}\n`);
  sections.push(`**Mục tiêu:** ${tutorial.goal_statement}\n`);
  sections.push(`**Độ khó:** ${tutorial.difficulty} | **Thời gian:** ${tutorial.time_estimate}\n`);
  sections.push('---\n');

  // Materials section
  sections.push('## 🛒 Vật liệu cần chuẩn bị\n');
  tutorial.materials_needed.forEach((material, index) => {
    sections.push(`### ${index + 1}. ${material.item_name}\n`);
    sections.push(`- **Số lượng:** ${material.quantity}\n`);
    sections.push(`- **Lý do chọn:** ${material.why_this_product}\n`);

    if (material.recommended_brands && material.recommended_brands.length > 0) {
      sections.push(`- **Thương hiệu đề xuất:** ${material.recommended_brands.join(', ')}\n`);
    }

    if (material.affiliate_link) {
      sections.push(`- 🛍️ [Xem sản phẩm tại đây](${material.affiliate_link})\n`);
    }

    sections.push('\n');
  });

  // Steps section
  sections.push('## 📋 Các bước thực hiện\n');
  tutorial.steps.forEach((step) => {
    sections.push(`### Bước ${step.step_number}: ${step.title}\n`);

    if (step.timestamp) {
      sections.push(`⏰ **Thời điểm trong video:** ${step.timestamp}\n\n`);
    }

    sections.push(`${step.description}\n`);

    if (step.tips && step.tips.length > 0) {
      sections.push('\n**💡 Mẹo:**\n');
      step.tips.forEach(tip => {
        sections.push(`- ${tip}\n`);
      });
    }

    if (step.products_used && step.products_used.length > 0) {
      sections.push(`\n**🔧 Sản phẩm sử dụng:** ${step.products_used.join(', ')}\n`);
    }

    sections.push('\n---\n');
  });

  // Tips and Tricks section
  if (tutorial.tips_and_tricks.length > 0) {
    sections.push('## 💡 Mẹo và Thủ thuật\n');
    tutorial.tips_and_tricks.forEach((tip, index) => {
      sections.push(`${index + 1}. ${tip}\n`);
    });
    sections.push('\n');
  }

  // Common Mistakes section
  if (tutorial.common_mistakes.length > 0) {
    sections.push('## ⚠️ Những lỗi thường gặp\n');
    tutorial.common_mistakes.forEach((mistake, index) => {
      sections.push(`### ${index + 1}. ${mistake.mistake}\n`);
      sections.push(`**Tại sao xảy ra:** ${mistake.why_it_happens}\n\n`);
      sections.push(`**Cách khắc phục:** ${mistake.how_to_avoid}\n\n`);
    });
  }

  // Final Result section
  sections.push('## 🎉 Kết quả cuối cùng\n');
  sections.push(`${tutorial.final_result}\n\n`);

  // Target Audience section
  if (tutorial.target_audience.length > 0) {
    sections.push('## 👥 Phù hợp với\n');
    tutorial.target_audience.forEach(audience => {
      sections.push(`- ${audience}\n`);
    });
    sections.push('\n');
  }

  return sections.join('');
}

/**
 * Validate Tutorial content structure
 *
 * @param content - Content to validate
 * @returns True if valid tutorial structure
 */
export function isTutorialContent(content: any): content is TutorialContent {
  return (
    typeof content === 'object' &&
    content !== null &&
    'tutorial_title' in content &&
    'goal_statement' in content &&
    'materials_needed' in content &&
    Array.isArray(content.materials_needed) &&
    'steps' in content &&
    Array.isArray(content.steps)
  );
}

/**
 * Detect if template is a Tutorial template
 *
 * @param template - Template object from database
 * @returns True if tutorial template
 */
export function isTutorialTemplate(template: any): boolean {
  return (
    template.category?.toLowerCase() === 'tutorial' ||
    template.category?.toLowerCase() === 'how-to' ||
    template.name?.toLowerCase().includes('tutorial') ||
    template.name?.toLowerCase().includes('hướng dẫn')
  );
}
