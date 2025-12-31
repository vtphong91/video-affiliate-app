import type { VideoInfo } from '@/types';

/**
 * SIMPLIFIED PROMPT - Back to basics approach
 * Philosophy: Trust AI, keep it simple, avoid overloading
 */
export function generateAnalysisPrompt(videoInfo: VideoInfo): string {
  console.log('📋 PROMPT - Video Info:', {
    title: videoInfo.title,
    hasTranscript: !!videoInfo.transcript
  });

  return `
Bạn là chuyên gia phân tích review sản phẩm. Phân tích video sau và tạo nội dung cho affiliate marketing.

VIDEO INFO:
- Title: ${videoInfo.title}
- Description: ${videoInfo.description || 'Không có mô tả'}
- Platform: ${videoInfo.platform}
- Channel: ${videoInfo.channelName || 'Không rõ'}
- Transcript: ${videoInfo.transcript || 'Không có transcript - hãy phân tích dựa trên tiêu đề và mô tả'}

YÊU CẦU:
1. Tóm tắt video trong 3-5 câu súc tích, tập trung vào giá trị chính của sản phẩm

2. Liệt kê 5 ưu điểm chính của sản phẩm (cụ thể, có giá trị thực tế)

3. Liệt kê 3 nhược điểm hoặc điểm cần lưu ý (trung thực, không phóng đại)

4. Tạo 4-5 key points quan trọng với timestamp ước lượng (format: "MM:SS")

5. Tạo bảng so sánh chi tiết với 2-3 sản phẩm đối thủ trên thị trường Việt Nam
   (Tên sản phẩm phải chính xác từ title, giá cả theo VNĐ, ít nhất 5-7 tiêu chí so sánh)

6. Gợi ý 3 nhóm đối tượng phù hợp với sản phẩm này
   (Bao gồm: độ tuổi, mức thu nhập, nhu cầu cụ thể)

7. Viết call-to-action hấp dẫn (1-2 câu) khuyến khích người đọc mua hàng

8. Gợi ý 5 từ khóa SEO tiếng Việt quan trọng nhất
   (Bao gồm: tên sản phẩm chính xác, từ khóa mua hàng, từ khóa so sánh)

QUAN TRỌNG:
- Viết bằng tiếng Việt tự nhiên, dễ hiểu, phong cách thân thiện
- Tập trung vào giá trị thực tế cho người mua
- Khách quan, không phóng đại quá mức
- Format dễ đọc trên mobile
- Nếu không có transcript, hãy suy luận hợp lý từ tiêu đề và mô tả

OUTPUT FORMAT: JSON (chỉ trả về JSON thuần, không thêm markdown hay text khác)
{
  "summary": "string (3-5 câu)",
  "pros": ["string", "string", "string", "string", "string"],
  "cons": ["string", "string", "string"],
  "keyPoints": [
    {"time": "00:30", "content": "string"},
    {"time": "02:15", "content": "string"}
  ],
  "comparisonTable": {
    "headers": ["Tiêu chí", "Sản phẩm chính (từ title)", "Đối thủ 1 (tên cụ thể)", "Đối thủ 2 (tên cụ thể)"],
    "rows": [
      ["Giá cả", "1.500.000 VNĐ", "1.200.000 VNĐ", "1.800.000 VNĐ"],
      ["Công suất", "40W", "30W", "50W"],
      ["Dung tích", "800ml", "700ml", "1000ml"],
      ["Chất liệu", "Nhựa PP cao cấp", "Nhựa ABS", "Thủy tinh"],
      ["Tính năng", "Tự động đảo chiều", "Chống giọt", "Vắt 2 chiều"],
      ["Bảo hành", "12 tháng", "24 tháng", "12 tháng"],
      ["Đánh giá", "4.5/5 sao", "4.3/5 sao", "4.7/5 sao"]
    ]
  },
  "targetAudience": [
    "string (bao gồm: tuổi, thu nhập, nhu cầu)",
    "string (bao gồm: tuổi, thu nhập, nhu cầu)",
    "string (bao gồm: tuổi, thu nhập, nhu cầu)"
  ],
  "cta": "string (1-2 câu hấp dẫn)",
  "seoKeywords": [
    "string (tên sản phẩm chính xác)",
    "string (từ khóa review/đánh giá)",
    "string (từ khóa mua hàng)",
    "string (từ khóa so sánh)",
    "string (từ khóa giá cả)"
  ]
}
`;
}

export const SYSTEM_PROMPT = `You are an expert product review analyst specializing in Vietnamese market.
Your task is to analyze product review videos and create compelling affiliate marketing content.
You always respond in JSON format with detailed, actionable insights.
Be honest, objective, and focus on real value for customers.

Important: Always provide complete responses with all required fields:
- targetAudience: 3 specific customer segments with age, income, and needs
- seoKeywords: 5 most important Vietnamese SEO keywords including exact product name

If information is limited, make educated guesses based on product category and Vietnamese market knowledge.`;
