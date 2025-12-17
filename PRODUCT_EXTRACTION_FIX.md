# Product Name Extraction Fix

## Problem Summary

**Reported Issue**: AI phân tích video đang trả về **sai mã sản phẩm**, không khớp với thông tin thực tế trong video.

**Example**:
- **Video thực tế**: https://www.youtube.com/watch?v=f4HJXmD-nMI
- **Sản phẩm đề cập trong video**: `Lock&Lock EJJ231` (Máy Vắt Cam)
- **Kết quả AI trả về (SAI)**: `LocknLock EJM311`

## Root Cause Analysis

### 1. Data Flow Verification

✅ **YouTube API** - Hoạt động đúng:
- File: `lib/apis/youtube.ts`
- Function: `getYouTubeVideoInfo(videoId)`
- Trả về đầy đủ: `title`, `description`, `transcript`
- Dữ liệu chính xác từ YouTube

✅ **API Route** - Hoạt động đúng:
- File: `app/api/analyze-video/route.ts`
- Truyền đầy đủ `videoInfo` vào AI

❌ **AI Gemini** - Vấn đề tại đây:
- File: `lib/ai/gemini.ts` + `lib/ai/prompts.ts`
- AI nhận đúng dữ liệu nhưng **"tự suy luận"** thay vì **"trích xuất chính xác"**
- Prompt chưa đủ strict về việc trích xuất tên sản phẩm

### 2. Why AI Hallucinated Product Names

AI Language Models có xu hướng:
1. **Generate plausible information** thay vì copy verbatim
2. **Fill in patterns** dựa trên training data
3. **"Autocorrect"** những gì nó nghĩ là lỗi đánh máy (VD: "Lock&Lock" → "LocknLock")
4. **Substitute similar items** khi không chắc chắn

Trong trường hợp này:
- AI thấy "Lock&Lock" trong title
- Nhưng không được hướng dẫn rõ ràng phải **trích xuất nguyên văn**
- Nên AI tự "bịa" ra model code khác dựa trên knowledge base của nó

## Solution Implemented

### Changes to `lib/ai/prompts.ts`

#### 1. Added Strict Extraction Rules

```typescript
⚠️ QUY TẮC TRÍCH XUẤT THÔNG TIN SẢN PHẨM:
1. Đọc KỸ Title và Description để xác định CHÍNH XÁC tên sản phẩm và mã model
2. Tên sản phẩm phải TRÍCH XUẤT NGUYÊN VĂN từ video, KHÔNG ĐƯỢC tự bịa ra hoặc thay đổi
3. Nếu video đề cập "Lock&Lock EJJ231" thì phải ghi ĐÚNG "Lock&Lock EJJ231",
   KHÔNG được đổi thành "LocknLock EJM311"
4. Nếu có nhiều tên trong Title/Description, ưu tiên tên xuất hiện đầu tiên hoặc trong phần chính
5. Nếu không tìm thấy mã model chính xác, ghi tên thương hiệu + loại sản phẩm
   (VD: "Lock&Lock Máy Vắt Cam")
```

**Key Principles**:
- ✅ EXTRACT verbatim (trích xuất nguyên văn)
- ❌ DON'T invent or substitute (không tự bịa hoặc thay thế)

#### 2. Updated Comparison Table Requirements

**Before**:
```
5. Tạo bảng so sánh với 2-3 sản phẩm cùng phân khúc
```

**After**:
```
5. Tạo bảng so sánh CHI TIẾT với 2-3 sản phẩm đối thủ CỤ THỂ:
   - Cột đầu tiên phải dùng TÊN SẢN PHẨM CHÍNH XÁC đã trích xuất từ Title/Description
     (KHÔNG được tự bịa)
   - Các cột đối thủ phải ghi rõ TÊN THƯƠNG HIỆU và TÊN SẢN PHẨM cụ thể
   - Giá cả theo VNĐ format: "1.200.000 VNĐ"
```

#### 3. Added Clear Examples (Good vs Bad)

```
VÍ DỤ BẢNG SO SÁNH TỐT (giả sử video review "Lock&Lock EJJ231"):

✅ ĐÚNG - Trích xuất chính xác từ video:
- Header: ["Tiêu chí", "Lock&Lock EJJ231", "Philips HR2744", "Panasonic MJ-DJ01"]
- Row giá: ["Giá cả", "1.500.000 VNĐ", "1.200.000 VNĐ", "1.800.000 VNĐ"]

❌ SAI - Tự bịa tên sản phẩm khác với video:
- Header: ["Tiêu chí", "LocknLock EJM311", "Brand A", "Đối thủ B"]
- Row giá: ["Giá cả", "Around 1,500,000 VND", "Around 1,200,000 VND", ...]

⚠️ LƯU Ý: Tên sản phẩm trong cột đầu tiên PHẢI GIỐNG CHÍNH XÁC với tên trong Title/Description!
```

#### 4. Updated JSON Output Template

**Before**:
```json
"headers": ["Tính năng", "Sản phẩm này", "Đối thủ A", "Đối thủ B"]
```

**After**:
```json
"headers": ["Tiêu chí", "TÊN_SẢN_PHẨM_CHÍNH_XÁC_TỪ_TITLE", "Đối thủ 1 (Tên cụ thể)", ...]
```

#### 5. Added Debug Logging

```typescript
export function generateAnalysisPrompt(videoInfo: VideoInfo): string {
  // Log để debug
  console.log('📋 PROMPT - Video Info được truyền vào:', {
    title: videoInfo.title,
    descriptionPreview: videoInfo.description?.substring(0, 150),
    hasTranscript: !!videoInfo.transcript,
    transcriptPreview: videoInfo.transcript?.substring(0, 150)
  });
  // ...
}
```

This helps verify what data AI is receiving.

## Testing

### Test Script Created

File: `test-product-extraction.js`

**Usage**:
```bash
node test-product-extraction.js
```

**What it tests**:
1. Calls `/api/analyze-video` with the problem video URL
2. Extracts product name from comparison table header
3. Validates:
   - ✅ Contains "Lock&Lock" brand
   - ✅ Contains correct model "EJJ231"
   - ❌ Does NOT contain wrong model "EJM311"
4. Reports success/failure

### Manual Testing Steps

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser**: http://localhost:3001/dashboard/create

3. **Paste video URL**: https://www.youtube.com/watch?v=f4HJXmD-nMI

4. **Click "Phân tích video"**

5. **Check comparison table**:
   - First column header should be: `Lock&Lock EJJ231` (or similar exact match)
   - Should NOT be: `LocknLock EJM311` or other hallucinated names

6. **Verify all fields**:
   - Summary mentions correct product
   - Pros/cons are relevant
   - Price estimates are in VNĐ format

## Expected Results

### Before Fix
```
Comparison Table Headers:
["Tiêu chí", "LocknLock EJM311", "Philips HR2744", "Panasonic MJ-DJ01"]
```

### After Fix
```
Comparison Table Headers:
["Tiêu chí", "Lock&Lock EJJ231", "Philips HR2744", "Panasonic MJ-DJ01"]
```

## Files Modified

1. **lib/ai/prompts.ts** - Main fix
   - Added extraction rules
   - Updated examples
   - Added debug logging

2. **test-product-extraction.js** - New test script
   - Automated testing
   - Validation logic

3. **PRODUCT_EXTRACTION_FIX.md** - This documentation

## Potential Edge Cases

### Case 1: Video title has multiple product names
**Example**: "So sánh Lock&Lock EJJ231 vs Philips HR2744"

**Expected**: Extract first-mentioned product: `Lock&Lock EJJ231`

### Case 2: Product name in description only
**Example**: Title generic, but description says "Đánh giá máy vắt cam Lock&Lock EJJ231"

**Expected**: Extract from description: `Lock&Lock EJJ231`

### Case 3: No specific model code
**Example**: "Review máy vắt cam Lock&Lock mới nhất"

**Expected**: Use brand + type: `Lock&Lock Máy Vắt Cam`

### Case 4: Multiple models mentioned
**Example**: "Lock&Lock EJJ231 và EJM311 - 2 mẫu hot nhất"

**Expected**: Use first-mentioned or primary focus: `Lock&Lock EJJ231`

## Monitoring and Debugging

### Check Logs

When analyzing video, check terminal for:

```
📋 PROMPT - Video Info được truyền vào: {
  title: '...',
  descriptionPreview: '...',
  hasTranscript: true,
  transcriptPreview: '...'
}
```

This confirms what data AI received.

### Common Issues

1. **AI still hallucinating**:
   - Check if prompt changes were deployed
   - Try clearing browser cache
   - Restart dev server

2. **Wrong product extracted**:
   - Check video title/description for actual product name
   - Verify prompt logs show correct data
   - AI might be confused by multiple products in video

3. **Generic product name**:
   - If model code not in title/description, this is expected
   - AI will fall back to brand + type

## Future Improvements

1. **Product Name Validation**:
   - Add regex to extract model codes from title
   - Pre-validate before sending to AI
   - Return warning if product name seems hallucinated

2. **Structured Extraction**:
   - Use separate AI call specifically for product name extraction
   - Then pass confirmed product name to analysis prompt

3. **Database of Known Products**:
   - Maintain list of real Lock&Lock models
   - Validate AI output against database
   - Reject hallucinated model codes

4. **User Feedback Loop**:
   - Allow users to report incorrect product names
   - Track which videos cause hallucinations
   - Refine prompt based on failure patterns

## Related Issues

This fix also addresses the earlier comparison table improvements:
- Commit `968b7cd`: Enhanced comparison tables with specific competitor names
- Commit `51f69e4`: Added strict product extraction rules

Together, these ensure:
1. Main product name is accurate (this fix)
2. Competitor names are specific not generic (previous fix)
3. All data is in Vietnamese format with VNĐ pricing

## Commits

1. **968b7cd** - feat: Enhance AI prompt for detailed comparison tables
2. **51f69e4** - fix: Add strict product name extraction rules to AI prompt

---

**Status**: ✅ Fix implemented, ready for testing

**Next Steps**: Run `node test-product-extraction.js` to verify fix works with problem video
