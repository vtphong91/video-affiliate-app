import type { VideoInfo } from '@/types';

export function generateAnalysisPrompt(videoInfo: VideoInfo): string {
  // Log để debug
  console.log('📋 PROMPT - Video Info được truyền vào:', {
    title: videoInfo.title,
    descriptionPreview: videoInfo.description?.substring(0, 150),
    hasTranscript: !!videoInfo.transcript,
    transcriptPreview: videoInfo.transcript?.substring(0, 150)
  });

  return `
Bạn là chuyên gia phân tích review sản phẩm. Phân tích video sau và tạo nội dung cho affiliate marketing.

VIDEO INFO:
- Title: ${videoInfo.title}
- Description: ${videoInfo.description || 'Không có mô tả'}
- Platform: ${videoInfo.platform}
- Channel: ${videoInfo.channelName || 'Không rõ'}
- Transcript: ${videoInfo.transcript || 'Không có transcript - hãy phân tích dựa trên tiêu đề và mô tả'}

⚠️ QUY TẮC TRÍCH XUẤT THÔNG TIN SẢN PHẨM:
1. Đọc KỸ Title và Description để xác định CHÍNH XÁC tên sản phẩm và mã model
2. Tên sản phẩm phải TRÍCH XUẤT NGUYÊN VĂN từ video, KHÔNG ĐƯỢC tự bịa ra hoặc thay đổi
3. Nếu video đề cập "Lock&Lock EJJ231" thì phải ghi ĐÚNG "Lock&Lock EJJ231", KHÔNG được đổi thành "LocknLock EJM311"
4. Nếu có nhiều tên trong Title/Description, ưu tiên tên xuất hiện đầu tiên hoặc trong phần chính
5. Nếu không tìm thấy mã model chính xác, ghi tên thương hiệu + loại sản phẩm (VD: "Lock&Lock Máy Vắt Cam")

YÊU CẦU:
1. Tóm tắt video trong 3-5 câu súc tích, tập trung vào giá trị chính của sản phẩm/dịch vụ
2. Liệt kê 5 ưu điểm chính của sản phẩm (cụ thể, có giá trị thực tế)
3. Liệt kê 3 nhược điểm hoặc điểm cần lưu ý (trung thực, không phóng đại)
4. Tạo 4-5 key points quan trọng với timestamp ước lượng (format: "MM:SS")
5. Tạo bảng so sánh CHI TIẾT với 2-3 sản phẩm đối thủ CỤ THỂ trên thị trường Việt Nam:
   - Cột đầu tiên phải dùng TÊN SẢN PHẨM CHÍNH XÁC đã trích xuất từ Title/Description (KHÔNG được tự bịa)
   - Các cột đối thủ phải ghi rõ TÊN THƯƠNG HIỆU và TÊN SẢN PHẨM cụ thể (VD: "Philips HR2744", "Panasonic MJ-DJ01", không viết "Brand A", "Đối thủ A")
   - Giá cả phải có mức giá ước lượng thực tế theo VNĐ (VD: "1.200.000 VNĐ", không viết "Around 1,200,000 VND")
   - So sánh ít nhất 5-7 tiêu chí: Giá cả, Công suất, Dung tích, Chất liệu, Tính năng nổi bật, Bảo hành, Điểm đánh giá
   - Dữ liệu phải dựa trên kiến thức thực tế về thị trường Việt Nam
6. Gợi ý 3 nhóm đối tượng phù hợp với sản phẩm này
7. Viết call-to-action hấp dẫn (1-2 câu) khuyến khích người đọc mua hàng
8. Gợi ý 10 từ khóa SEO tiếng Việt liên quan

VÍ DỤ BẢNG SO SÁNH TỐT (giả sử video review "Lock&Lock EJJ231"):
✅ ĐÚNG - Trích xuất chính xác từ video:
- Header: ["Tiêu chí", "Lock&Lock EJJ231", "Philips HR2744", "Panasonic MJ-DJ01"]
- Row giá: ["Giá cả", "1.500.000 VNĐ", "1.200.000 VNĐ", "1.800.000 VNĐ"]

❌ SAI - Tự bịa tên sản phẩm khác với video:
- Header: ["Tiêu chí", "LocknLock EJM311", "Brand A", "Đối thủ B"]
- Row giá: ["Giá cả", "Around 1,500,000 VND", "Around 1,200,000 VND", "Around 1,800,000 VND"]

⚠️ LƯU Ý: Tên sản phẩm trong cột đầu tiên PHẢI GIỐNG CHÍNH XÁC với tên trong Title/Description của video!

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
    "headers": ["Tiêu chí", "TÊN_SẢN_PHẨM_CHÍNH_XÁC_TỪ_TITLE", "Đối thủ 1 (Tên cụ thể)", "Đối thủ 2 (Tên cụ thể)"],
    "rows": [
      ["Giá cả", "1.500.000 VNĐ", "1.200.000 VNĐ", "1.800.000 VNĐ"],
      ["Công suất", "40W", "30W", "50W"],
      ["Dung tích", "800ml", "700ml", "1000ml"],
      ["Chất liệu", "Nhựa PP cao cấp", "Nhựa ABS", "Thủy tinh"],
      ["Tính năng", "Tự động đảo chiều, chống tràn", "Chống giọt", "Vắt 2 chiều"],
      ["Bảo hành", "12 tháng", "24 tháng", "12 tháng"],
      ["Đánh giá", "4.5/5 sao", "4.3/5 sao", "4.7/5 sao"]
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
