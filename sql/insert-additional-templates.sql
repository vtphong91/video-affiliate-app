-- Insert Additional System Templates
-- This script adds 5 new templates: Comparison, Unboxing, Cooking Tutorial, Tech Tutorial, Beauty Tutorial

-- 1. COMPARISON TEMPLATE
INSERT INTO templates (
  id,
  user_id,
  name,
  category,
  platform,
  description,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  version
) VALUES (
  gen_random_uuid(),
  NULL, -- System template
  'So Sánh Sản Phẩm (Comparison)',
  'comparison',
  'facebook',
  'Template để tạo nội dung so sánh 2 sản phẩm cùng loại, giúp người đọc đưa ra quyết định mua hàng sáng suốt.',
  'Bạn đang phân tích một video so sánh sản phẩm để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Phân tích So Sánh:**
   - Xác định 2 sản phẩm được so sánh
   - Tiêu chí so sánh (giá, tính năng, hiệu suất, thiết kế, v.v.)
   - Điểm mạnh/yếu của từng sản phẩm
   - Kết luận: Sản phẩm nào phù hợp với đối tượng nào

2. **Tone và Style:**
   - Tone: {{tone}}
   - Ngôn ngữ: {{language}}
   - Độ dài: {{length}}
   - Khách quan, cân bằng, không thiên vị

3. **Comparison Table:**
   - Tạo bảng so sánh rõ ràng
   - Highlight điểm khác biệt quan trọng
   - Đánh giá từng tiêu chí

4. **Recommendation:**
   - Đưa ra khuyến nghị dựa trên use case
   - Giải thích tại sao chọn sản phẩm này vs sản phẩm kia

🎨 OUTPUT (JSON):

{
  "comparison_title": "Tiêu đề so sánh hấp dẫn",
  "products": [
    {
      "name": "Tên sản phẩm 1",
      "brand": "Thương hiệu",
      "price_range": "Giá",
      "key_features": ["Tính năng 1", "Tính năng 2"],
      "affiliate_link": ""
    },
    {
      "name": "Tên sản phẩm 2",
      "brand": "Thương hiệu",
      "price_range": "Giá",
      "key_features": ["Tính năng 1", "Tính năng 2"],
      "affiliate_link": ""
    }
  ],
  "comparison_criteria": [
    {
      "criterion": "Giá cả",
      "product1_score": "8/10",
      "product2_score": "6/10",
      "winner": "Sản phẩm 1",
      "explanation": "Giải thích"
    }
  ],
  "summary": "Tóm tắt ngắn gọn về so sánh",
  "product1_pros": ["Ưu điểm 1", "Ưu điểm 2"],
  "product1_cons": ["Nhược điểm 1", "Nhược điểm 2"],
  "product2_pros": ["Ưu điểm 1", "Ưu điểm 2"],
  "product2_cons": ["Nhược điểm 1", "Nhược điểm 2"],
  "recommendation": {
    "best_for_budget": "Sản phẩm X vì...",
    "best_for_performance": "Sản phẩm Y vì...",
    "best_overall": "Sản phẩm Z vì..."
  },
  "final_verdict": "Kết luận tổng quan",
  "cta": "Lời kêu gọi hành động",
  "target_audience": ["Đối tượng 1", "Đối tượng 2"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

⚠️ LƯU Ý:
- Khách quan, không thiên vị
- Cung cấp đủ thông tin để người đọc tự quyết định
- Highlight use case phù hợp với từng sản phẩm
- Tất cả nội dung phải bằng {{language}}',
  '{
    "videoTitle": "Tiêu đề video",
    "videoDescription": "Mô tả video",
    "channelName": "Tên kênh",
    "platform": "Nền tảng",
    "transcript": "Nội dung video",
    "tone": "Giọng điệu (casual, professional, friendly)",
    "language": "Ngôn ngữ (vi, en)",
    "length": "Độ dài (short, medium, long)"
  }'::jsonb,
  true, -- is_system
  true, -- is_public
  true, -- is_active
  '2.0'  -- version
) ON CONFLICT (id) DO NOTHING;

-- 2. UNBOXING TEMPLATE
INSERT INTO templates (
  id,
  user_id,
  name,
  category,
  platform,
  description,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  version
) VALUES (
  gen_random_uuid(),
  NULL, -- System template
  'Unboxing - Mở Hộp Trải Nghiệm',
  'unboxing',
  'facebook',
  'Template để tạo nội dung unboxing/mở hộp sản phẩm, chia sẻ first impression và trải nghiệm ban đầu.',
  'Bạn đang phân tích một video unboxing để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Unboxing Experience:**
   - First impression về bao bì
   - Nội dung trong hộp (what''s in the box)
   - Chất lượng packaging
   - Phụ kiện đi kèm
   - Build quality và materials

2. **First Impressions:**
   - Cảm nhận ban đầu về sản phẩm
   - Design và aesthetics
   - So sánh với kỳ vọng
   - Điểm nổi bật ngay lập tức

3. **Tone và Style:**
   - Tone: {{tone}}
   - Ngôn ngữ: {{language}}
   - Độ dài: {{length}}
   - Hào hứng, chân thực, chi tiết

4. **Next Steps:**
   - Dự định sử dụng/test như thế nào
   - Teaser cho full review sau này

🎨 OUTPUT (JSON):

{
  "unboxing_title": "Tiêu đề unboxing hấp dẫn",
  "product_info": {
    "name": "Tên sản phẩm",
    "brand": "Thương hiệu",
    "model": "Model/phiên bản",
    "price": "Giá",
    "where_to_buy": "Nơi mua",
    "affiliate_link": ""
  },
  "packaging": {
    "box_quality": "Đánh giá chất lượng hộp",
    "design": "Mô tả thiết kế bao bì",
    "first_impression": "Ấn tượng đầu tiên",
    "unboxing_experience": "Trải nghiệm mở hộp"
  },
  "whats_in_the_box": [
    {
      "item": "Sản phẩm chính",
      "description": "Mô tả",
      "timestamp": "00:00"
    },
    {
      "item": "Phụ kiện 1",
      "description": "Mô tả",
      "timestamp": "00:00"
    }
  ],
  "first_impressions": {
    "design": "Đánh giá thiết kế",
    "build_quality": "Đánh giá chất lượng hoàn thiện",
    "materials": "Đánh giá vật liệu",
    "initial_thoughts": "Suy nghĩ ban đầu"
  },
  "highlights": ["Điểm nổi bật 1", "Điểm nổi bật 2", "Điểm nổi bật 3"],
  "concerns": ["Điểm cần lưu ý 1", "Điểm cần lưu ý 2"],
  "summary": "Tóm tắt unboxing experience",
  "next_steps": "Dự định test/review tiếp theo",
  "cta": "Lời kêu gọi hành động",
  "target_audience": ["Đối tượng 1", "Đối tượng 2"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

⚠️ LƯU Ý:
- Focus vào first impression, không phải full review
- Chi tiết về packaging và unboxing experience
- Hào hứng nhưng trung thực
- Tất cả nội dung phải bằng {{language}}',
  '{
    "videoTitle": "Tiêu đề video",
    "videoDescription": "Mô tả video",
    "channelName": "Tên kênh",
    "platform": "Nền tảng",
    "transcript": "Nội dung video",
    "tone": "Giọng điệu (casual, professional, friendly)",
    "language": "Ngôn ngữ (vi, en)",
    "length": "Độ dài (short, medium, long)"
  }'::jsonb,
  true, -- is_system
  true, -- is_public
  true, -- is_active
  '2.0'  -- version
) ON CONFLICT (id) DO NOTHING;

-- 3. COOKING TUTORIAL TEMPLATE
INSERT INTO templates (
  id,
  user_id,
  name,
  category,
  platform,
  description,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  version
) VALUES (
  gen_random_uuid(),
  NULL, -- System template
  'Hướng Dẫn Nấu Ăn (Cooking Tutorial)',
  'cooking-tutorial',
  'facebook',
  'Template chuyên biệt cho video hướng dẫn nấu ăn, công thức món ăn với tích hợp sản phẩm nguyên liệu và dụng cụ nấu nướng.',
  'Bạn đang phân tích một video hướng dẫn nấu ăn để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Recipe Analysis:**
   - Tên món ăn
   - Xuất xứ/phong cách ẩm thực
   - Độ khó
   - Thời gian chuẩn bị + nấu
   - Khẩu phần (serves)

2. **Ingredients & Tools:**
   - Nguyên liệu chi tiết (với khối lượng)
   - Dụng cụ cần thiết
   - Thương hiệu/sản phẩm khuyến nghị
   - Lý do chọn sản phẩm đó

3. **Cooking Steps:**
   - Các bước nấu chi tiết
   - Mẹo và tricks
   - Thời điểm quan trọng
   - Lỗi thường gặp và cách tránh

4. **Tone và Style:**
   - Tone: {{tone}}
   - Ngôn ngữ: {{language}}
   - Độ dài: {{length}}
   - Thân thiện, dễ hiểu, khuyến khích

🎨 OUTPUT (JSON):

{
  "recipe_title": "Tên món ăn hấp dẫn",
  "cuisine_type": "Loại ẩm thực (Việt, Á, Âu, v.v.)",
  "difficulty": "Dễ|Trung bình|Khó",
  "prep_time": "Thời gian chuẩn bị",
  "cook_time": "Thời gian nấu",
  "total_time": "Tổng thời gian",
  "servings": "Khẩu phần (VD: 4 người)",
  "ingredients": [
    {
      "category": "Nguyên liệu chính",
      "items": [
        {
          "name": "Tên nguyên liệu",
          "quantity": "Khối lượng",
          "notes": "Ghi chú (optional)",
          "recommended_brand": "Thương hiệu khuyến nghị",
          "why_this_product": "Lý do chọn",
          "affiliate_link": ""
        }
      ]
    }
  ],
  "tools_needed": [
    {
      "tool": "Dụng cụ",
      "why_needed": "Lý do cần",
      "recommended_product": "Sản phẩm khuyến nghị",
      "affiliate_link": ""
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "title": "Tiêu đề bước",
      "instruction": "Hướng dẫn chi tiết",
      "timestamp": "00:00",
      "tips": ["Mẹo 1", "Mẹo 2"],
      "important_notes": "Lưu ý quan trọng"
    }
  ],
  "cooking_tips": [
    "Mẹo chung 1",
    "Mẹo chung 2"
  ],
  "common_mistakes": [
    {
      "mistake": "Lỗi thường gặp",
      "why": "Tại sao xảy ra",
      "how_to_avoid": "Cách tránh"
    }
  ],
  "variations": [
    "Biến thể 1 của món ăn",
    "Biến thể 2"
  ],
  "serving_suggestions": "Gợi ý cách dọn/ăn kèm",
  "storage_tips": "Cách bảo quản",
  "summary": "Tóm tắt về món ăn và công thức",
  "cta": "Lời kêu gọi hành động",
  "target_audience": ["Đối tượng 1", "Đối tượng 2"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

⚠️ LƯU Ý:
- Nguyên liệu phải chính xác với khối lượng cụ thể
- Steps phải rõ ràng, dễ follow
- Tích hợp sản phẩm tự nhiên (nguyên liệu, dụng cụ)
- Tất cả nội dung phải bằng {{language}}',
  '{
    "videoTitle": "Tiêu đề video",
    "videoDescription": "Mô tả video",
    "channelName": "Tên kênh",
    "platform": "Nền tảng",
    "transcript": "Nội dung video",
    "tone": "Giọng điệu (casual, professional, friendly)",
    "language": "Ngôn ngữ (vi, en)",
    "length": "Độ dài (short, medium, long)"
  }'::jsonb,
  true, -- is_system
  true, -- is_public
  true, -- is_active
  '2.0'  -- version
) ON CONFLICT (id) DO NOTHING;

-- 4. TECH TUTORIAL TEMPLATE
INSERT INTO templates (
  id,
  user_id,
  name,
  category,
  platform,
  description,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  version
) VALUES (
  gen_random_uuid(),
  NULL, -- System template
  'Hướng Dẫn Công Nghệ (Tech Tutorial)',
  'tech-tutorial',
  'facebook',
  'Template chuyên biệt cho video hướng dẫn công nghệ: setup, troubleshooting, tips & tricks với tích hợp sản phẩm tech gear.',
  'Bạn đang phân tích một video hướng dẫn công nghệ để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Tech Tutorial Analysis:**
   - Loại tutorial (Setup, Troubleshooting, Tips & Tricks, How-to)
   - Mục tiêu đạt được
   - Yêu cầu kỹ thuật
   - Độ khó (Beginner, Intermediate, Advanced)
   - Thời gian thực hiện

2. **Requirements & Tools:**
   - Phần cứng cần thiết
   - Phần mềm/apps cần cài
   - Kiến thức tiên quyết
   - Sản phẩm tech gear khuyến nghị

3. **Step-by-step Guide:**
   - Các bước thực hiện chi tiết
   - Screenshots/code examples (nếu có)
   - Troubleshooting tips
   - Alternative methods

4. **Tone và Style:**
   - Tone: {{tone}}
   - Ngôn ngữ: {{language}}
   - Độ dài: {{length}}
   - Chuyên nghiệp nhưng dễ hiểu

🎨 OUTPUT (JSON):

{
  "tutorial_title": "Tiêu đề hướng dẫn tech",
  "tutorial_type": "Setup|Troubleshooting|Tips & Tricks|How-to",
  "goal": "Mục tiêu của tutorial",
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimated_time": "Thời gian ước tính",
  "requirements": {
    "hardware": [
      {
        "item": "Thiết bị cần có",
        "specs": "Yêu cầu cấu hình",
        "recommended_product": "Sản phẩm khuyến nghị",
        "why": "Lý do chọn",
        "affiliate_link": ""
      }
    ],
    "software": [
      {
        "name": "Phần mềm/app",
        "version": "Phiên bản",
        "download_link": "Link tải",
        "is_free": true
      }
    ],
    "prerequisites": ["Kiến thức tiên quyết 1", "Kiến thức 2"]
  },
  "steps": [
    {
      "step_number": 1,
      "title": "Tiêu đề bước",
      "instruction": "Hướng dẫn chi tiết",
      "timestamp": "00:00",
      "code_example": "Code hoặc command (nếu có)",
      "screenshot_description": "Mô tả screenshot",
      "tips": ["Mẹo 1", "Mẹo 2"],
      "common_errors": ["Lỗi thường gặp và cách fix"]
    }
  ],
  "troubleshooting": [
    {
      "problem": "Vấn đề có thể gặp",
      "cause": "Nguyên nhân",
      "solution": "Cách giải quyết",
      "prevention": "Cách phòng tránh"
    }
  ],
  "tips_and_tricks": [
    "Mẹo tối ưu 1",
    "Mẹo tối ưu 2"
  ],
  "alternative_methods": [
    {
      "method": "Phương pháp thay thế",
      "pros": "Ưu điểm",
      "cons": "Nhược điểm",
      "when_to_use": "Khi nào nên dùng"
    }
  ],
  "recommended_products": [
    {
      "product": "Sản phẩm tech gear",
      "why": "Lý do khuyến nghị",
      "affiliate_link": ""
    }
  ],
  "summary": "Tóm tắt tutorial",
  "next_steps": "Bước tiếp theo sau tutorial này",
  "cta": "Lời kêu gọi hành động",
  "target_audience": ["Đối tượng 1", "Đối tượng 2"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

⚠️ LƯU Ý:
- Hướng dẫn phải chính xác, chi tiết
- Giải thích thuật ngữ kỹ thuật
- Cung cấp troubleshooting cho lỗi thường gặp
- Tích hợp sản phẩm tech gear tự nhiên
- Tất cả nội dung phải bằng {{language}}',
  '{
    "videoTitle": "Tiêu đề video",
    "videoDescription": "Mô tả video",
    "channelName": "Tên kênh",
    "platform": "Nền tảng",
    "transcript": "Nội dung video",
    "tone": "Giọng điệu (casual, professional, friendly)",
    "language": "Ngôn ngữ (vi, en)",
    "length": "Độ dài (short, medium, long)"
  }'::jsonb,
  true, -- is_system
  true, -- is_public
  true, -- is_active
  '2.0'  -- version
) ON CONFLICT (id) DO NOTHING;

-- 5. BEAUTY TUTORIAL TEMPLATE
INSERT INTO templates (
  id,
  user_id,
  name,
  category,
  platform,
  description,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  version
) VALUES (
  gen_random_uuid(),
  NULL, -- System template
  'Hướng Dẫn Làm Đẹp (Beauty Tutorial)',
  'beauty-tutorial',
  'facebook',
  'Template chuyên biệt cho video hướng dẫn makeup, skincare, haircare với tích hợp sản phẩm làm đẹp và mỹ phẩm.',
  'Bạn đang phân tích một video hướng dẫn làm đẹp để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Beauty Tutorial Analysis:**
   - Loại tutorial (Makeup, Skincare, Haircare, Nails)
   - Look/style cụ thể
   - Dịp sử dụng (Daily, Party, Wedding, v.v.)
   - Độ khó
   - Thời gian thực hiện

2. **Products & Tools:**
   - Sản phẩm làm đẹp sử dụng
   - Công cụ/dụng cụ cần thiết
   - Thương hiệu và sản phẩm cụ thể
   - Lý do chọn sản phẩm
   - Alternative options

3. **Step-by-step Guide:**
   - Prep skin/chuẩn bị
   - Các bước thực hiện
   - Techniques và tips
   - Common mistakes
   - Finishing touches

4. **Tone và Style:**
   - Tone: {{tone}}
   - Ngôn ngữ: {{language}}
   - Độ dài: {{length}}
   - Thân thiện, khuyến khích, inspiring

🎨 OUTPUT (JSON):

{
  "tutorial_title": "Tiêu đề beauty tutorial",
  "tutorial_type": "Makeup|Skincare|Haircare|Nails",
  "look_style": "Tên look/style (VD: Natural Makeup, Korean Glass Skin)",
  "occasion": "Dịp sử dụng (Daily, Party, Wedding, Office, v.v.)",
  "difficulty": "Dễ|Trung bình|Khó",
  "estimated_time": "Thời gian thực hiện",
  "skin_type_note": "Lưu ý cho loại da (nếu có)",
  "products_used": [
    {
      "category": "Skincare|Makeup|Haircare",
      "step": "Base|Eyes|Lips|Cheeks|v.v.",
      "items": [
        {
          "product_name": "Tên sản phẩm",
          "brand": "Thương hiệu",
          "shade_color": "Màu/tone (nếu có)",
          "why_this_product": "Lý do chọn",
          "alternative": "Sản phẩm thay thế",
          "price_range": "Khoảng giá",
          "affiliate_link": ""
        }
      ]
    }
  ],
  "tools_needed": [
    {
      "tool": "Công cụ (brush, sponge, v.v.)",
      "why_needed": "Lý do cần",
      "recommended_brand": "Thương hiệu khuyến nghị",
      "affiliate_link": ""
    }
  ],
  "prep_steps": [
    {
      "step": "Bước chuẩn bị",
      "description": "Mô tả chi tiết",
      "why_important": "Tại sao quan trọng"
    }
  ],
  "main_steps": [
    {
      "step_number": 1,
      "title": "Tiêu đề bước",
      "instruction": "Hướng dẫn chi tiết",
      "timestamp": "00:00",
      "products_in_step": ["Sản phẩm 1", "Sản phẩm 2"],
      "technique": "Kỹ thuật áp dụng",
      "tips": ["Mẹo 1", "Mẹo 2"],
      "visual_cue": "Dấu hiệu để biết đã đúng"
    }
  ],
  "pro_tips": [
    "Mẹo chuyên nghiệp 1",
    "Mẹo chuyên nghiệp 2"
  ],
  "common_mistakes": [
    {
      "mistake": "Lỗi thường gặp",
      "why_happens": "Tại sao xảy ra",
      "how_to_fix": "Cách khắc phục",
      "how_to_avoid": "Cách phòng tránh"
    }
  ],
  "variations": [
    {
      "variation": "Biến thể của look",
      "how_to": "Cách thực hiện",
      "when_to_use": "Khi nào nên dùng"
    }
  ],
  "longevity_tips": "Mẹo giữ makeup/look lâu hơn",
  "removal_care": "Hướng dẫn tẩy trang/chăm sóc sau",
  "summary": "Tóm tắt về tutorial",
  "final_result": "Mô tả kết quả cuối cùng",
  "cta": "Lời kêu gọi hành động",
  "target_audience": ["Đối tượng 1", "Đối tượng 2"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

⚠️ LƯU Ý:
- Chính xác về tên sản phẩm, thương hiệu, shade/màu
- Giải thích techniques rõ ràng
- Cung cấp alternatives cho các budgets khác nhau
- Tích hợp sản phẩm tự nhiên trong tutorial
- Tất cả nội dung phải bằng {{language}}',
  '{
    "videoTitle": "Tiêu đề video",
    "videoDescription": "Mô tả video",
    "channelName": "Tên kênh",
    "platform": "Nền tảng",
    "transcript": "Nội dung video",
    "tone": "Giọng điệu (casual, professional, friendly)",
    "language": "Ngôn ngữ (vi, en)",
    "length": "Độ dài (short, medium, long)"
  }'::jsonb,
  true, -- is_system
  true, -- is_public
  true, -- is_active
  '2.0'  -- version
) ON CONFLICT (id) DO NOTHING;

-- Verify insertion
SELECT
  id,
  name,
  category,
  platform,
  description,
  is_system,
  is_public,
  is_active,
  version,
  created_at
FROM templates
WHERE category IN ('comparison', 'unboxing', 'cooking-tutorial', 'tech-tutorial', 'beauty-tutorial')
ORDER BY category;

-- Display summary of all templates
SELECT
  category,
  COUNT(*) as count,
  STRING_AGG(name, ', ') as template_names
FROM templates
WHERE is_active = true AND is_system = true
GROUP BY category
ORDER BY category;
