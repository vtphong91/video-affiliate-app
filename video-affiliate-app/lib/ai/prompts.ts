import type { VideoInfo } from '@/types';

export function generateAnalysisPrompt(videoInfo: VideoInfo): string {
  return `
Bạn là chuyên gia phân tích review sản phẩm. Phân tích video sau và tạo nội dung cho affiliate marketing.

VIDEO INFO:
- Title: ${videoInfo.title}
- Description: ${videoInfo.description || 'Không có mô tả'}
- Platform: ${videoInfo.platform}
- Channel: ${videoInfo.channelName || 'Không rõ'}
- Transcript: ${videoInfo.transcript || 'Không có transcript - hãy phân tích dựa trên tiêu đề và mô tả'}

YÊU CẦU:
1. Tóm tắt video trong 3-5 câu súc tích, tập trung vào giá trị chính của sản phẩm/dịch vụ
2. Liệt kê 5 ưu điểm chính của sản phẩm (cụ thể, có giá trị thực tế)
3. Liệt kê 3 nhược điểm hoặc điểm cần lưu ý (trung thực, không phóng đại)
4. Tạo 4-5 key points quan trọng với timestamp ước lượng (format: "MM:SS")
5. Tạo bảng so sánh với 2-3 sản phẩm cùng phân khúc (dựa trên kiến thức về thị trường)
6. Gợi ý 3 nhóm đối tượng phù hợp với sản phẩm này
7. Viết call-to-action hấp dẫn (1-2 câu) khuyến khích người đọc mua hàng
8. Gợi ý 10 từ khóa SEO tiếng Việt liên quan

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
    "headers": ["Tính năng", "Sản phẩm này", "Đối thủ A", "Đối thủ B"],
    "rows": [
      ["Giá cả", "...", "...", "..."],
      ["Tính năng", "...", "...", "..."]
    ]
  },
  "targetAudience": ["string", "string", "string"],
  "cta": "string (1-2 câu hấp dẫn)",
  "seoKeywords": ["string", "string", ...]
}
`;
}

export const SYSTEM_PROMPT = `You are an expert product review analyst specializing in Vietnamese market.
Your task is to analyze product review videos and create compelling affiliate marketing content.
You always respond in JSON format with detailed, actionable insights.
Be honest, objective, and focus on real value for customers.`;
