-- ============================================
-- SEED SYSTEM TEMPLATES
-- Run this in Supabase SQL Editor
-- ============================================

-- Clear existing system templates (optional - comment out if you want to keep existing data)
-- DELETE FROM prompt_templates WHERE is_system = true;

-- Template 1: Tech Review - Facebook
INSERT INTO prompt_templates (
  user_id,
  name,
  description,
  category,
  platform,
  content_type,
  config,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  usage_count
)
SELECT
  NULL,
  'Tech Review - Facebook Style',
  'Review sản phẩm công nghệ cho Facebook, tone casual, dễ hiểu',
  'tech',
  'facebook',
  'review',
  '{
    "tone": "casual",
    "length": "medium",
    "language": "vi",
    "structure": {
      "intro": true,
      "hook": true,
      "summary": true,
      "keyPoints": true,
      "prosCons": true,
      "comparison": false,
      "priceAnalysis": true,
      "verdict": true,
      "callToAction": true
    },
    "emojiUsage": "moderate",
    "hashtagCount": 5,
    "seoOptimized": false,
    "includeTimestamps": false
  }'::jsonb,
  'Bạn là content creator chuyên viết review công nghệ cho Facebook.

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
- Tone thân thiện, cân bằng',
  '{
    "video_title": "Tiêu đề video",
    "video_description": "Mô tả video",
    "transcript": "Nội dung transcript",
    "product_name": "Tên sản phẩm",
    "brand": "Thương hiệu",
    "price": "Giá bán"
  }'::jsonb,
  true,
  true,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates WHERE name = 'Tech Review - Facebook Style' AND is_system = true
);

-- Template 2: Tech Review - Blog
INSERT INTO prompt_templates (
  user_id,
  name,
  description,
  category,
  platform,
  content_type,
  config,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  usage_count
)
SELECT
  NULL,
  'Tech Review - Blog Post (In-depth)',
  'Review chi tiết cho blog, SEO-optimized, chuyên nghiệp',
  'tech',
  'blog',
  'review',
  '{
    "tone": "professional",
    "length": "long",
    "language": "vi",
    "structure": {
      "intro": true,
      "hook": true,
      "summary": true,
      "keyPoints": true,
      "prosCons": true,
      "comparison": true,
      "priceAnalysis": true,
      "verdict": true,
      "callToAction": true
    },
    "emojiUsage": "minimal",
    "seoOptimized": true,
    "includeTimestamps": true
  }'::jsonb,
  'Bạn là chuyên gia viết review công nghệ cho blog chuyên nghiệp.

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

## Hiệu năng
[Timestamp: XX:XX]
- Chip/CPU details
- RAM/Storage
- Benchmark scores

## Ưu điểm
[List chi tiết với giải thích]

## Nhược điểm
[List chi tiết với giải thích]

## So sánh với đối thủ
[Bảng comparison với {{competitors}}]

## Giá cả & Availability
- Giá niêm yết vs thực tế
- Value proposition

## Verdict
- Rating: X/10
- Phù hợp: [...]
- Không phù hợp: [...]

## Kết luận
[Tóm tắt & recommendation]

---
**Keywords:** {{product_name}}, {{brand}}, review, đánh giá, [SEO keywords]',
  '{
    "video_title": "Tiêu đề video",
    "video_description": "Mô tả video",
    "transcript": "Transcript đầy đủ",
    "product_name": "Tên sản phẩm",
    "brand": "Thương hiệu",
    "price": "Giá chi tiết",
    "competitors": "Các đối thủ"
  }'::jsonb,
  true,
  true,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates WHERE name = 'Tech Review - Blog Post (In-depth)' AND is_system = true
);

-- Template 3: Beauty Review - Instagram
INSERT INTO prompt_templates (
  user_id,
  name,
  description,
  category,
  platform,
  content_type,
  config,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  usage_count
)
SELECT
  NULL,
  'Beauty Review - Instagram',
  'Review mỹ phẩm cho Instagram, visual-focused, trendy',
  'beauty',
  'instagram',
  'review',
  '{
    "tone": "casual",
    "length": "short",
    "language": "vi",
    "structure": {
      "intro": true,
      "hook": true,
      "summary": true,
      "keyPoints": true,
      "prosCons": true,
      "comparison": false,
      "priceAnalysis": true,
      "verdict": true,
      "callToAction": true
    },
    "emojiUsage": "heavy",
    "hashtagCount": 15,
    "seoOptimized": false,
    "includeTimestamps": false
  }'::jsonb,
  'Bạn là beauty influencer viết caption cho Instagram.

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

#{{product_name}} #{{brand}} #BeautyReview #Skincare #KBeauty #VietnamBeauty',
  '{
    "product_name": "Tên sản phẩm",
    "brand": "Thương hiệu",
    "category": "Loại sản phẩm",
    "price": "Giá bán",
    "transcript": "Nội dung video"
  }'::jsonb,
  true,
  true,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates WHERE name = 'Beauty Review - Instagram' AND is_system = true
);

-- Template 4: Food Review - TikTok
INSERT INTO prompt_templates (
  user_id,
  name,
  description,
  category,
  platform,
  content_type,
  config,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  usage_count
)
SELECT
  NULL,
  'Food Review - TikTok',
  'Review món ăn/quán ăn cho TikTok, ngắn gọn, hấp dẫn',
  'food',
  'tiktok',
  'review',
  '{
    "tone": "funny",
    "length": "short",
    "language": "vi",
    "structure": {
      "intro": true,
      "hook": true,
      "summary": true,
      "keyPoints": true,
      "prosCons": false,
      "comparison": false,
      "priceAnalysis": true,
      "verdict": true,
      "callToAction": true
    },
    "emojiUsage": "heavy",
    "hashtagCount": 10,
    "seoOptimized": false,
    "includeTimestamps": false
  }'::jsonb,
  'Bạn là food reviewer cho TikTok, viết caption vui, hấp dẫn.

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

👇 Save lại đi ăn thử nhé!

#MonNgon #AnUong #FoodReview #FoodVietnam',
  '{
    "restaurant_name": "Tên quán",
    "location": "Địa chỉ/khu vực",
    "dish_name": "Tên món",
    "price": "Giá món",
    "transcript": "Highlight video"
  }'::jsonb,
  true,
  true,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates WHERE name = 'Food Review - TikTok' AND is_system = true
);

-- Template 5: Product Comparison - Facebook
INSERT INTO prompt_templates (
  user_id,
  name,
  description,
  category,
  platform,
  content_type,
  config,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  usage_count
)
SELECT
  NULL,
  'Product Comparison - Facebook',
  'So sánh 2-3 sản phẩm, giúp chọn lựa',
  'general',
  'facebook',
  'comparison',
  '{
    "tone": "casual",
    "length": "medium",
    "language": "vi",
    "structure": {
      "intro": true,
      "hook": true,
      "summary": false,
      "keyPoints": true,
      "prosCons": false,
      "comparison": true,
      "priceAnalysis": true,
      "verdict": true,
      "callToAction": true
    },
    "emojiUsage": "moderate",
    "hashtagCount": 5,
    "seoOptimized": false,
    "includeTimestamps": false
  }'::jsonb,
  'Bạn là chuyên gia tư vấn, giúp chọn lựa giữa các sản phẩm.

VIDEO INFO:
- Products: {{product1}}, {{product2}}, {{product3}}
- Prices: {{price1}}, {{price2}}, {{price3}}
- Video: {{transcript}}

YÊU CẦU:
So sánh giúp user quyết định mua sản phẩm nào. 400-600 từ.

CẤU TRÚC:

🤔 [HOOK - Câu hỏi: "{{product1}} vs {{product2}} vs {{product3}} - Chọn cái nào?"]

📊 BẢNG SO SÁNH:
[So sánh chi tiết các sản phẩm]

🏆 KẾT LUẬN - NÊN CHỌN GÌ?

💵 Ngân sách <[X]đ → Chọn {{product1}}
⚡ Cần hiệu năng → Chọn {{product2}}
🎯 Cần toàn diện → Chọn {{product3}}

💬 TƯ VẤN CỦA MÌNH:
[2-3 câu recommendation cá nhân]

#SoSanh #Review #TuVan',
  '{
    "product1": "Sản phẩm 1",
    "product2": "Sản phẩm 2",
    "product3": "Sản phẩm 3",
    "price1": "Giá 1",
    "price2": "Giá 2",
    "price3": "Giá 3",
    "transcript": "Nội dung video"
  }'::jsonb,
  true,
  true,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates WHERE name = 'Product Comparison - Facebook' AND is_system = true
);

-- Template 6: Tutorial - Blog
INSERT INTO prompt_templates (
  user_id,
  name,
  description,
  category,
  platform,
  content_type,
  config,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  usage_count
)
SELECT
  NULL,
  'Tutorial/How-to - Blog',
  'Hướng dẫn chi tiết từng bước',
  'general',
  'blog',
  'tutorial',
  '{
    "tone": "formal",
    "length": "long",
    "language": "vi",
    "structure": {
      "intro": true,
      "hook": false,
      "summary": true,
      "keyPoints": true,
      "prosCons": false,
      "comparison": false,
      "priceAnalysis": false,
      "verdict": false,
      "callToAction": true
    },
    "emojiUsage": "minimal",
    "seoOptimized": true,
    "includeTimestamps": true
  }'::jsonb,
  'Bạn là technical writer viết hướng dẫn chi tiết.

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

## Yêu cầu chuẩn bị
**Hardware:** [Thiết bị cần có]
**Software:** [Phần mềm/tools]
**Thời gian:** ~[X] phút

## Bước 1: [Tên bước]
[Timestamp: XX:XX từ video]
[Hướng dẫn chi tiết]

## Troubleshooting
[Giải quyết vấn đề thường gặp]

## Tips & Tricks
💡 Tip 1: [...]
💡 Tip 2: [...]

## Kết luận
[Tóm tắt và next steps]',
  '{
    "video_title": "Tiêu đề video",
    "topic": "Chủ đề hướng dẫn",
    "transcript": "Transcript đầy đủ"
  }'::jsonb,
  true,
  true,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates WHERE name = 'Tutorial/How-to - Blog' AND is_system = true
);

-- Verify seeded templates
SELECT
  id,
  name,
  category,
  platform,
  content_type,
  is_system,
  usage_count
FROM prompt_templates
WHERE is_system = true
ORDER BY category, platform;
