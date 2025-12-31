-- =====================================================
-- INSERT FACEBOOK PRODUCT REVIEW TEMPLATE - TỐI ƯU
-- =====================================================
-- Template tối ưu nhất cho review sản phẩm trên Facebook

INSERT INTO prompt_templates (
  name,
  description,
  category,
  platform,
  content_type,
  config,
  prompt_template,
  variables,
  example_output,
  is_system,
  is_public,
  is_active,
  version,
  role_instruction,
  objective,
  example_input,
  constraints,
  ai_parameters,
  feedback_instructions,
  additional_notes,
  is_archived
) VALUES (
  'facebook_product_review_optimized',
  'Template tối ưu để tạo bài review sản phẩm trên Facebook - Casual, dễ đọc, không icon/ký tự đặc biệt',
  'general',
  'facebook',
  'review',
  -- CONFIG JSON
  '{
    "tone": "casual",
    "length": "medium",
    "language": "vi",
    "structure": {
      "hook": true,
      "intro": true,
      "summary": true,
      "mainContent": true,
      "pros": true,
      "cons": true,
      "keyPoints": true,
      "comparison": true,
      "targetAudience": true,
      "callToAction": true,
      "seoKeywords": true
    },
    "emojiUsage": "none",
    "hashtagCount": 5,
    "seoOptimized": true,
    "includeTimestamps": true,
    "toneOptions": ["Chuyên nghiệp", "Tự nhiên", "Thân thiện", "Thoải mái", "Có thẩm quyền"],
    "languageOptions": ["vi", "en"],
    "lengthOptions": ["short", "medium", "long"]
  }'::jsonb,

  -- PROMPT TEMPLATE
  'Bạn là chuyên gia phân tích review sản phẩm cho Facebook. Phân tích video sau và tạo bài viết review hấp dẫn.

VIDEO INFO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Platform: {{platform}}
- Kênh: {{channelName}}
- Transcript: {{transcript}}

YÊU CẦU OUTPUT:
Tạo bài review sản phẩm cho Facebook với độ dài 500-700 từ, tone {{tone}}, ngôn ngữ {{language}}.

CẤU TRÚC BÀI VIẾT:

1. HOOK (1-2 câu thu hút)
Câu mở đầu hấp dẫn, tạo tò mò về sản phẩm

2. SUMMARY (3-5 câu)
Tóm tắt video, giới thiệu sản phẩm một cách súc tích

3. NỘI DUNG CHÍNH (300-400 từ)
Phân tích chi tiết sản phẩm dựa trên video:
- Đặc điểm nổi bật
- Trải nghiệm sử dụng
- So sánh với thị trường

4. ƯU ĐIỂM (5 điểm)
Liệt kê 5 ưu điểm chính với giải thích cụ thể

5. NHƯỢC ĐIỂM (3 điểm)
Liệt kê 3 nhược điểm hoặc điểm cần lưu ý (trung thực)

6. ĐIỂM NỔI BẬT (4-5 điểm với timestamp)
Format: [XX:XX] - Nội dung key point

7. BẢNG SO SÁNH
So sánh với 2-3 sản phẩm đối thủ trên thị trường Việt Nam
- Tên sản phẩm chính xác từ title
- Giá cả thực tế (VNĐ)
- 5-7 tiêu chí: Giá, Tính năng, Chất liệu, Bảo hành, Đánh giá

8. ĐỐI TƯỢNG PHÙ HỢP (3 nhóm)
Mỗi nhóm bao gồm: độ tuổi, mức thu nhập, nhu cầu cụ thể

9. CALL TO ACTION (1-2 câu)
Khuyến khích hành động mua hàng

10. SEO KEYWORDS (5 từ khóa)
- Tên sản phẩm chính xác
- Từ khóa review/đánh giá
- Từ khóa mua hàng/giá
- Từ khóa so sánh
- Từ khóa thương hiệu

QUY TẮC QUAN TRỌNG:
- Viết bằng {{language}} tự nhiên, dễ hiểu
- Tone: {{tone}}
- KHÔNG sử dụng emoji, icon, ký tự đặc biệt
- KHÔNG sử dụng markdown syntax (**, ##, •, -, *, >)
- Chỉ dùng text thuần, ngắt dòng để format
- Tập trung giá trị thực tế cho người mua
- Khách quan, không phóng đại
- Nếu không có transcript, suy luận từ tiêu đề và mô tả

OUTPUT FORMAT: JSON
{
  "hook": "string - Câu mở đầu hấp dẫn (1-2 câu)",
  "summary": "string - Tóm tắt (3-5 câu)",
  "mainContent": "string - Nội dung chính phân tích chi tiết (300-400 từ, text thuần, không icon/markdown)",
  "pros": [
    "string - Ưu điểm 1 với giải thích",
    "string - Ưu điểm 2 với giải thích",
    "string - Ưu điểm 3 với giải thích",
    "string - Ưu điểm 4 với giải thích",
    "string - Ưu điểm 5 với giải thích"
  ],
  "cons": [
    "string - Nhược điểm 1",
    "string - Nhược điểm 2",
    "string - Nhược điểm 3"
  ],
  "keyPoints": [
    {"time": "00:30", "content": "string - Key point 1"},
    {"time": "02:15", "content": "string - Key point 2"},
    {"time": "05:00", "content": "string - Key point 3"},
    {"time": "08:30", "content": "string - Key point 4"}
  ],
  "comparisonTable": {
    "headers": ["Tiêu chí", "Sản phẩm chính (từ title)", "Đối thủ 1 (tên cụ thể)", "Đối thủ 2 (tên cụ thể)"],
    "rows": [
      ["Giá cả", "1.500.000 VNĐ", "1.200.000 VNĐ", "1.800.000 VNĐ"],
      ["Công suất/Tính năng chính", "40W", "30W", "50W"],
      ["Dung tích/Kích thước", "800ml", "700ml", "1000ml"],
      ["Chất liệu", "Nhựa PP cao cấp", "Nhựa ABS", "Thủy tinh"],
      ["Tính năng đặc biệt", "Tự động đảo chiều", "Chống giọt", "Vắt 2 chiều"],
      ["Bảo hành", "12 tháng", "24 tháng", "12 tháng"],
      ["Đánh giá", "4.5/5 sao", "4.3/5 sao", "4.7/5 sao"]
    ]
  },
  "targetAudience": [
    "string - Nhóm 1: Độ tuổi 25-35, thu nhập 10-15 triệu/tháng, cần giải pháp X cho Y",
    "string - Nhóm 2: Độ tuổi 35-45, thu nhập 15-25 triệu/tháng, quan tâm đến Z",
    "string - Nhóm 3: Độ tuổi 18-25, sinh viên/nhân viên văn phòng, ngân sách hạn chế nhưng cần chất lượng"
  ],
  "cta": "string - Call to action hấp dẫn (1-2 câu khuyến khích mua ngay)",
  "seoKeywords": [
    "string - Tên sản phẩm chính xác",
    "string - Review/Đánh giá sản phẩm",
    "string - Mua/Giá sản phẩm",
    "string - So sánh với đối thủ",
    "string - Thương hiệu"
  ]
}',

  -- VARIABLES JSON
  '{
    "videoTitle": {
      "name": "videoTitle",
      "description": "Tiêu đề video",
      "required": true,
      "type": "string",
      "example": "Review Máy Xay Sinh Tố ABC 2024"
    },
    "videoDescription": {
      "name": "videoDescription",
      "description": "Mô tả video",
      "required": false,
      "type": "string",
      "example": "Đánh giá chi tiết máy xay sinh tố..."
    },
    "platform": {
      "name": "platform",
      "description": "Nền tảng video",
      "required": true,
      "type": "string",
      "example": "youtube"
    },
    "channelName": {
      "name": "channelName",
      "description": "Tên kênh",
      "required": false,
      "type": "string",
      "example": "Tech Review VN"
    },
    "transcript": {
      "name": "transcript",
      "description": "Transcript của video",
      "required": false,
      "type": "text",
      "example": "Xin chào mọi người, hôm nay mình sẽ review..."
    },
    "tone": {
      "name": "tone",
      "description": "Giọng điệu bài viết",
      "required": true,
      "type": "select",
      "options": ["Chuyên nghiệp", "Tự nhiên", "Thân thiện", "Thoải mái", "Có thẩm quyền"],
      "default": "Tự nhiên"
    },
    "language": {
      "name": "language",
      "description": "Ngôn ngữ viết",
      "required": true,
      "type": "select",
      "options": ["vi", "en"],
      "default": "vi"
    }
  }'::jsonb,

  -- EXAMPLE OUTPUT
  '{
    "hook": "Bạn đang tìm một chiếc máy xay sinh tố giá rẻ mà vẫn xay mịn? Đây có thể là câu trả lời!",
    "summary": "Máy xay sinh tố ABC vừa ra mắt với giá chỉ 1.5 triệu đồng nhưng công suất lên đến 40W. Sau 2 tuần sử dụng, mình thấy máy xay khá mịn, thiết kế đẹp và dễ vệ sinh. Tuy nhiên cũng có vài điểm cần lưu ý mà mình sẽ chia sẻ trong bài này.",
    "mainContent": "Nội dung phân tích chi tiết sẽ được AI tạo ở đây",
    "pros": ["Giá cả phải chăng", "Công suất mạnh", "Thiết kế đẹp", "Dễ vệ sinh", "Bảo hành tốt"],
    "cons": ["Hơi ồn khi xay đá", "Dung tích nhỏ", "Chất liệu nhựa"],
    "keyPoints": [{"time": "02:30", "content": "Test xay sinh tố dâu"}],
    "comparisonTable": {
      "headers": ["Tiêu chí", "ABC", "Đối thủ 1", "Đối thủ 2"],
      "rows": [
        ["Giá", "1.5tr", "1.2tr", "1.8tr"],
        ["Công suất", "40W", "30W", "50W"]
      ]
    },
    "targetAudience": ["Gia đình trẻ 25-35 tuổi"],
    "cta": "Nếu bạn đang tìm máy xay giá rẻ chất lượng tốt, ABC là lựa chọn đáng cân nhắc!",
    "seoKeywords": ["Máy xay sinh tố ABC", "Review máy xay", "Giá máy xay", "So sánh máy xay", "Máy xay tốt"]
  }'::jsonb,

  -- FLAGS
  true,  -- is_system
  true,  -- is_public
  true,  -- is_active
  1.0,   -- version

  -- ROLE INSTRUCTION
  'Bạn là chuyên gia phân tích review sản phẩm, viết bài Facebook casual, dễ đọc, không dùng icon/markdown.',

  -- OBJECTIVE
  '{
    "primary": "Tạo bài review sản phẩm hấp dẫn cho Facebook",
    "secondary": "Cung cấp thông tin khách quan, giúp người đọc quyết định mua hàng",
    "format": "JSON structured data, text thuần không icon/markdown"
  }'::jsonb,

  -- EXAMPLE INPUT
  '{
    "videoTitle": "Review Máy Xay Sinh Tố Philips HR2222 - Có Đáng Mua?",
    "platform": "youtube",
    "transcript": "Xin chào mọi người...",
    "tone": "Tự nhiên",
    "language": "vi"
  }'::jsonb,

  -- CONSTRAINTS
  '{
    "must_do": [
      "Viết text thuần, dễ đọc",
      "Khách quan, trung thực",
      "Cung cấp so sánh cụ thể",
      "Include giá cả và value proposition"
    ],
    "dont_do": [
      "KHÔNG dùng emoji hoặc icon đặc biệt",
      "KHÔNG dùng markdown syntax (**, ##, •, -, *)",
      "KHÔNG phóng đại quá mức",
      "KHÔNG thiếu bất kỳ field nào trong JSON output"
    ]
  }'::jsonb,

  -- AI PARAMETERS
  '{
    "temperature": 0.7,
    "top_p": 0.9,
    "max_tokens": 3000,
    "presence_penalty": 0.0,
    "frequency_penalty": 0.0
  }'::jsonb,

  -- FEEDBACK INSTRUCTIONS
  'Nếu output thiếu field hoặc không đúng format JSON, hãy yêu cầu AI tạo lại với đầy đủ fields.',

  -- ADDITIONAL NOTES
  'Template này tối ưu cho Facebook, focus vào readability và engagement. Dùng cho video review sản phẩm bất kỳ.',

  -- IS ARCHIVED
  false
);

-- Verify template đã được insert
SELECT
  id,
  name,
  platform,
  content_type,
  is_active,
  created_at
FROM prompt_templates
WHERE name = 'facebook_product_review_optimized';
