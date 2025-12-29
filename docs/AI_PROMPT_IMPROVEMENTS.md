# AI Prompt Improvements - targetAudience & seoKeywords

**Ngày tạo**: 2025-12-29
**Trạng thái**: ✅ Hoàn thành
**Vấn đề**: AI không trả về targetAudience và seoKeywords khi phân tích video

---

## 📋 Tóm Tắt Vấn Đề

Khi người dùng tạo review mới từ video, AI (Gemini) thường không trả về 2 trường quan trọng:
- `targetAudience` (Đối tượng phù hợp) - Bị để trống []
- `seoKeywords` (Từ khóa SEO) - Bị để trống []

Điều này khiến review thiếu thông tin quan trọng cho SEO và targeting khách hàng.

---

## 🔧 Giải Pháp Đã Triển Khai

### 1. Cải Thiện Prompt (lib/ai/prompts.ts)

#### A. Thêm Hướng Dẫn Chi Tiết Cho targetAudience

**Vị trí**: `lib/ai/prompts.ts` - Yêu cầu #6

**Nội dung**:
```
6. ⚠️ ĐỐI TƯỢNG PHÙ HỢP (targetAudience) - BẮT BUỘC PHẢI TẠO:
   - Xác định chính xác 3 NHÓM đối tượng khách hàng mục tiêu
   - Mỗi nhóm phải CỤ THỂ, MÔ TẢ RÕ RÀNG về:
     * Tuổi tác
     * Nghề nghiệp
     * Nhu cầu
     * Khả năng chi trả (thu nhập)

   - VÍ DỤ TỐT:
     ✅ "Gia đình trẻ có trẻ nhỏ (25-35 tuổi), thu nhập 15-25 triệu/tháng,
         cần thiết bị tiện lợi cho bếp"
     ✅ "Sinh viên, người đi thuê trọ (18-25 tuổi), ngân sách hạn chế,
         cần giải pháp tiết kiệm không gian"

   - VÍ DỤ SAI:
     ❌ "Người dùng chung" (quá chung chung)
     ❌ "Mọi người" (không xác định target)

   - KHÔNG ĐƯỢC BỎ TRỐNG hoặc trả về mảng rỗng []
   - Phải luôn có ít nhất 3 nhóm đối tượng cụ thể
```

#### B. Thêm Hướng Dẫn Chi Tiết Cho seoKeywords

**Vị trí**: `lib/ai/prompts.ts` - Yêu cầu #8

**Nội dung**:
```
8. ⚠️ TỪ KHÓA SEO (seoKeywords) - BẮT BUỘC PHẢI TẠO:
   - Tạo danh sách 10 từ khóa SEO tiếng Việt liên quan đến sản phẩm
   - Từ khóa phải CHÍNH XÁC, CỤ THỂ với sản phẩm đang review

   - Bao gồm các loại từ khóa:
     a) Từ khóa chính xác sản phẩm
        VD: "máy vắt cam Lock&Lock EJJ231", "review Lock&Lock EJJ231"

     b) Từ khóa thương hiệu + loại sản phẩm
        VD: "máy vắt cam Lock&Lock", "Lock&Lock juicer"

     c) Từ khóa mua hàng
        VD: "mua máy vắt cam tốt", "giá máy vắt cam Lock&Lock"

     d) Từ khóa so sánh
        VD: "so sánh máy vắt cam", "Lock&Lock vs Philips"

     e) Từ khóa long-tail
        VD: "máy vắt cam cho gia đình", "máy vắt cam giá rẻ chất lượng tốt"

   - VÍ DỤ SAI:
     ❌ ["sản phẩm tốt", "đáng mua", "chất lượng"] (quá chung chung)
     ❌ [] (mảng rỗng - TUYỆT ĐỐI KHÔNG ĐƯỢC)

   - KHÔNG ĐƯỢC BỎ TRỐNG hoặc trả về mảng rỗng []
   - Phải luôn có ít nhất 10 từ khóa cụ thể
```

#### C. Cập Nhật OUTPUT FORMAT

**Thay đổi**:
```json
{
  "targetAudience": [
    "⚠️ BẮT BUỘC: 3 nhóm đối tượng cụ thể, mô tả chi tiết",
    "VÍ DỤ: Gia đình trẻ có trẻ nhỏ (25-35 tuổi), thu nhập 15-25 triệu/tháng",
    "KHÔNG ĐƯỢC để trống hoặc viết chung chung"
  ],
  "seoKeywords": [
    "⚠️ BẮT BUỘC: 10 từ khóa SEO tiếng Việt cụ thể",
    "PHẢI bao gồm: tên sản phẩm, từ khóa mua hàng, từ khóa so sánh",
    "KHÔNG ĐƯỢC để trống hoặc dùng từ khóa chung chung"
  ]
}
```

**Thêm lưu ý quan trọng**:
```
⚠️ LƯU Ý QUAN TRỌNG:
- targetAudience và seoKeywords là 2 trường BẮT BUỘC
- Nếu thiếu 2 trường này, response sẽ bị từ chối
- Mỗi item phải cụ thể, liên quan trực tiếp đến sản phẩm
```

---

### 2. Cập Nhật SYSTEM_PROMPT

**File**: `lib/ai/prompts.ts`

**Thêm yêu cầu nghiêm ngặt**:
```
CRITICAL REQUIREMENTS:
1. targetAudience field is MANDATORY
   - Provide exactly 3 specific customer segments
   - Include: age, occupation, income, needs
   - NEVER return empty array [] or generic descriptions

2. seoKeywords field is MANDATORY
   - Provide exactly 10 specific Vietnamese SEO keywords
   - Include: product name, brand, purchase keywords, comparisons, long-tail
   - NEVER return empty array [] or generic keywords

3. If cannot determine from video, make educated guesses based on:
   - Product category and price range
   - Typical customer demographics
   - Common Vietnamese e-commerce search terms

REMEMBER: A response without targetAudience and seoKeywords is INCOMPLETE and will be REJECTED.
```

---

### 3. Thêm Fallback Logic & Validation

**File**: `lib/ai/gemini.ts`

#### A. Debug Logging Chi Tiết

**Thêm logging sau khi parse JSON**:
```typescript
console.log('🔍 Gemini - targetAudience field:', {
  targetAudience: parsedData.targetAudience,
  target_audience: parsedData.target_audience,
  isArray: Array.isArray(parsedData.targetAudience || parsedData.target_audience),
  value: parsedData.targetAudience || parsedData.target_audience
});

console.log('🔍 Gemini - seoKeywords field:', {
  seoKeywords: parsedData.seoKeywords,
  seo_keywords: parsedData.seo_keywords,
  isArray: Array.isArray(parsedData.seoKeywords || parsedData.seo_keywords),
  value: parsedData.seoKeywords || parsedData.seo_keywords
});

console.log('🤖 Gemini - Analysis stats:', {
  summaryLength: analysis.summary.length,
  prosCount: analysis.pros.length,
  consCount: analysis.cons.length,
  keyPointsCount: analysis.keyPoints.length,
  targetAudienceCount: analysis.targetAudience.length,
  seoKeywordsCount: analysis.seoKeywords.length,
});
```

#### B. Fallback Generation

**Nếu targetAudience bị rỗng**:
```typescript
if (analysis.targetAudience.length === 0) {
  console.error('❌ Gemini - targetAudience is EMPTY!');
  console.error('🔧 Gemini - Generating fallback...');

  analysis.targetAudience = [
    'Người tiêu dùng quan tâm đến sản phẩm này, có nhu cầu mua sắm online',
    'Gia đình hoặc cá nhân đang tìm kiếm giải pháp cho nhu cầu hàng ngày',
    'Khách hàng muốn tham khảo review chi tiết trước khi mua'
  ];

  console.warn('⚠️ Using fallback targetAudience. User should edit manually.');
}
```

**Nếu seoKeywords bị rỗng**:
```typescript
if (analysis.seoKeywords.length === 0) {
  console.error('❌ Gemini - seoKeywords is EMPTY!');
  console.error('🔧 Gemini - Generating fallback from video title...');

  const cleanTitle = videoInfo.title.replace(/[^\w\s\u00C0-\u1EF9]/g, ' ').trim();

  analysis.seoKeywords = [
    cleanTitle,
    `review ${cleanTitle}`,
    `đánh giá ${cleanTitle}`,
    `mua ${cleanTitle}`,
    `giá ${cleanTitle}`,
    `${cleanTitle} có tốt không`,
    `${cleanTitle} chính hãng`,
    `so sánh ${cleanTitle}`,
    `${cleanTitle} giá rẻ`,
    `${cleanTitle} uy tín`
  ];

  console.warn('⚠️ Using fallback seoKeywords. User should review manually.');
}
```

#### C. Padding Logic

**Đảm bảo số lượng tối thiểu**:
```typescript
// Ensure minimum 3 targetAudience items
if (analysis.targetAudience.length < 3) {
  while (analysis.targetAudience.length < 3) {
    analysis.targetAudience.push('Khách hàng có nhu cầu sử dụng sản phẩm này');
  }
}

// Ensure minimum 10 seoKeywords items
if (analysis.seoKeywords.length < 10) {
  while (analysis.seoKeywords.length < 10) {
    analysis.seoKeywords.push(`sản phẩm ${videoInfo.platform}`);
  }
}
```

#### D. Final Validation

**Throw error nếu vẫn thiếu**:
```typescript
if (!analysis.targetAudience || analysis.targetAudience.length === 0) {
  throw new Error('targetAudience is required but was not provided by AI');
}

if (!analysis.seoKeywords || analysis.seoKeywords.length === 0) {
  throw new Error('seoKeywords is required but was not provided by AI');
}
```

---

## 📊 Kết Quả Mong Đợi

### Trước Khi Cải Thiện

**AI Response**:
```json
{
  "summary": "Sản phẩm tốt...",
  "pros": ["..."],
  "cons": ["..."],
  "targetAudience": [],  // ❌ Rỗng
  "seoKeywords": []      // ❌ Rỗng
}
```

**Kết quả**: Review không có thông tin target và SEO

---

### Sau Khi Cải Thiện

#### Scenario 1: AI Tuân Thủ Prompt (Best Case)

**AI Response**:
```json
{
  "summary": "Sản phẩm tốt...",
  "pros": ["..."],
  "cons": ["..."],
  "targetAudience": [
    "Gia đình trẻ có trẻ nhỏ (25-35 tuổi), thu nhập 15-25 triệu/tháng, cần thiết bị tiện lợi",
    "Sinh viên, người đi thuê trọ (18-25 tuổi), ngân sách hạn chế, cần giải pháp tiết kiệm",
    "Người yêu thích công nghệ (30-45 tuổi), sẵn sàng chi trả cao, thích tiện nghi"
  ],
  "seoKeywords": [
    "máy vắt cam Lock&Lock EJJ231",
    "review Lock&Lock EJJ231",
    "mua máy vắt cam Lock&Lock",
    "giá Lock&Lock EJJ231",
    "Lock&Lock vs Philips",
    "máy vắt cam tốt nhất",
    "máy vắt cam cho gia đình",
    "so sánh máy vắt cam",
    "Lock&Lock có tốt không",
    "máy vắt cam giá rẻ"
  ]
}
```

**Kết quả**: Review đầy đủ thông tin, tối ưu SEO ✅

---

#### Scenario 2: AI Không Tuân Thủ (Fallback Activated)

**AI Response Ban Đầu**:
```json
{
  "summary": "...",
  "targetAudience": [],  // ❌ Rỗng
  "seoKeywords": []      // ❌ Rỗng
}
```

**Sau Khi Fallback**:
```json
{
  "summary": "...",
  "targetAudience": [
    "Người tiêu dùng quan tâm đến sản phẩm này, có nhu cầu mua sắm online",
    "Gia đình hoặc cá nhân đang tìm kiếm giải pháp cho nhu cầu hàng ngày",
    "Khách hàng muốn tham khảo review chi tiết trước khi mua"
  ],
  "seoKeywords": [
    "Philips XC3131 máy hút bụi",
    "review Philips XC3131 máy hút bụi",
    "đánh giá Philips XC3131 máy hút bụi",
    "mua Philips XC3131 máy hút bụi",
    // ... (generated from video title)
  ]
}
```

**Kết quả**: Review có thông tin cơ bản, user có thể chỉnh sửa để tối ưu ⚠️

**Console Warning**:
```
⚠️ Gemini - Using fallback targetAudience. User should edit manually for better targeting.
⚠️ Gemini - Using fallback seoKeywords based on title. User should review and refine manually.
```

---

## 🧪 Testing Guide

### Test Case 1: Tạo Review Mới Từ Video YouTube

**Steps**:
1. Truy cập `/dashboard/create`
2. Nhập URL video YouTube (VD: review sản phẩm Lock&Lock)
3. Click "Phân tích video"
4. Kiểm tra console logs:
   ```
   🔍 Gemini - targetAudience field: { ... }
   🔍 Gemini - seoKeywords field: { ... }
   🤖 Gemini - Analysis stats: {
     targetAudienceCount: 3,
     seoKeywordsCount: 10
   }
   ```
5. Kiểm tra form "Đối Tượng Phù Hợp" có 3 items
6. Kiểm tra form "Từ Khóa SEO" có 10 keywords

**Expected Result**:
- ✅ targetAudience có 3 mô tả cụ thể (tuổi, nghề, thu nhập)
- ✅ seoKeywords có 10 từ khóa liên quan sản phẩm
- ✅ Không có warning fallback (best case)
- ⚠️ Nếu có warning fallback, user có thể edit manual

---

### Test Case 2: Video Không Có Transcript

**Steps**:
1. Nhập URL video không có phụ đề
2. Phân tích video
3. Kiểm tra AI có tạo targetAudience/seoKeywords dựa trên title không

**Expected Result**:
- ✅ Vẫn có targetAudience (dựa trên title + description)
- ✅ Vẫn có seoKeywords (generated từ title)
- ⚠️ Chất lượng có thể thấp hơn, cần manual review

---

### Test Case 3: Fallback Validation

**Steps**:
1. Giả lập AI trả về response rỗng
2. Check console có log fallback generation không
3. Verify response cuối cùng có đầy đủ fields

**Expected Console Logs**:
```
❌ Gemini - targetAudience is EMPTY! This is a CRITICAL ERROR.
🔧 Gemini - Generating fallback targetAudience...
⚠️ Gemini - Using fallback targetAudience. User should edit manually.

❌ Gemini - seoKeywords is EMPTY! This is a CRITICAL ERROR.
🔧 Gemini - Generating fallback seoKeywords from video title...
⚠️ Gemini - Using fallback seoKeywords based on title. User should review.
```

**Expected Result**:
- ✅ Không crash
- ✅ Response có đầy đủ targetAudience và seoKeywords
- ⚠️ User được cảnh báo cần review manual

---

## 📈 Metrics to Monitor

### Success Metrics

1. **AI Compliance Rate**
   - % số lần AI trả về đầy đủ targetAudience và seoKeywords
   - Target: >80% không cần fallback

2. **Fallback Trigger Rate**
   - % số lần phải dùng fallback logic
   - Target: <20%

3. **User Edit Rate**
   - % user edit targetAudience/seoKeywords sau khi AI generate
   - Baseline: Monitor for 1 tuần đầu

4. **Error Rate**
   - % requests bị throw error do validation fail
   - Target: 0% (fallback should prevent all errors)

### Monitoring via Console Logs

**Success Pattern**:
```
✅ Gemini - JSON parsed successfully
🔍 Gemini - targetAudience field: { value: [...], isArray: true }
🔍 Gemini - seoKeywords field: { value: [...], isArray: true }
🤖 Gemini - Analysis stats: {
  targetAudienceCount: 3,
  seoKeywordsCount: 10
}
✅ Gemini - Analysis completed successfully
```

**Fallback Pattern**:
```
❌ Gemini - targetAudience is EMPTY!
🔧 Gemini - Generating fallback...
⚠️ Gemini - Using fallback targetAudience
```

---

## 🔮 Future Improvements (Optional)

### Phase 1: Intelligent Fallback

**Goal**: Cải thiện chất lượng fallback dựa trên machine learning

**Ideas**:
- Phân tích video title để detect category (điện tử, gia dụng, thời trang...)
- Mapping category → targetAudience templates
- Mapping category → seoKeywords templates

**Example**:
```typescript
const categoryTemplates = {
  'điện_tử': {
    targetAudience: [
      'Người yêu công nghệ (25-40 tuổi), thu nhập 15-30 triệu',
      'Gia đình trẻ cần thiết bị hiện đại',
      'Tech enthusiasts sẵn sàng đầu tư sản phẩm cao cấp'
    ],
    seoKeywordPatterns: [
      '{product} review',
      '{brand} {category}',
      'mua {product} ở đâu',
      // ...
    ]
  }
};
```

---

### Phase 2: User Feedback Loop

**Goal**: Thu thập feedback để cải thiện prompt

**Features**:
- Thêm nút "👍 targetAudience chính xác" / "👎 cần sửa"
- Thêm nút "👍 seoKeywords tốt" / "👎 cần sửa"
- Log feedback vào database
- Phân tích patterns để refine prompt

---

### Phase 3: A/B Testing Prompts

**Goal**: Test nhiều phiên bản prompt để tìm optimal

**Approach**:
- Tạo 2-3 phiên bản prompt khác nhau
- Random assign user vào từng group
- Measure success rate cho mỗi prompt
- Chọn prompt có performance tốt nhất

---

## 📝 Changelog

### v1.0 (2025-12-29)
- ✅ Thêm hướng dẫn chi tiết cho targetAudience trong prompt
- ✅ Thêm hướng dẫn chi tiết cho seoKeywords trong prompt
- ✅ Cập nhật SYSTEM_PROMPT với CRITICAL REQUIREMENTS
- ✅ Thêm debug logging cho targetAudience và seoKeywords
- ✅ Implement fallback generation logic
- ✅ Thêm padding logic để đảm bảo số lượng tối thiểu
- ✅ Thêm final validation với throw error
- ✅ Tạo documentation đầy đủ

---

## 💡 Tips for Developers

### Tip 1: Monitoring Console Logs

**Quan trọng**: Luôn check console khi test create review

**What to look for**:
- ✅ `targetAudienceCount: 3` và `seoKeywordsCount: 10`
- ⚠️ Warning messages about fallback
- ❌ Error messages về validation

### Tip 2: Manual Review Recommendation

**When to edit manually**:
- Fallback được trigger (có warning log)
- targetAudience quá chung chung
- seoKeywords không liên quan sản phẩm cụ thể
- Video không có transcript (AI chỉ dựa vào title)

### Tip 3: Prompt Engineering Best Practices

**Lessons learned**:
- ✅ Use emoji (⚠️, ✅, ❌) để highlight requirements
- ✅ Provide concrete examples (VÍ DỤ TỐT vs VÍ DỤ SAI)
- ✅ Repeat critical requirements multiple times
- ✅ Use ALL CAPS for MANDATORY fields
- ✅ Add validation hints in OUTPUT FORMAT section

---

## 🐛 Known Limitations

1. **Fallback Quality**
   - Fallback targetAudience khá generic
   - Fallback seoKeywords chỉ dựa vào title
   - User cần manual review để tối ưu

2. **AI Consistency**
   - Gemini không 100% tuân thủ prompt
   - Đôi khi vẫn trả về mảng rỗng
   - Cần fallback logic để handle

3. **Language Understanding**
   - AI đôi khi không hiểu context Việt Nam
   - targetAudience có thể không chính xác về income range
   - seoKeywords có thể không match search behavior VN

---

## 📚 Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Project overview and development guide
- [AI Gemini Module](../lib/ai/gemini.ts) - AI implementation details
- [Prompts Configuration](../lib/ai/prompts.ts) - Prompt engineering

---

**Status**: ✅ PRODUCTION READY

**Maintainer**: Development Team

**Last Updated**: 2025-12-29
