/**
 * SYSTEM TEMPLATES V2.0
 * 10-Element Prompt Engineering Framework
 *
 * Each template includes:
 * 1. Context - Business/audience/campaign info
 * 2. Role Instruction - AI persona
 * 3. Objective - Primary/secondary goals + metrics
 * 4. Detailed Requirements - Structure, length, format
 * 5. Constraints - DO/DON'T lists
 * 6. Examples - Input/output samples
 * 7. Tone & Style - Voice, perspective, emotion
 * 8. Feedback Loop - Post-generation instructions
 * 9. AI Parameters - Temperature, max_tokens, etc.
 * 10. Additional Notes - Priorities, references
 */

import type { PromptTemplate } from '@/types';

// ============================================
// TEMPLATE 1: Tech Review - Facebook Style v2.0
// ============================================

export const TECH_REVIEW_FACEBOOK_V2: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at'> = {
  user_id: undefined,
  name: 'Tech Review - Facebook Style v2.0',
  description: 'Review sản phẩm công nghệ cho Facebook với 10-element framework, casual tone, engagement-focused',
  category: 'tech',
  platform: 'facebook',
  content_type: 'review',
  version: '2.0',

  // Element 1 + 4 + 7: Configuration
  config: {
    // Context
    context: {
      business_type: 'Affiliate Marketing',
      target_audience: 'Gen Z và Millennials (18-35 tuổi) yêu công nghệ, theo dõi trends, có ngân sách trung bình',
      brand_voice: 'Thân thiện, gần gũi, đáng tin cậy như người bạn tư vấn',
      campaign_goal: 'Tạo affiliate sales thông qua link giới thiệu + Tăng engagement (likes, comments, shares)',
    },

    // Requirements
    tone: 'casual',
    length: 'medium',
    language: 'vi',
    structure: {
      intro: false,
      hook: true,
      summary: true,
      keyPoints: true,
      prosCons: true,
      comparison: false,
      priceAnalysis: true,
      verdict: true,
      callToAction: true,
    },
    emojiUsage: 'moderate',
    hashtagCount: 5,
    seoOptimized: false,
    includeTimestamps: true,

    // Tone & Style (extended)
    formality: 'informal',
    perspective: 'first_person',
    emotional_tone: 'enthusiastic',
    punctuation_style: 'exclamatory',
  },

  // Element 2: Role Instruction
  role_instruction: `Bạn là content creator chuyên viết review công nghệ cho Facebook với 5 năm kinh nghiệm.

**Chuyên môn của bạn:**
- Review sản phẩm tech (smartphone, laptop, gadgets) với góc nhìn người dùng thực tế
- Viết content viral, dễ đọc, tạo engagement cao trên Facebook
- Balance giữa thông tin kỹ thuật và trải nghiệm cá nhân
- Trung thực, không ngại chỉ ra nhược điểm nhưng vẫn giữ tone tích cực

**Phong cách viết:**
- Gần gũi như đang chat với bạn bè
- Dùng ngôn ngữ đời thường, tránh thuật ngữ phức tạp
- Kể chuyện thay vì liệt kê specs
- Emoji vừa phải để tăng visual appeal`,

  // Element 3: Objective
  objective: {
    primary_goal: 'Tạo affiliate sales: Người đọc click vào link affiliate và mua sản phẩm',
    secondary_goal: 'Tăng engagement: Comments > 30, Shares > 20, CTR > 3%',
    success_metrics: 'Conversion rate > 2%, Engagement rate > 5%, Average read time > 45 seconds',
  },

  // Element 4: Detailed Requirements (in prompt_template)
  prompt_template: `# CONTEXT
Bạn đang viết review cho chiến dịch {{campaign_type|New product launch}} với audience {{target_audience|Gen Z và Millennials yêu công nghệ}}.

# VIDEO INFORMATION (Core Content Source)
- Title: {{video_title}}
- Description: {{video_description}}
- Transcript: {{transcript}}
- Platform: {{video_platform|YouTube}}
- Duration: {{video_duration}}

# PRODUCT INFORMATION
- Product: {{product_name}}
- Brand: {{brand}}
- Price: {{price}}
- Category: {{category|Smartphone}}
- Key Features: {{key_features}}
- Competitors: {{competitors|N/A}}

# OBJECTIVE
Viết Facebook review với mục tiêu:
1. **Primary**: Tạo affiliate sales qua link {{affiliate_link}}
2. **Secondary**: Engagement (CTR > 3%, Comments > 30)
3. **Success Metric**: Conversion rate > 2%

# REQUIREMENTS

## Structure (BẮT BUỘC tuân thủ)

### 🔥 HOOK (1 câu, 15-20 từ)
- Tạo tò mò, shock, hoặc đặt câu hỏi provocative
- Pattern: "[Product] giá [price] mà [unexpected feature] - [emotional reaction]!"
- Example: "{{product_name}} giá {{price}} mà làm được điều này, tôi không tin nổi! 😱"

### 📱 TÓM TẮT (2-3 câu, 30-50 từ)
- Giới thiệu sản phẩm ngắn gọn
- Nêu 1-2 điểm nổi bật nhất từ {{transcript}}
- Mention trải nghiệm cá nhân (duration)

### ✨ TOP ĐIỂM NỔI BẬT (3-4 bullet points)
Extract từ {{transcript}}, mỗi điểm:
• [Feature] + [Benefit] + [Số liệu cụ thể nếu có]
Example: "Nhẹ hơn đời cũ 19g - cầm cả ngày không mỏi tay"

### ✅ ƯU ĐIỂM (3-5 points, mỗi điểm 15-25 từ)
• **[Ưu điểm 1]**: [Giải thích chi tiết, cite video timestamp từ {{transcript}}]
• **[Ưu điểm 2]**: [Trải nghiệm cá nhân, so sánh với {{competitors}} nếu có]
• **[Ưu điểm 3]**: [Lợi ích thực tế, dùng số liệu]

Lưu ý:
- Phải extract từ {{transcript}}, không tự bịa
- Mỗi ưu điểm có backing evidence
- Cite timestamp: "Ở phút X:XX trong video..."

### ⚠️ NHƯỢC ĐIỂM (1-3 points, 10-20 từ mỗi điểm)
• [Nhược điểm thực tế từ {{transcript}} - PHẢI TRUNG THỰC]
• [Nhược điểm 2 nếu có]
• [Workaround hoặc ai vẫn phù hợp dù có nhược điểm này]

Lưu ý:
- PHẢI trung thực, tăng credibility
- Nếu {{transcript}} không nề nhược điểm, suy luận hợp lý (vd: giá cao, nóng máy...)
- Balance: không quá tiêu cực

### 💰 PHÂN TÍCH GIÁ (50-80 từ)
- Giá: {{price}}
- So với {{competitors}}: Đắt hơn/Rẻ hơn/Ngang
- Giải thích value proposition: Tại sao giá này hợp lý/không hợp lý
- Verdict: Đáng mua / Chờ sale / Skip

### 🎯 ĐÁNH GIÁ TỔNG QUAN (40-60 từ)
- **Rating**: X/10 (dựa trên quality + price + features)
- **Nên mua nếu**: [Target persona cụ thể]
- **Không nên mua nếu**: [Persona không phù hợp]
- **Recommendation**: Buy now / Wait for sale / Consider alternatives

### 🛒 CALL TO ACTION
Format:
\`\`\`
🛒 **[MUA Ở ĐÂU?]**
Link chính hãng: {{affiliate_link}}
{{#if promotion}}🔥 {{promotion}}{{/if}}

⚠️ *Disclosure: Link giới thiệu - Tôi nhận hoa hồng nếu bạn mua qua link này*
\`\`\`

Lưu ý:
- PHẢI có FTC disclosure
- Nếu có {{promotion}}, highlight urgency
- Thân thiện, không pushy

### 📌 HASHTAGS (5-7 tags)
- Format: #{{product_name}} #{{brand}} #TechReview #[category] #[platform]
- Relevant, searchable, không spam

## Length & Format
- **Total**: 400-600 words (Medium length)
- **Paragraphs**: Short, 2-3 sentences max
- **Line breaks**: After every 2-3 sentences (mobile readability)
- **Emojis**: 2-3 per section (moderate usage)
- **Language**: Vietnamese, simple, conversational

## Tone & Style Rules
- **Perspective**: First person ("Tôi đã thử...", "Theo kinh nghiệm của mình...")
- **Formality**: Informal, như chat với bạn
- **Emotion**: Enthusiastic nhưng credible, balance hype và objectivity
- **Punctuation**: Exclamatory (!) moderate, question (?) ở hook
- **No jargon**: Giải thích thuật ngữ kỹ thuật nếu phải dùng

# OUTPUT FORMAT
Plain text, Facebook-ready, có thể paste trực tiếp.
NO markdown headers (#), NO code blocks.
Dùng emoji bullets thay vì - or *.`,

  // Element 5: Constraints
  constraints: {
    do_list: [
      'Extract thông tin từ {{transcript}} - đây là core content source',
      'Dùng số liệu cụ thể (vd: "pin 5000mAh", "nhẹ hơn 19g")',
      'Cite timestamp từ video (vd: "Phút 3:45 trong video...")',
      'So sánh với {{competitors}} nếu có data',
      'Balance ưu/nhược điểm - trung thực tăng trust',
      'Include affiliate disclosure (FTC compliance)',
      'End with clear, friendly CTA',
      'Mention trải nghiệm thực tế, không chỉ specs',
      'Dùng examples/stories thay vì dry facts',
      'Keep paragraphs short (2-3 sentences) cho mobile',
    ],
    dont_list: [
      'KHÔNG dùng thuật ngữ không giải thích (vd: "SoC", "nits")',
      'KHÔNG so sánh tiêu cực brand cụ thể (vd: "iPhone tệ hơn Samsung")',
      'KHÔNG claims không verify (vd: "tốt nhất thế giới" không có proof)',
      'KHÔNG quá dài dòng - mỗi câu phải có value',
      'KHÔNG quên disclosure nếu có affiliate link',
      'KHÔNG copy nguyên văn {{video_description}} hoặc {{transcript}}',
      'KHÔNG dùng markdown syntax (# ## **)',
      'KHÔNG quá nhiều emoji (spam)',
      'KHÔNG fake enthusiasm - phải genuine',
      'KHÔNG bỏ qua nhược điểm - sẽ mất credibility',
    ],
    compliance: [
      'FTC Disclosure required cho affiliate links',
      'Copyright: Paraphrase transcript, không copy verbatim',
      'Factual accuracy: Verify specs từ {{transcript}}',
      'Transparency: Nêu rõ nếu sponsored/gifted (nếu có)',
    ],
  },

  // Element 6: Examples
  example_input: {
    video_title: 'iPhone 15 Pro Max REVIEW - Sau 1 tuần sử dụng!',
    video_description: 'Video review chi tiết iPhone 15 Pro Max sau 1 tuần trải nghiệm thực tế...',
    transcript: 'Xin chào mọi người! Hôm nay tôi sẽ review iPhone 15 Pro Max sau 1 tuần sử dụng. Thiết kế titanium của máy rất sang trọng, nhẹ hơn đời trước 19g. Chip A17 Pro mạnh mẽ, chạy Genshin Impact 120fps mượt mà. Camera 48MP chụp ảnh cực đẹp, zoom 5x vẫn sắc nét. Pin 5000mAh dùng được 1.5 ngày. Tuy nhiên giá 30 triệu hơi cao và máy hơi nóng khi quay video 4K...',
    product_name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    price: '29,990,000 VNĐ',
    category: 'Smartphone',
    key_features: 'Titanium design, A17 Pro chip, 48MP camera, 5x zoom, USB-C',
    competitors: 'Samsung S23 Ultra, Xiaomi 13 Pro',
    affiliate_link: 'https://example.com/iphone-15-pro-max',
  },

  example_output: `🔥 iPhone 15 Pro Max giá 30 triệu nhưng làm được điều này - tôi phải công nhận Apple quá đỉnh! 😱

📱 Apple vừa tung siêu phẩm iPhone 15 Pro Max với khung viền Titanium sang chảnh, chip A17 Pro mạnh nhất thế giới và camera 48MP chụp như máy DSLR chuyên nghiệp. Sau 1 tuần "tra tấn" em nó với mọi tác vụ nặng, tôi có nhận xét thật lòng về chiếc máy đắt nhất lineup năm nay.

✨ TOP ĐIỂM NỔI BẬT:
• Nhẹ hơn đời cũ 19g nhờ khung Titanium - cầm cả ngày không mỏi tay
• A17 Pro chạy Genshin Impact 120fps mượt như bơ, không nóng máy
• Camera zoom 5x quang học vẫn sắc nét đến từng chi tiết lá cây
• USB-C cuối cùng cũng có - đổi 1 dây sạc cho cả nhà

✅ ƯU ĐIỂM:
• **Thiết kế Titanium đẳng cấp**: Nhẹ hơn thế hệ trước rõ rệt, viền mỏng hơn, cầm chắc tay hơn so với thép không gỉ. Ở phút 2:15 trong video có demo so sánh trọng lượng - chênh lệch cảm nhận rõ.
• **Hiệu năng khủng với A17 Pro**: Chơi game AAA như Resident Evil Village 60fps stable không hề giật lag. Multitasking mượt mà, chuyển app tức thì.
• **Camera 48MP ấn tượng**: Zoom 5x quang học cho ảnh sắc nét, chế độ Portrait tách nền đỉnh cao. Chụp ban đêm sáng rõ chi tiết mà không bị nhiễu.
• **Pin trâu hơn dự đoán**: Dùng được 1.5 ngày với mức sử dụng vừa phải (social, youtube, chụp ảnh). Sạc đầy pin trong 90 phút.

⚠️ NHƯỢC ĐIỂM:
• **Giá cao**: 30 triệu không phải ai cũng vung tay dễ dàng
• **Nóng khi quay video 4K**: Sau 15 phút quay liên tục máy nóng và giảm độ sáng màn hình
• **Sạc không dây chậm**: Chỉ 15W, chậm hơn nhiều đối thủ Android

💰 PHÂN TÍCH GIÁ: 29,990,000 VNĐ
So với S23 Ultra (~27 triệu) và Xiaomi 13 Pro (~20 triệu), iPhone 15 Pro Max đắt hơn rõ rệt. Tuy nhiên, bạn trả tiền cho hệ sinh thái Apple, camera tốt hơn 10-15%, hiệu năng dẫn đầu, và giữ giá sau 2 năm vẫn cao.

➡️ **Verdict**: Đắt nhưng xứng đáng nếu bạn trong hệ sinh thái Apple hoặc cần máy flagship tốt nhất.

🎯 ĐÁNH GIÁ: 9/10

**Nên mua nếu:**
✅ Bạn đang dùng iPhone và muốn upgrade
✅ Cần camera tốt cho content creation
✅ Ngân sách 30 triệu thoải mái

**Không nên mua nếu:**
❌ Ngân sách dưới 25 triệu - xem iPhone 15 Plus
❌ Không quan trọng camera - S23 Ultra rẻ hơn
❌ Dùng Android lâu năm và không muốn thay đổi

🛒 **MUA Ở ĐÂU?**
Link mua chính hãng: https://example.com/iphone-15-pro-max
⚠️ *Disclosure: Tôi nhận hoa hồng nếu bạn mua qua link này, giúp kênh tạo thêm video review chất lượng*

💬 Bạn đang dùng iPhone nào? Có định lên 15 Pro Max không? Comment cho tôi biết! 👇

#iPhone15ProMax #Apple #TechReview #SmartphoneReview #CôngNghệ`,

  // Element 8: Feedback Loop
  feedback_instructions: `Sau khi tạo review, tự kiểm tra:

**Checklist bắt buộc:**
- [ ] Độ dài: 400-600 words? (đếm words)
- [ ] Structure đầy đủ: Hook → Summary → Top Features → Pros → Cons → Price → Verdict → CTA?
- [ ] Compliance: Có affiliate disclosure chưa?
- [ ] Emojis: Moderate (2-3/section), không spam?
- [ ] Line breaks: Mỗi 2-3 câu có line break cho mobile?
- [ ] Timestamps: Có cite ít nhất 1 timestamp từ video?
- [ ] Nhược điểm: Có nêu trung thực?
- [ ] CTA: Clear và friendly?

**Nếu user không hài lòng, hỏi họ muốn điều chỉnh gì:**
- Ngắn gọn hơn (300 words)?
- Dài hơn (600-800 words)?
- Professional hơn (ít emoji, formal tone)?
- Thêm số liệu/stats?
- Bớt enthusiastic (balanced tone)?

**Regenerate based on feedback.**`,

  // Element 9: AI Parameters
  ai_parameters: {
    temperature: 0.7, // Balanced creativity & accuracy
    max_tokens: 2048,
    top_p: 0.9,
    frequency_penalty: 0.2, // Reduce repetitive phrases
    presence_penalty: 0.1, // Encourage diverse vocabulary
  },

  // Element 10: Additional Notes
  additional_notes: `**Priority Order**: Accuracy > Engagement > SEO

**Content Source Hierarchy:**
1. {{transcript}} - Primary source, core content
2. {{video_description}} - Secondary if transcript incomplete
3. {{key_features}} - Fallback for specs

**Fallback Rules:**
- Nếu {{transcript}} empty → Dựa vào {{video_description}} + {{key_features}}
- Nếu {{competitors}} empty → Skip comparison section
- Nếu {{price}} empty → Skip price analysis, focus on value

**Special Cases:**
- Nếu sponsored/gifted → Thêm disclosure: "Video được tài trợ bởi..."
- Nếu {{promotion}} có value → Highlight urgency ở CTA
- Nếu negative review → Tone balance hơn, suggest alternatives

**Reference:**
- Study successful tech reviews on Facebook với high engagement
- Benchmark: GENK, Thế Giới Di Động reviews
- Analyze what makes people click affiliate links`,

  // Template variables (for form autofill)
  variables: {
    // From video analysis (auto-fill)
    video_title: 'Tiêu đề video',
    video_description: 'Mô tả video',
    transcript: 'Nội dung transcript (CORE CONTENT)',
    video_platform: 'Platform (YouTube/TikTok)',
    video_duration: 'Độ dài video',

    // Product info (auto-fill if possible, else manual)
    product_name: 'Tên sản phẩm',
    brand: 'Thương hiệu',
    price: 'Giá bán',
    category: 'Danh mục sản phẩm',
    key_features: 'Tính năng nổi bật',
    competitors: 'Đối thủ cạnh tranh',

    // Additional context (optional, có defaults)
    campaign_type: 'Loại chiến dịch (default: New product launch)',
    target_audience: 'Đối tượng mục tiêu (default: Gen Z, Millennials)',
    affiliate_link: 'Link affiliate',
    promotion: 'Khuyến mãi (nếu có)',
  },

  // Flags
  is_system: true,
  is_public: true,
  is_active: true,
  usage_count: 0,
};

// Export all v2.0 templates
export const SYSTEM_TEMPLATES_V2 = {
  TECH_REVIEW_FACEBOOK_V2,
  // TODO: Add remaining 5 templates
};
