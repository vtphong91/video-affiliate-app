-- ============================================
-- SEED SYSTEM TEMPLATES V2.0
-- Run AFTER upgrade-templates-to-v2.sql
-- ============================================

-- Template 1: Tech Review - Facebook Style v2.0
INSERT INTO prompt_templates (
  user_id,
  name,
  description,
  category,
  platform,
  content_type,
  version,
  config,
  prompt_template,
  variables,
  role_instruction,
  objective,
  constraints,
  example_input,
  example_output,
  feedback_instructions,
  ai_parameters,
  additional_notes,
  is_system,
  is_public,
  is_active,
  usage_count
)
SELECT
  NULL,
  'Tech Review - Facebook Style v2.0',
  'Review sản phẩm công nghệ cho Facebook với 10-element framework, casual tone, engagement-focused',
  'tech',
  'facebook',
  'review',
  '2.0',
  '{
    "context": {
      "business_type": "Affiliate Marketing",
      "target_audience": "Gen Z và Millennials (18-35 tuổi) yêu công nghệ",
      "brand_voice": "Thân thiện, gần gũi, đáng tin cậy",
      "campaign_goal": "Tạo affiliate sales + Tăng engagement"
    },
    "tone": "casual",
    "length": "medium",
    "language": "vi",
    "structure": {
      "intro": false,
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
    "includeTimestamps": true,
    "formality": "informal",
    "perspective": "first_person",
    "emotional_tone": "enthusiastic",
    "punctuation_style": "exclamatory"
  }'::jsonb,
  E'# CONTEXT\nBạn đang viết review cho chiến dịch {{campaign_type|New product launch}} với audience {{target_audience|Gen Z và Millennials yêu công nghệ}}.\n\n# VIDEO INFORMATION (Core Content Source)\n- Title: {{video_title}}\n- Description: {{video_description}}\n- Transcript: {{transcript}}\n- Platform: {{video_platform|YouTube}}\n- Duration: {{video_duration}}\n\n# PRODUCT INFORMATION\n- Product: {{product_name}}\n- Brand: {{brand}}\n- Price: {{price}}\n- Category: {{category|Smartphone}}\n- Key Features: {{key_features}}\n- Competitors: {{competitors|N/A}}\n\n# OBJECTIVE\nViết Facebook review với mục tiêu:\n1. **Primary**: Tạo affiliate sales qua link {{affiliate_link}}\n2. **Secondary**: Engagement (CTR > 3%, Comments > 30)\n3. **Success Metric**: Conversion rate > 2%\n\n# REQUIREMENTS\n\n## Structure (BẮT BUỘC tuân thủ)\n\n### 🔥 HOOK (1 câu, 15-20 từ)\n- Tạo tò mò, shock, hoặc đặt câu hỏi provocative\n- Pattern: "[Product] giá [price] mà [unexpected feature] - [emotional reaction]!"\n- Example: "{{product_name}} giá {{price}} mà làm được điều này, tôi không tin nổi! 😱"\n\n### 📱 TÓM TẮT (2-3 câu, 30-50 từ)\n- Giới thiệu sản phẩm ngắn gọn\n- Nêu 1-2 điểm nổi bật nhất từ {{transcript}}\n- Mention trải nghiệm cá nhân\n\n### ✨ TOP ĐIỂM NỔI BẬT (3-4 bullet points)\nExtract từ {{transcript}}, mỗi điểm:\n• [Feature] + [Benefit] + [Số liệu cụ thể]\n\n### ✅ ƯU ĐIỂM (3-5 points, mỗi điểm 15-25 từ)\n• **[Ưu điểm]**: [Giải thích, cite timestamp]\nPhải extract từ {{transcript}}, cite timestamp: "Phút X:XX..."\n\n### ⚠️ NHƯỢC ĐIỂM (1-3 points)\n• [Nhược điểm thực tế - PHẢI TRUNG THỰC]\nBalance, tăng credibility\n\n### 💰 PHÂN TÍCH GIÁ (50-80 từ)\n- Giá: {{price}}\n- So với {{competitors}}\n- Value proposition\n- Verdict: Đáng mua / Chờ sale / Skip\n\n### 🎯 ĐÁNH GIÁ TỔNG QUAN (40-60 từ)\n- Rating: X/10\n- Nên mua nếu: [Persona]\n- Không nên nếu: [Persona]\n- Recommendation\n\n### 🛒 CALL TO ACTION\nLink: {{affiliate_link}}\n⚠️ FTC Disclosure bắt buộc\n\n### 📌 HASHTAGS (5-7 tags)\n#{{product_name}} #{{brand}} #TechReview\n\n## Length & Format\n- Total: 400-600 words\n- Paragraphs: 2-3 sentences max\n- Line breaks: Every 2-3 sentences\n- Emojis: 2-3 per section\n- Plain text, NO markdown\n\n## Tone & Style\n- First person perspective\n- Informal, casual\n- Enthusiastic but credible\n- No jargon\n\n# OUTPUT FORMAT\nPlain text, Facebook-ready, paste trực tiếp.',
  '{
    "video_title": "Tiêu đề video",
    "video_description": "Mô tả video",
    "transcript": "Nội dung transcript (CORE CONTENT)",
    "video_platform": "Platform",
    "video_duration": "Độ dài video",
    "product_name": "Tên sản phẩm",
    "brand": "Thương hiệu",
    "price": "Giá bán",
    "category": "Danh mục",
    "key_features": "Tính năng",
    "competitors": "Đối thủ",
    "campaign_type": "Loại chiến dịch",
    "target_audience": "Audience",
    "affiliate_link": "Link affiliate",
    "promotion": "Khuyến mãi"
  }'::jsonb,
  'Bạn là content creator chuyên viết review công nghệ cho Facebook với 5 năm kinh nghiệm. Chuyên môn: Review tech với góc nhìn người dùng thực tế, viết content viral dễ đọc, balance thông tin kỹ thuật và trải nghiệm cá nhân, trung thực không ngại chỉ nhược điểm. Phong cách: Gần gũi như chat với bạn, ngôn ngữ đời thường, kể chuyện thay vì liệt kê specs, emoji vừa phải.',
  '{
    "primary_goal": "Tạo affiliate sales: Người đọc click link và mua sản phẩm",
    "secondary_goal": "Tăng engagement: Comments > 30, Shares > 20, CTR > 3%",
    "success_metrics": "Conversion rate > 2%, Engagement rate > 5%, Read time > 45s"
  }'::jsonb,
  '{
    "do_list": [
      "Extract từ transcript (core content)",
      "Dùng số liệu cụ thể",
      "Cite timestamp",
      "So sánh competitors nếu có",
      "Balance ưu/nhược điểm",
      "Include FTC disclosure",
      "Clear CTA",
      "Stories thay vì dry facts",
      "Short paragraphs cho mobile"
    ],
    "dont_list": [
      "KHÔNG dùng jargon không giải thích",
      "KHÔNG so sánh tiêu cực brands",
      "KHÔNG claims không verify",
      "KHÔNG quá dài dòng",
      "KHÔNG quên disclosure",
      "KHÔNG copy transcript verbatim",
      "KHÔNG dùng markdown syntax",
      "KHÔNG spam emoji",
      "KHÔNG fake enthusiasm",
      "KHÔNG bỏ qua nhược điểm"
    ],
    "compliance": [
      "FTC Disclosure cho affiliate links",
      "Paraphrase transcript",
      "Verify specs",
      "Transparency nếu sponsored"
    ]
  }'::jsonb,
  '{
    "video_title": "iPhone 15 Pro Max REVIEW - Sau 1 tuần sử dụng!",
    "transcript": "Xin chào! Hôm nay review iPhone 15 Pro Max sau 1 tuần. Thiết kế titanium sang trọng, nhẹ hơn 19g. Chip A17 Pro mạnh, chạy Genshin 120fps mượt. Camera 48MP đẹp, zoom 5x sắc nét. Pin 5000mAh dùng 1.5 ngày. Giá 30 triệu hơi cao, nóng khi quay 4K...",
    "product_name": "iPhone 15 Pro Max",
    "brand": "Apple",
    "price": "29,990,000 VNĐ",
    "key_features": "Titanium, A17 Pro, 48MP, 5x zoom, USB-C",
    "competitors": "S23 Ultra, Xiaomi 13 Pro"
  }'::jsonb,
  E'🔥 iPhone 15 Pro Max giá 30 triệu nhưng làm được điều này - tôi phải công nhận Apple quá đỉnh! 😱\n\n📱 Apple vừa tung siêu phẩm iPhone 15 Pro Max với khung Titanium sang, chip A17 Pro mạnh nhất và camera 48MP như DSLR. Sau 1 tuần "tra tấn", tôi có nhận xét thật lòng.\n\n✨ TOP NỔI BẬT:\n• Nhẹ hơn 19g - cầm cả ngày không mỏi\n• A17 Pro chạy Genshin 120fps mượt\n• Zoom 5x vẫn sắc nét\n• USB-C cuối cùng có rồi!\n\n✅ ƯU ĐIỂM:\n• **Titanium đẳng cấp**: Nhẹ rõ rệt, viền mỏng, cầm chắc. Phút 2:15 có demo so sánh.\n• **A17 Pro khủng**: Game AAA 60fps stable không lag.\n• **Camera 48MP ấn tượng**: Zoom 5x sắc nét, Portrait đỉnh, đêm đẹp.\n• **Pin trâu**: 1.5 ngày, sạc đầy 90 phút.\n\n⚠️ NHƯỢC ĐIỂM:\n• Giá 30 triệu cao\n• Nóng khi quay 4K lâu\n• Sạc không dây chậm 15W\n\n💰 GIÁ: 29.99 triệu\nĐắt hơn S23 Ultra (~27tr) và Xiaomi 13 Pro (~20tr). Nhưng có hệ sinh thái Apple, camera tốt hơn 10-15%, giữ giá cao.\n\n🎯 ĐÁNH GIÁ: 9/10\n\nNên mua: iPhone user muốn upgrade, cần camera pro, ngân sách 30tr OK\nKhông nên: Dưới 25tr → xem 15 Plus, không cần camera → S23 Ultra\n\n🛒 MUA Ở ĐÂU?\nLink chính hãng: [link]\n⚠️ Disclosure: Link affiliate - tôi nhận hoa hồng\n\n💬 Bạn dùng iPhone nào? Comment nhé! 👇\n\n#iPhone15ProMax #Apple #TechReview #Smartphone',
  E'Sau khi tạo, tự kiểm tra:\n- [ ] 400-600 words?\n- [ ] Đầy đủ structure?\n- [ ] Có disclosure?\n- [ ] Emojis moderate?\n- [ ] Line breaks mỗi 2-3 câu?\n- [ ] Có cite timestamp?\n- [ ] Có nêu nhược điểm?\n- [ ] CTA clear?\n\nNếu user không hài lòng, hỏi điều chỉnh:\n- Ngắn hơn (300 words)?\n- Dài hơn (600-800)?\n- Professional hơn?\n- Thêm số liệu?\n- Bớt enthusiastic?',
  '{
    "temperature": 0.7,
    "max_tokens": 2048,
    "top_p": 0.9,
    "frequency_penalty": 0.2,
    "presence_penalty": 0.1
  }'::jsonb,
  E'Priority: Accuracy > Engagement > SEO\n\nContent Source:\n1. transcript (primary)\n2. video_description (secondary)\n3. key_features (fallback)\n\nFallback:\n- Transcript empty → video_description + key_features\n- Competitors empty → skip comparison\n- Price empty → skip price analysis\n\nSpecial:\n- Sponsored → thêm disclosure\n- Promotion → highlight urgency\n- Negative review → balance tone\n\nReference: GENK, Thế Giới Di Động',
  true,
  true,
  true,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM prompt_templates
  WHERE name = 'Tech Review - Facebook Style v2.0' AND is_system = true
);

-- Verify seeded v2.0 templates
SELECT
  id,
  name,
  version,
  category,
  platform,
  usage_count,
  created_at
FROM prompt_templates
WHERE version = '2.0' AND is_system = true
ORDER BY category, platform;
