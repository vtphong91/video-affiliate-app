-- Insert Tutorial/How-to Template
-- This template generates tutorial content with natural product placement
-- Compatible with existing reviews table through transformation

INSERT INTO templates (
  id,
  name,
  category,
  description,
  prompt_template,
  variables,
  is_active,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Tutorial/How-to với Product Placement',
  'tutorial',
  'Template để tạo nội dung hướng dẫn (Tutorial/How-to) từ video với tích hợp sản phẩm affiliate một cách tự nhiên. Phù hợp với video nấu ăn, DIY, công nghệ, làm đẹp, v.v.',
  -- PROMPT TEMPLATE (với variable substitution)
  'Bạn đang phân tích một video hướng dẫn (Tutorial/How-to) để tạo nội dung cho Facebook với tích hợp affiliate links.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Phân tích Video:**
   - Xác định mục tiêu chính của hướng dẫn
   - Liệt kê tất cả vật liệu/sản phẩm được sử dụng
   - Tách thành các bước chi tiết
   - Ghi chú các mẹo và lỗi thường gặp

2. **Product Placement Strategy:**
   - Natural Integration: Đề cập sản phẩm tự nhiên trong hướng dẫn
   - Value-added: Giải thích tại sao dùng sản phẩm này (chất lượng, giá, hiệu quả)
   - Multiple Products: Tìm cơ hội đề cập nhiều sản phẩm khác nhau

3. **Cấu trúc Tutorial:**
   - Tiêu đề hấp dẫn (bao gồm từ khóa SEO)
   - Mục tiêu rõ ràng
   - Độ khó và thời gian thực hiện
   - Danh sách vật liệu với link affiliate (nếu có trong {{affiliateLinks}})
   - Các bước chi tiết với timestamp
   - Mẹo và thủ thuật
   - Lỗi thường gặp và cách tránh
   - Kết quả cuối cùng
   - Call-to-action

4. **Tone và Style:**
   - Tone: {{tone}}
   - Ngôn ngữ: {{language}}
   - Độ dài: {{length}}
   - Dễ hiểu, thân thiện, khuyến khích người đọc thực hành

5. **SEO Optimization:**
   - Tạo 5 keywords liên quan đến chủ đề tutorial
   - Target audience cụ thể (người mới bắt đầu, người có kinh nghiệm, v.v.)

🎨 OUTPUT YÊU CẦU:

Trả về JSON với cấu trúc CHÍNH XÁC sau đây:

{
  "tutorial_title": "Tiêu đề tutorial hấp dẫn với keywords",
  "goal_statement": "Mô tả ngắn gọn mục tiêu của tutorial này",
  "difficulty": "Dễ" HOẶC "Trung bình" HOẶC "Khó",
  "time_estimate": "Ước tính thời gian (VD: 30 phút, 1-2 giờ)",
  "materials_needed": [
    {
      "item_name": "Tên vật liệu/sản phẩm cụ thể",
      "quantity": "Số lượng cần dùng",
      "why_this_product": "Giải thích tại sao dùng sản phẩm này (ưu điểm, lợi ích)",
      "affiliate_link": "Link affiliate nếu có trong danh sách được cung cấp",
      "recommended_brands": ["Thương hiệu 1", "Thương hiệu 2"]
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "title": "Tiêu đề bước ngắn gọn",
      "description": "Mô tả chi tiết cách thực hiện bước này",
      "timestamp": "Thời điểm trong video (VD: 02:30)",
      "tips": ["Mẹo giúp thực hiện tốt hơn"],
      "products_used": ["Tên sản phẩm được dùng trong bước này"]
    }
  ],
  "tips_and_tricks": [
    "Mẹo hữu ích 1",
    "Mẹo hữu ích 2",
    "Thủ thuật giúp đạt kết quả tốt hơn"
  ],
  "common_mistakes": [
    {
      "mistake": "Lỗi thường gặp",
      "why_it_happens": "Tại sao lỗi này hay xảy ra",
      "how_to_avoid": "Cách tránh/khắc phục lỗi"
    }
  ],
  "final_result": "Mô tả kết quả cuối cùng khi hoàn thành tutorial",
  "cta": "Lời kêu gọi hành động (khuyến khích thử, chia sẻ, đặt câu hỏi)",
  "target_audience": ["Đối tượng 1", "Đối tượng 2"],
  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}

⚠️ LƯU Ý QUAN TRỌNG:
- Tất cả nội dung phải bằng {{language}}
- Đảm bảo materials_needed có đủ thông tin để đề xuất sản phẩm
- Mỗi step phải có timestamp tương ứng với video
- Products trong materials_needed phải được đề cập trong steps
- Affiliate links phải được tích hợp tự nhiên, không spam
- Tone phải {{tone}}, phù hợp với đối tượng mục tiêu',

  -- VARIABLES (JSON object defining what variables are needed)
  '{
    "videoTitle": "Tiêu đề video",
    "videoDescription": "Mô tả video",
    "channelName": "Tên kênh",
    "platform": "Nền tảng (YouTube, TikTok)",
    "transcript": "Nội dung video (transcript hoặc summary)",
    "affiliateLinks": "Danh sách link affiliate có sẵn",
    "tone": "Giọng điệu (casual, professional, friendly)",
    "language": "Ngôn ngữ (vi, en)",
    "length": "Độ dài mong muốn (short, medium, long)"
  }'::jsonb,

  true, -- is_active
  NOW(),
  NOW()
);

-- Verify insertion
SELECT
  id,
  name,
  category,
  description,
  is_active,
  created_at
FROM templates
WHERE category = 'tutorial'
ORDER BY created_at DESC
LIMIT 1;
