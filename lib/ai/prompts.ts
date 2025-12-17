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
5. Tạo bảng so sánh CHI TIẾT với 2-3 sản phẩm đối thủ CỤ THỂ trên thị trường Việt Nam:
   - Phải ghi rõ TÊN THƯƠNG HIỆU và TÊN SẢN PHẨM cụ thể (VD: "Philips HR2744", "Panasonic MJ-DJ01", không viết "Brand A", "Đối thủ A")
   - Giá cả phải có mức giá ước lượng thực tế theo VNĐ (VD: "1.200.000 VNĐ", không viết "Around 1,200,000 VND")
   - So sánh ít nhất 5-7 tiêu chí: Giá cả, Công suất, Dung tích, Chất liệu, Tính năng nổi bật, Bảo hành, Điểm đánh giá
   - Dữ liệu phải dựa trên kiến thức thực tế về thị trường Việt Nam
6. Gợi ý 3 nhóm đối tượng phù hợp với sản phẩm này
7. Viết call-to-action hấp dẫn (1-2 câu) khuyến khích người đọc mua hàng
8. Gợi ý 10 từ khóa SEO tiếng Việt liên quan

VÍ DỤ BẢNG SO SÁNH TỐT:
- Header: ["Tiêu chí", "LocknLock EJM311", "Philips HR2744", "Panasonic MJ-DJ01"]
- Row giá: ["Giá cả", "1.500.000 VNĐ", "Philips HR2744: 1.200.000 VNĐ", "Panasonic MJ-DJ01: 1.800.000 VNĐ"]
- KHÔNG ĐƯỢC viết: ["Giá cả", "Around 1,500,000 VND", "Brand A: Around 1,200,000 VND", "Đối thủ B: Around 1,800,000 VND"]

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
    "headers": ["Tiêu chí", "Sản phẩm này", "Đối thủ 1 (Tên cụ thể)", "Đối thủ 2 (Tên cụ thể)"],
    "rows": [
      ["Giá cả", "1.500.000 VNĐ", "Philips HR2744: 1.200.000 VNĐ", "Panasonic MJ-DJ01: 1.800.000 VNĐ"],
      ["Công suất", "40W", "Philips HR2744: 30W", "Panasonic MJ-DJ01: 50W"],
      ["Dung tích", "800ml", "Philips HR2744: 700ml", "Panasonic MJ-DJ01: 1000ml"],
      ["Chất liệu", "Nhựa PP cao cấp", "Philips HR2744: Nhựa ABS", "Panasonic MJ-DJ01: Thủy tinh"],
      ["Tính năng", "Tự động đảo chiều, chống tràn", "Philips HR2744: Chống giọt", "Panasonic MJ-DJ01: Vắt 2 chiều"],
      ["Bảo hành", "12 tháng", "Philips HR2744: 24 tháng", "Panasonic MJ-DJ01: 12 tháng"],
      ["Đánh giá", "4.5/5 sao", "Philips HR2744: 4.3/5 sao", "Panasonic MJ-DJ01: 4.7/5 sao"]
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
