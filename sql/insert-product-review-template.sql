-- Insert Product Review Template (Default)
-- This is the default template for product reviews from videos

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
  'Facebook Product Review Optimized',
  'product-review',
  'Template mặc định để tạo review sản phẩm từ video cho Facebook. Tối ưu hóa cho engagement và conversion.',
  -- PROMPT TEMPLATE
  'Bạn đang phân tích một video review sản phẩm để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Phân tích Sản phẩm:**
   - Tên sản phẩm và thương hiệu
   - Tính năng chính
   - Ưu điểm nổi bật
   - Nhược điểm (nếu có)
   - Đối tượng phù hợp

2. **Tone và Style:**
   - Tone: {{tone}}
   - Ngôn ngữ: {{language}}
   - Độ dài: {{length}}
   - Tự nhiên, chân thực, khách quan

3. **SEO Optimization:**
   - Tạo 5 keywords liên quan đến sản phẩm
   - Target audience cụ thể

4. **Call-to-Action:**
   - Khuyến khích người đọc tìm hiểu thêm
   - Không quá aggressive, tự nhiên

🎨 OUTPUT YÊU CẦU:

Trả về JSON với cấu trúc sau:

{
  "summary": "Tóm tắt ngắn gọn về sản phẩm và review (2-3 câu)",
  "pros": [
    "Ưu điểm 1 - Mô tả chi tiết",
    "Ưu điểm 2 - Mô tả chi tiết",
    "Ưu điểm 3 - Mô tả chi tiết"
  ],
  "cons": [
    "Nhược điểm 1 - Mô tả chi tiết (nếu có)",
    "Nhược điểm 2 - Mô tả chi tiết (nếu có)"
  ],
  "keyPoints": [
    {
      "time": "00:30",
      "content": "Điểm nổi bật 1"
    },
    {
      "time": "02:15",
      "content": "Điểm nổi bật 2"
    }
  ],
  "mainContent": "Nội dung review chi tiết, bao gồm:\n- Giới thiệu sản phẩm\n- Trải nghiệm sử dụng\n- So sánh với sản phẩm tương tự\n- Đánh giá tổng quan\n\nViết dạng markdown, dễ đọc, có cấu trúc rõ ràng.",
  "cta": "Lời kêu gọi hành động tự nhiên (VD: Bạn nghĩ sao về sản phẩm này? Chia sẻ ý kiến nhé!)",
  "targetAudience": [
    "Đối tượng 1 (VD: Người yêu công nghệ)",
    "Đối tượng 2 (VD: Người cần nâng cấp thiết bị)"
  ],
  "seoKeywords": [
    "keyword1",
    "keyword2",
    "keyword3",
    "keyword4",
    "keyword5"
  ]
}

⚠️ LƯU Ý:
- Tất cả nội dung phải bằng {{language}}
- Tone phải {{tone}}
- Độ dài {{length}}
- Chân thực, khách quan, không quá PR
- Key points phải có timestamp từ video',

  -- VARIABLES
  '{
    "videoTitle": "Tiêu đề video",
    "videoDescription": "Mô tả video",
    "channelName": "Tên kênh",
    "platform": "Nền tảng (YouTube, TikTok)",
    "transcript": "Nội dung video (transcript hoặc summary)",
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
  is_active
FROM templates
WHERE category = 'product-review'
ORDER BY created_at DESC
LIMIT 1;
