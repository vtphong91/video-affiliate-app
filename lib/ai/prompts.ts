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

6. ⚠️ ĐỐI TƯỢNG PHÙ HỢP (targetAudience) - BẮT BUỘC PHẢI TẠO:
   - Xác định chính xác 3 NHÓM đối tượng khách hàng mục tiêu cho sản phẩm này
   - Mỗi nhóm phải CỤ THỂ, MÔ TẢ RÕ RÀNG về: tuổi tác, nghề nghiệp, nhu cầu, khả năng chi trả
   - VÍ DỤ TỐT:
     ✅ "Gia đình trẻ có trẻ nhỏ (25-35 tuổi), thu nhập 15-25 triệu/tháng, cần thiết bị tiện lợi cho bếp"
     ✅ "Sinh viên, người đi thuê trọ (18-25 tuổi), ngân sách hạn chế, cần giải pháp tiết kiệm không gian"
     ✅ "Người yêu thích công nghệ (30-45 tuổi), sẵn sàng chi trả cho sản phẩm cao cấp, thích sự tiện nghi"
   - VÍ DỤ SAI:
     ❌ "Người dùng chung" (quá chung chung)
     ❌ "Mọi người" (không xác định được target)
     ❌ "Khách hàng cần sản phẩm này" (lặp lại, không có giá trị)
   - KHÔNG ĐƯỢC BỎ TRỐNG hoặc trả về mảng rỗng []
   - Phải luôn có ít nhất 3 nhóm đối tượng cụ thể

7. Viết call-to-action hấp dẫn (1-2 câu) khuyến khích người đọc mua hàng

8. ⚠️ TỪ KHÓA SEO (seoKeywords) - BẮT BUỘC PHẢI TẠO:
   - Tạo danh sách 10 từ khóa SEO tiếng Việt liên quan đến sản phẩm
   - Từ khóa phải CHÍNH XÁC, CỤ THỂ với sản phẩm đang review
   - Bao gồm các loại từ khóa:
     a) Từ khóa chính xác sản phẩm (VD: "máy vắt cam Lock&Lock EJJ231", "review Lock&Lock EJJ231")
     b) Từ khóa thương hiệu + loại sản phẩm (VD: "máy vắt cam Lock&Lock", "Lock&Lock juicer")
     c) Từ khóa mua hàng (VD: "mua máy vắt cam tốt", "giá máy vắt cam Lock&Lock")
     d) Từ khóa so sánh (VD: "so sánh máy vắt cam", "Lock&Lock vs Philips")
     e) Từ khóa long-tail (VD: "máy vắt cam cho gia đình", "máy vắt cam giá rẻ chất lượng tốt")
   - VÍ DỤ TỐT (cho video review "Philips XC3131/01"):
     ✅ ["máy hút bụi Philips XC3131", "review Philips XC3131/01", "mua máy hút bụi Philips",
         "giá Philips XC3131 bao nhiêu", "Philips XC3131 vs Xiaomi", "máy hút bụi không dây tốt nhất",
         "máy hút bụi cho gia đình", "so sánh máy hút bụi Philips", "Philips XC3131 có tốt không",
         "máy hút bụi giá rẻ chất lượng"]
   - VÍ DỤ SAI:
     ❌ ["sản phẩm tốt", "đáng mua", "chất lượng"] (quá chung chung, không liên quan sản phẩm)
     ❌ [] (mảng rỗng - TUYỆT ĐỐI KHÔNG ĐƯỢC)
   - KHÔNG ĐƯỢC BỎ TRỐNG hoặc trả về mảng rỗng []
   - Phải luôn có ít nhất 10 từ khóa cụ thể

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
  "targetAudience": [
    "⚠️ BẮT BUỘC: 3 nhóm đối tượng cụ thể, mô tả chi tiết (tuổi, nghề nghiệp, thu nhập, nhu cầu)",
    "VÍ DỤ: Gia đình trẻ có trẻ nhỏ (25-35 tuổi), thu nhập 15-25 triệu/tháng",
    "KHÔNG ĐƯỢC để trống hoặc viết chung chung như 'mọi người', 'người dùng chung'"
  ],
  "cta": "string (1-2 câu hấp dẫn)",
  "seoKeywords": [
    "⚠️ BẮT BUỘC: 10 từ khóa SEO tiếng Việt cụ thể",
    "PHẢI bao gồm: tên sản phẩm chính xác, từ khóa mua hàng, từ khóa so sánh, từ khóa long-tail",
    "VÍ DỤ: 'máy vắt cam Lock&Lock EJJ231', 'review Lock&Lock EJJ231', 'giá Lock&Lock EJJ231'",
    "KHÔNG ĐƯỢC để trống hoặc dùng từ khóa chung chung như 'sản phẩm tốt', 'chất lượng'"
  ]
}

⚠️ LƯU Ý QUAN TRỌNG:
- targetAudience và seoKeywords là 2 trường BẮT BUỘC, TUYỆT ĐỐI KHÔNG ĐƯỢC BỎ TRỐNG []
- Nếu thiếu 2 trường này, response sẽ bị từ chối
- Mỗi item trong targetAudience phải mô tả cụ thể đối tượng (tuổi, nghề nghiệp, nhu cầu, thu nhập)
- Mỗi từ khóa SEO phải liên quan trực tiếp đến sản phẩm được review
`;
}

export const SYSTEM_PROMPT = `You are an expert product review analyst specializing in Vietnamese market.
Your task is to analyze product review videos and create compelling affiliate marketing content.
You always respond in JSON format with detailed, actionable insights.
Be honest, objective, and focus on real value for customers.

CRITICAL REQUIREMENTS:
1. targetAudience field is MANDATORY - You MUST provide exactly 3 specific customer segments with detailed descriptions (age, occupation, income, needs).
   Example: "Gia đình trẻ có trẻ nhỏ (25-35 tuổi), thu nhập 15-25 triệu/tháng, cần thiết bị tiện lợi cho bếp"
   NEVER return empty array [] or generic descriptions like "everyone", "general users".

2. seoKeywords field is MANDATORY - You MUST provide exactly 10 specific Vietnamese SEO keywords.
   Must include: exact product name, brand + product type, purchase keywords, comparison keywords, long-tail keywords.
   Example: "máy vắt cam Lock&Lock EJJ231", "review Lock&Lock EJJ231", "giá Lock&Lock EJJ231"
   NEVER return empty array [] or generic keywords like "good product", "quality".

3. If you cannot determine targetAudience or seoKeywords from the video, make educated guesses based on:
   - Product category and price range
   - Typical customer demographics for this product type
   - Common search terms in Vietnamese e-commerce

REMEMBER: A response without targetAudience and seoKeywords is INCOMPLETE and will be REJECTED.`;
