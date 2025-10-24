// ============================================
// PROMPT TEMPLATES LIBRARY
// Ready-to-use templates for all industries
// ============================================

import { PromptTemplate } from '@/types';

// ============================================
// TECH TEMPLATES
// ============================================

export const techReviewFacebook: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'> = {
  name: 'Tech Review - Facebook Style',
  description: 'Review sản phẩm công nghệ cho Facebook, tone casual, dễ hiểu',
  category: 'tech',
  platform: 'facebook',
  content_type: 'review',
  version: '1.0',

  config: {
    tone: 'casual',
    length: 'medium',
    language: 'vi',
    structure: {
      intro: true,
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
    includeTimestamps: false,
  },

  prompt_template: `Bạn là content creator chuyên viết review công nghệ cho Facebook.

VIDEO INFO:
- Title: {{video_title}}
- Description: {{video_description}}
- Transcript: {{transcript}}
- Product: {{product_name}}
- Brand: {{brand}}
- Price: {{price}}

YÊU CẦU:
Viết review với tone casual, gần gũi như đang tư vấn cho bạn bè. Độ dài: 300-500 từ.

CẤU TRÚC:

🔥 [HOOK - Câu mở đầu hấp dẫn, tạo tò mò về sản phẩm]

📱 [TÓM TẮT - 2-3 câu giới thiệu sản phẩm]

✨ TOP ĐIỂM NỔI BẬT:
• [Điểm nổi bật 1]
• [Điểm nổi bật 2]
• [Điểm nổi bật 3]

✅ ƯU ĐIỂM:
• [Ưu điểm 1 với giải thích cụ thể]
• [Ưu điểm 2 với giải thích cụ thể]
• [Ưu điểm 3 với giải thích cụ thể]

⚠️ NHƯỢC ĐIỂM:
• [Nhược điểm 1]
• [Nhược điểm 2]

💰 GIÁ: {{price}}
➡️ [Phân tích có đáng giá hay không, so với đối thủ]

🎯 ĐÁNH GIÁ:
[Tổng kết 2-3 câu: Nên mua hay không, phù hợp với ai]

🛒 [CALL TO ACTION với link]

#[keyword1] #[keyword2] #[keyword3] #[keyword4] #[keyword5]

LƯU Ý:
- Emoji vừa phải (2-3/section)
- Ngắn gọn, súc tích
- Tập trung trải nghiệm thực tế
- Tránh thuật ngữ phức tạp
- Có số liệu cụ thể (nếu có)
- Tone thân thiện, cân bằng`,

  variables: {
    video_title: 'Tiêu đề video',
    video_description: 'Mô tả video',
    transcript: 'Nội dung transcript',
    product_name: 'Tên sản phẩm',
    brand: 'Thương hiệu',
    price: 'Giá bán',
  },

  is_system: true,
  is_public: true,
  is_active: true,
};

export const techReviewBlog: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'> = {
  name: 'Tech Review - Blog Post (In-depth)',
  description: 'Review chi tiết cho blog, SEO-optimized, chuyên nghiệp',
  category: 'tech',
  platform: 'blog',
  content_type: 'review',
  version: '1.0',

  config: {
    tone: 'professional',
    length: 'long',
    language: 'vi',
    structure: {
      intro: true,
      hook: true,
      summary: true,
      keyPoints: true,
      prosCons: true,
      comparison: true,
      priceAnalysis: true,
      verdict: true,
      callToAction: true,
    },
    emojiUsage: 'minimal',
    seoOptimized: true,
    includeTimestamps: true,
  },

  prompt_template: `Bạn là chuyên gia viết review công nghệ cho blog chuyên nghiệp.

VIDEO INFO:
- Title: {{video_title}}
- Description: {{video_description}}
- Transcript: {{transcript}}
- Product: {{product_name}}
- Brand: {{brand}}
- Price: {{price}}
- Competitors: {{competitors}}

YÊU CẦU:
Viết bài review chi tiết 1500-2000 từ, SEO-friendly.

CẤU TRÚC:

# {{product_name}} Review: [Tiêu đề SEO-friendly với keywords]

## Giới thiệu
- Hook: Câu mở đầu thu hút
- Context: Tại sao sản phẩm này đáng chú ý
- Overview: Tổng quan sản phẩm

## Thông số kỹ thuật
[Bảng specs chi tiết]

## Thiết kế & Build Quality
[Timestamp: XX:XX]
- Vật liệu, ngoại hình
- Cảm giác cầm nắm
- Độ hoàn thiện
- So sánh thế hệ trước

## Hiệu năng
[Timestamp: XX:XX]
- Chip/CPU details
- RAM/Storage
- Benchmark scores
- Hiệu năng thực tế
- Nhiệt độ & tiếng ồn

## Ưu điểm
[List chi tiết với giải thích]

## Nhược điểm
[List chi tiết với giải thích]

## So sánh với đối thủ
[Bảng comparison với {{competitors}}]

## Giá cả & Availability
- Giá niêm yết vs thực tế
- Value proposition
- Alternatives

## Verdict
- Rating: X/10
- Phù hợp: [...]
- Không phù hợp: [...]

## Kết luận
[Tóm tắt & recommendation]

---
**Keywords:** {{product_name}}, {{brand}}, review, đánh giá, [SEO keywords]

LƯU Ý:
- Chuyên nghiệp, có cơ sở
- Quotes từ video
- Timestamps chính xác
- Số liệu benchmark
- So sánh khách quan
- Natural keyword usage
- Proper headings H1-H3`,

  variables: {
    video_title: 'Tiêu đề video',
    video_description: 'Mô tả video',
    transcript: 'Transcript đầy đủ',
    product_name: 'Tên sản phẩm',
    brand: 'Thương hiệu',
    price: 'Giá chi tiết',
    competitors: 'Các đối thủ',
  },

  is_system: true,
  is_public: true,
  is_active: true,
};

// ============================================
// BEAUTY TEMPLATES
// ============================================

export const beautyReviewInstagram: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'> = {
  name: 'Beauty Review - Instagram',
  description: 'Review mỹ phẩm cho Instagram, visual-focused, trendy',
  category: 'beauty',
  platform: 'instagram',
  content_type: 'review',
  version: '1.0',

  config: {
    tone: 'casual',
    length: 'short',
    language: 'vi',
    structure: {
      intro: true,
      hook: true,
      summary: true,
      keyPoints: true,
      prosCons: true,
      comparison: false,
      priceAnalysis: true,
      verdict: true,
      callToAction: true,
    },
    emojiUsage: 'heavy',
    hashtagCount: 15,
    seoOptimized: false,
    includeTimestamps: false,
  },

  prompt_template: `Bạn là beauty influencer viết caption cho Instagram.

VIDEO INFO:
- Product: {{product_name}}
- Brand: {{brand}}
- Category: {{category}} (skincare/makeup/haircare)
- Price: {{price}}
- Video content: {{transcript}}

YÊU CẦU:
Viết caption Instagram 150-250 từ, visual-focused, nhiều emoji.

CẤU TRÚC:

💖 [HOOK - Câu thu hút về kết quả/trải nghiệm]

✨ Vừa thử {{product_name}} của {{brand}} được [X ngày/tuần]

🌟 CẢM NHẬN:
• [Texture/màu sắc/mùi hương]
• [Hiệu quả thấy rõ]
• [So với kỳ vọng]

✅ YÊU THÍCH:
• [Điểm 1]
• [Điểm 2]
• [Điểm 3]

⚠️ LƯU Ý:
• [Nhược điểm nếu có]
• [Skin type phù hợp]

💰 GIÁ: {{price}}
👉 [Đánh giá giá trị]

📝 RATING: ⭐⭐⭐⭐⭐ (X/5)

🛒 [CTA - Where to buy]

━━━━━━━━━━━━━━━━

#{{product_name}} #{{brand}} #BeautyReview #Skincare #KBeauty #VietnamBeauty #BeautyVietnam #BeautyCommunity #SkincareRoutine #BeautyAddict #InstaBeauty #BeautyBlogger #MakeupLover #SkincareJunkie #BeautyTips

LƯU Ý:
- NHIỀU emoji (5-7 emoji/section)
- Ngắn gọn, dễ đọc khi scroll
- Tập trung visual & experience
- Authentic, cá nhân hóa
- 15 hashtags (mix popular + niche)
- Line breaks nhiều cho dễ đọc
- Include skin type info
- Mention ingredients nếu đặc biệt`,

  variables: {
    product_name: 'Tên sản phẩm',
    brand: 'Thương hiệu',
    category: 'Loại sản phẩm',
    price: 'Giá bán',
    transcript: 'Nội dung video',
  },

  is_system: true,
  is_public: true,
  is_active: true,
};

// ============================================
// FOOD TEMPLATES
// ============================================

export const foodReviewTikTok: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'> = {
  name: 'Food Review - TikTok',
  description: 'Review món ăn/quán ăn cho TikTok, ngắn gọn, hấp dẫn',
  category: 'food',
  platform: 'tiktok',
  content_type: 'review',
  version: '1.0',

  config: {
    tone: 'funny',
    length: 'short',
    language: 'vi',
    structure: {
      intro: true,
      hook: true,
      summary: true,
      keyPoints: true,
      prosCons: false,
      comparison: false,
      priceAnalysis: true,
      verdict: true,
      callToAction: true,
    },
    emojiUsage: 'heavy',
    hashtagCount: 10,
    seoOptimized: false,
    includeTimestamps: false,
  },

  prompt_template: `Bạn là food reviewer cho TikTok, viết caption vui, hấp dẫn.

VIDEO INFO:
- Restaurant/Dish: {{restaurant_name}}
- Location: {{location}}
- Dish name: {{dish_name}}
- Price: {{price}}
- Video highlights: {{transcript}}

YÊU CẦU:
Caption TikTok 100-150 từ, engaging, có hook mạnh.

CẤU TRÚC:

🤤 [HOOK - Câu kéo view: "Món này ngon đến nỗi..." / "X ở Y mà rẻ vậy?" / etc]

📍 {{restaurant_name}} - {{location}}

🍜 Món: {{dish_name}}

✨ Điểm 10:
• [Vị như thế nào - miêu tả giác quan]
• [Portion size]
• [Đặc biệt gì]

💰 Giá: {{price}}
👉 [Comment về giá - rẻ/đắng/worth it]

⭐ Rate: [X]/10

📌 Tips:
• [Tip 1 - best time, combo, topping...]
• [Tip 2]

👇 Save lại đi ăn thử nhé!

#MonNgon #AnUong #FoodReview #FoodVietnam #HaNoi #SaiGon #QuanAnNgon #MonNgonHaNoi #TikTokFood #FoodLover

LƯU Ý:
- Hook CỰC MẠNH (must-stop-scrolling)
- Giác quan: miêu tả vị, mùi, texture
- Practical info: giá, địa chỉ, tips
- Conversational, như kể chuyện
- Emoji nhiều nhưng đúng chỗ
- CTA rõ ràng (save, follow, try)
- Hashtags mix trending + location
- Ngắn gọn - TikTok attention span thấp`,

  variables: {
    restaurant_name: 'Tên quán',
    location: 'Địa chỉ/khu vực',
    dish_name: 'Tên món',
    price: 'Giá món',
    transcript: 'Highlight video',
  },

  is_system: true,
  is_public: true,
  is_active: true,
};

// ============================================
// COMPARISON TEMPLATES
// ============================================

export const productComparisonFB: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'> = {
  name: 'Product Comparison - Facebook',
  description: 'So sánh 2-3 sản phẩm, giúp chọn lựa',
  category: 'general',
  platform: 'facebook',
  content_type: 'comparison',
  version: '1.0',

  config: {
    tone: 'casual',
    length: 'medium',
    language: 'vi',
    structure: {
      intro: true,
      hook: true,
      summary: false,
      keyPoints: true,
      prosCons: false,
      comparison: true,
      priceAnalysis: true,
      verdict: true,
      callToAction: true,
    },
    emojiUsage: 'moderate',
    hashtagCount: 5,
    seoOptimized: false,
    includeTimestamps: false,
  },

  prompt_template: `Bạn là chuyên gia tư vấn, giúp chọn lựa giữa các sản phẩm.

VIDEO INFO:
- Products: {{product1}}, {{product2}}, {{product3}}
- Prices: {{price1}}, {{price2}}, {{price3}}
- Video: {{transcript}}

YÊU CẦU:
So sánh giúp user quyết định mua sản phẩm nào. 400-600 từ.

CẤU TRÚC:

🤔 [HOOK - Câu hỏi: "{{product1}} vs {{product2}} vs {{product3}} - Chọn cái nào?"]

📊 BẢNG SO SÁNH NHANH:

| Tiêu chí | {{product1}} | {{product2}} | {{product3}} |
|----------|--------------|--------------|--------------|
| 💰 Giá | {{price1}} | {{price2}} | {{price3}} |
| ⭐ Điểm mạnh | [...] | [...] | [...] |
| ⚠️ Điểm yếu | [...] | [...] | [...] |
| 👤 Phù hợp | [...] | [...] | [...] |

━━━━━━━━━━━━━━━━

🔍 PHÂN TÍCH CHI TIẾT:

**1️⃣ {{product1}}**
✅ Ưu điểm:
• [Điểm 1]
• [Điểm 2]

⚠️ Nhược điểm:
• [Điểm 1]

💰 {{price1}}
👤 Phù hợp: [Ai nên mua]

**2️⃣ {{product2}}**
✅ Ưu điểm:
• [...]

⚠️ Nhược điểm:
• [...]

💰 {{price2}}
👤 Phù hợp: [...]

**3️⃣ {{product3}}**
✅ Ưu điểm:
• [...]

⚠️ Nhược điểm:
• [...]

💰 {{price3}}
👤 Phù hợp: [...]

━━━━━━━━━━━━━━━━

🏆 KẾT LUẬN - NÊN CHỌN GÌ?

💵 Ngân sách <[X]đ → Chọn {{product1}}
⚡ Cần hiệu năng → Chọn {{product2}}
🎯 Cần toàn diện → Chọn {{product3}}

💬 TƯ VẤN CỦA MÌNH:
[2-3 câu recommendation cá nhân dựa trên use case]

📌 Comment bên dưới nếu bạn cần tư vấn thêm!

👉 [CTA với links]

#SoSanh #Review #[Products] #TuVan

LƯU Ý:
- Bảng so sánh clear, dễ scan
- Khách quan, không thiên vị
- Use cases thực tế
- Giúp user tự decide
- Pricing context quan trọng
- Không bán hàng aggressive`,

  variables: {
    product1: 'Sản phẩm 1',
    product2: 'Sản phẩm 2',
    product3: 'Sản phẩm 3',
    price1: 'Giá 1',
    price2: 'Giá 2',
    price3: 'Giá 3',
    transcript: 'Nội dung video',
  },

  is_system: true,
  is_public: true,
  is_active: true,
};

// ============================================
// TUTORIAL TEMPLATES
// ============================================

export const tutorialBlog: Omit<PromptTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'> = {
  name: 'Tutorial/How-to - Blog',
  description: 'Hướng dẫn chi tiết từng bước',
  category: 'general',
  platform: 'blog',
  content_type: 'tutorial',
  version: '1.0',

  config: {
    tone: 'formal',
    length: 'long',
    language: 'vi',
    structure: {
      intro: true,
      hook: false,
      summary: true,
      keyPoints: true,
      prosCons: false,
      comparison: false,
      priceAnalysis: false,
      verdict: false,
      callToAction: true,
    },
    emojiUsage: 'minimal',
    seoOptimized: true,
    includeTimestamps: true,
  },

  prompt_template: `Bạn là technical writer viết hướng dẫn chi tiết.

VIDEO INFO:
- Title: {{video_title}}
- Topic: {{topic}}
- Transcript: {{transcript}}

YÊU CẦU:
Hướng dẫn từng bước, dễ hiểu, 1000-1500 từ.

CẤU TRÚC:

# Hướng dẫn {{topic}} - Chi tiết từng bước

## Giới thiệu
- {{topic}} là gì
- Tại sao cần biết
- Ai nên đọc guide này
- Kết quả sau khi hoàn thành

## Yêu cầu chuẩn bị
**Hardware:**
- [Thiết bị cần có]

**Software:**
- [Phần mềm/tools]

**Kiến thức:**
- [Prerequisites]

**Thời gian:** ~[X] phút

## Bước 1: [Tên bước]
[Timestamp: XX:XX từ video]

**Mục tiêu:** [Mục tiêu của bước này]

**Hành động:**
1. [Action chi tiết 1]
   - Sub-step nếu cần
2. [Action 2]
3. [Action 3]

**✅ Kiểm tra:** [Làm sao biết bước này thành công]

⚠️ **Lưu ý:**
- [Warning nếu có]
- [Common mistake]

## Troubleshooting
**Vấn đề 1:** [Mô tả vấn đề]
**Nguyên nhân:** [...]
**Giải pháp:** [...]

## Tips & Tricks
💡 Tip 1: [...]
💡 Tip 2: [...]
💡 Tip 3: [...]

## Kết luận
- Tóm tắt những gì đã làm
- Kết quả đạt được
- Next steps

LƯU Ý:
- Numbered steps rõ ràng
- Giải thích thuật ngữ
- Warnings cho bước nguy hiểm
- Timestamps chính xác
- Troubleshooting phổ biến
- Tone hướng dẫn, không rushed`,

  variables: {
    video_title: 'Tiêu đề video',
    topic: 'Chủ đề hướng dẫn',
    transcript: 'Transcript đầy đủ',
  },

  is_system: true,
  is_public: true,
  is_active: true,
};

// ============================================
// EXPORT ALL TEMPLATES
// ============================================

export const systemTemplates = [
  techReviewFacebook,
  techReviewBlog,
  beautyReviewInstagram,
  foodReviewTikTok,
  productComparisonFB,
  tutorialBlog,
];
