# Template Optimization Action Plan

**Ngày tạo**: 30/12/2025
**Mục đích**: Áp dụng phương pháp "Simple & Trust-based" vào 6 template prompts
**Dựa trên**: Kết quả thành công từ việc đơn giản hóa main prompt (lib/ai/prompts.ts)

---

## 🎯 OPTIMIZATION GOALS

### Current Issues:
1. ❌ **Missing Critical Fields**: Không có `targetAudience` và `seoKeywords` trong tất cả 6 templates
2. ❌ **Too Complex**: Prompts quá dài và phức tạp (đặc biệt Tech Blog: 1500-2000 words)
3. ❌ **Inconsistent Structure**: Mỗi template có structure khác nhau
4. ❌ **Inflexible**: Một số template cứng nhắc (e.g., comparison bắt buộc 3 products)

### Target Improvements:
1. ✅ Add `targetAudience` (3 groups) to ALL templates
2. ✅ Add `seoKeywords` (5 keywords) to ALL templates
3. ✅ Simplify instructions following "Less is More"
4. ✅ Standardize core structure across templates
5. ✅ Make templates more flexible

---

## 📋 TEMPLATE-BY-TEMPLATE ACTION PLAN

### **Template 1: Tech Review - Facebook Style**

**File**: `lib/templates/system-templates.ts` - `techReviewFacebook`

**Current Status**: 300-500 words, casual tone, moderate emoji

**Changes Required**:

```typescript
// ADD THESE SECTIONS (Priority 1):

9. Gợi ý 3 nhóm đối tượng phù hợp với sản phẩm này
   (Bao gồm: độ tuổi, mức thu nhập, nhu cầu cụ thể)

10. Gợi ý 5 từ khóa SEO tiếng Việt quan trọng nhất
    (Bao gồm: tên sản phẩm chính xác, từ khóa review, từ khóa mua hàng, từ khóa so sánh, từ khóa giá)

// SIMPLIFY (Priority 2):
- Remove: "BẮT BUỘC phải có từ 5-8 hashtag"
- Change to: "Gợi ý 5-8 hashtag liên quan"
- Keep: Casual tone, emoji usage, structure (good as is)
```

**Expected Output**: Add 2 new fields without increasing complexity

---

### **Template 2: Tech Review - Blog Post (In-depth)**

**File**: `lib/templates/system-templates.ts` - `techReviewBlog`

**Current Status**: 1500-2000 words, professional, SEO-optimized

**Changes Required**:

```typescript
// CRITICAL: This template is TOO LONG (1500-2000 words)

// SIMPLIFY FIRST (Priority 1):
- Reduce target length: 1500-2000 → 800-1200 words
- Remove: "Phân tích chi tiết từng tính năng" (too detailed)
- Keep: Timestamps, FAQs, structured sections (valuable)

// ADD FIELDS (Priority 2):
9. Gợi ý 3 nhóm đối tượng phù hợp
10. Gợi ý 5 từ khóa SEO tiếng Việt

// CLEAN STRUCTURE (Priority 3):
- Remove instructions like "Phải có ít nhất X câu"
- Change to: "Gợi ý X câu" or "Khoảng X câu"
```

**Expected Output**: Shorter, simpler, with targetAudience & seoKeywords

---

### **Template 3: Beauty Review - Instagram**

**File**: `lib/templates/system-templates.ts` - `beautyReviewInstagram`

**Current Status**: 150-250 words, heavy emoji, 15 hashtags

**Changes Required**:

```typescript
// GOOD: Structure is already simple and clear

// ADD FIELDS (Priority 1):
9. Gợi ý 3 nhóm đối tượng phù hợp
   (Đặc biệt: lứa tuổi, giới tính, skin type/hair type)

10. Gợi ý 5 từ khóa SEO tiếng Việt

// MINOR SIMPLIFICATION (Priority 2):
- "BẮT BUỘC có 10-15 hashtag" → "Gợi ý 10-15 hashtag"
- "PHẢI có 5-7 emoji" → "Sử dụng 5-7 emoji"
```

**Expected Output**: Keep short format, add 2 fields, soften tone

---

### **Template 4: Food Review - TikTok**

**File**: `lib/templates/system-templates.ts` - `foodReviewTikTok`

**Current Status**: 100-150 words, very short, viral hook

**Changes Required**:

```typescript
// EXCELLENT: Already very simple and focused

// ADD FIELDS (Priority 1):
// Note: For TikTok, keep these BRIEF
8. Gợi ý 3 nhóm đối tượng (ngắn gọn: ví dụ "Gen Z yêu ăn vặt")
9. Gợi ý 5 từ khóa SEO (cho TikTok discovery)

// KEEP AS IS (Priority: MAINTAIN):
- Viral hook requirement
- Short format (100-150 words)
- Funny tone
- Heavy emoji usage
```

**Expected Output**: Add minimal fields without losing viral nature

---

### **Template 5: Product Comparison - Facebook**

**File**: `lib/templates/system-templates.ts` - `productComparisonFB`

**Current Status**: 400-600 words, table format, LOCKED to 3 products

**Changes Required**:

```typescript
// CRITICAL FIX: Make number of products FLEXIBLE

// BEFORE:
"So sánh 3 sản phẩm" (hard-coded)

// AFTER:
"So sánh ${comparisonCount || 3} sản phẩm" (flexible)

// ADD FIELDS (Priority 1):
8. Gợi ý 3 nhóm đối tượng phù hợp cho từng sản phẩm
9. Gợi ý 5 từ khóa SEO (bao gồm từ khóa so sánh)

// SIMPLIFY TABLE (Priority 2):
- "BẮT BUỘC có ít nhất 7 tiêu chí" → "Gợi ý 5-7 tiêu chí"
- Remove: Overly specific criteria requirements
- Add: Flexibility for different product categories
```

**Expected Output**: Flexible comparison with 2 new fields

---

### **Template 6: Tutorial/How-to - Blog**

**File**: `lib/templates/system-templates.ts` - `tutorialBlog`

**Current Status**: 1000-1500 words, formal, step-by-step

**Changes Required**:

```typescript
// SIMPLIFY (Priority 1):
- Reduce: 1000-1500 → 600-1000 words
- Remove: "PHẢI có từ 5-7 bước" → "Gợi ý 5-7 bước"
- Keep: Step-by-step structure (valuable for tutorials)

// ADD FIELDS (Priority 2):
// Note: For tutorials, targetAudience is CRITICAL
10. Gợi ý 3 nhóm đối tượng phù hợp
    (Đặc biệt: skill level - beginner/intermediate/advanced)

11. Gợi ý 5 từ khóa SEO (bao gồm "cách", "hướng dẫn")

// CLEAN TONE (Priority 3):
- "BẮT BUỘC phải có" → "Nên có"
- "TUYỆT ĐỐI không được" → Remove entirely
```

**Expected Output**: Shorter tutorial with skill-level targeting

---

## 🔄 STANDARDIZED TEMPLATE STRUCTURE

**Apply this to ALL 6 templates:**

```typescript
export const templateName: Template = {
  id: 'unique-id',
  name: 'Template Name',
  category: 'review' | 'comparison' | 'tutorial',
  platform: 'facebook' | 'instagram' | 'tiktok' | 'blog',
  contentType: 'short' | 'medium' | 'long',

  config: {
    tone: 'casual' | 'professional' | 'funny',
    length: {
      min: number,
      max: number,
      target: number  // NEW: Add target length
    },
    structure: {
      hasIntro: boolean,
      hasTimestamps: boolean,
      hasFAQ: boolean,
      hasComparison: boolean,
      // NEW: Add flexibility flags
      flexibleLength: boolean,
      flexibleStructure: boolean
    },
    seo: {
      optimized: boolean,
      keywordsCount: 5  // CHANGED: 10 → 5
    },
    formatting: {
      emojiUsage: 'none' | 'light' | 'moderate' | 'heavy',
      hashtagCount: {
        min: number,
        max: number
      }
    },
    // NEW: Add these fields
    marketing: {
      includeTargetAudience: true,  // Always true now
      audienceGroupsCount: 3
    }
  },

  prompt: `
    [Platform-specific instructions]

    YÊU CẦU:
    1-7. [Existing content requirements - SIMPLIFIED]

    8. Gợi ý 3 nhóm đối tượng phù hợp với sản phẩm/nội dung này
       (Bao gồm: độ tuổi, mức thu nhập/skill level, nhu cầu cụ thể)

    9. Gợi ý 5 từ khóa SEO tiếng Việt quan trọng nhất
       (Bao gồm: tên sản phẩm/chủ đề chính xác, từ khóa review/hướng dẫn, từ khóa mua hàng, từ khóa so sánh, từ khóa giá/cách làm)

    QUAN TRỌNG:
    - Viết tự nhiên, dễ hiểu
    - Tập trung vào giá trị thực tế
    - [Platform-specific notes]

    OUTPUT FORMAT: JSON
    {
      [Existing fields],
      "targetAudience": [
        "string (tuổi, thu nhập/skill, nhu cầu)",
        "string (tuổi, thu nhập/skill, nhu cầu)",
        "string (tuổi, thu nhập/skill, nhu cầu)"
      ],
      "seoKeywords": [
        "string (tên chính xác)",
        "string (từ khóa review/hướng dẫn)",
        "string (từ khóa mua hàng/cách làm)",
        "string (từ khóa so sánh)",
        "string (từ khóa giá/thương hiệu)"
      ]
    }
  `,

  variables: [
    // Existing variables
    'targetAudience',  // NEW
    'seoKeywords'      // NEW
  ]
};
```

---

## 📊 BEFORE/AFTER COMPARISON

| Aspect | Before (Current) | After (Optimized) | Improvement |
|--------|-----------------|-------------------|-------------|
| **targetAudience** | ❌ Missing in ALL 6 | ✅ Present in ALL 6 | **100% coverage** |
| **seoKeywords** | ❌ Missing in ALL 6 | ✅ Present in ALL 6 (5 keywords) | **100% coverage** |
| **Prompt Length** | Variable (long) | Standardized (shorter) | **~20-30% reduction** |
| **Tone** | Mixed (some aggressive) | Consistent (trust-based) | **Unified voice** |
| **Flexibility** | Low (hard-coded limits) | High (flexible params) | **More adaptable** |
| **Structure** | Inconsistent | Standardized | **Easier to maintain** |

---

## 🛠️ IMPLEMENTATION STEPS

### Phase 1: Core Fields Addition (2-3 hours)
**Priority: HIGH - Do First**

```bash
# 1. Backup current file
cp lib/templates/system-templates.ts lib/templates/system-templates-before-optimization.ts.backup

# 2. Add targetAudience & seoKeywords to all 6 templates
# Focus on: Sections 8-9 (or 9-10 depending on template)
```

**Template by template:**
1. ✅ techReviewFacebook - Add sections 9-10
2. ✅ techReviewBlog - Add sections 9-10 (after simplifying)
3. ✅ beautyReviewInstagram - Add sections 9-10
4. ✅ foodReviewTikTok - Add sections 8-9 (keep brief)
5. ✅ productComparisonFB - Add sections 8-9
6. ✅ tutorialBlog - Add sections 10-11 (skill-level focus)

### Phase 2: Simplification (2-3 hours)
**Priority: MEDIUM - After Phase 1**

For each template:
1. Remove "BẮT BUỘC", "PHẢI", "TUYỆT ĐỐI"
2. Change to "Gợi ý", "Nên có"
3. Reduce word count targets by 20-30%
4. Remove overly specific requirements

### Phase 3: Standardization (1-2 hours)
**Priority: LOW - Polish**

1. Align all 6 templates to standardized structure
2. Update config objects with new fields
3. Add flexibility flags
4. Document template variables

### Phase 4: Testing (1-2 hours)
**Priority: HIGH - Validate**

Test each template with:
- Real video data
- Different product categories
- Edge cases (missing data, short transcripts)

Validate outputs:
- ✅ targetAudience has 3 groups with details
- ✅ seoKeywords has 5 relevant keywords
- ✅ No empty arrays
- ✅ Content quality maintained

---

## ✅ SUCCESS CRITERIA

**Must achieve:**
1. ✅ ALL 6 templates generate `targetAudience` (3 groups)
2. ✅ ALL 6 templates generate `seoKeywords` (5 keywords)
3. ✅ Success rate > 90% (no empty arrays)
4. ✅ Content quality maintained or improved
5. ✅ Response time ≤ current (no performance regression)

**Nice to have:**
1. ⭐ 20-30% shorter prompts
2. ⭐ More flexible templates (variable product counts, etc.)
3. ⭐ Consistent tone across all templates
4. ⭐ Better platform-specific optimization

---

## 🔄 ROLLBACK PLAN

If optimization causes issues:

```bash
# Step 1: Immediate rollback
cp lib/templates/system-templates-before-optimization.ts.backup lib/templates/system-templates.ts

# Step 2: Analyze what went wrong
# - Which template failed?
# - Which field is problematic?
# - Is it tone, structure, or content?

# Step 3: Incremental fix
# - Fix one template at a time
# - Test thoroughly before moving to next
# - Keep backup of working versions
```

---

## 📝 TESTING CHECKLIST

After implementing optimizations:

### Test Set 1: Core Functionality
- [ ] Tech product (e.g., smartphone, laptop)
- [ ] Kitchen appliance (e.g., blender, air fryer)
- [ ] Beauty product (e.g., skincare, makeup)
- [ ] Food item (e.g., restaurant, recipe)
- [ ] Service (e.g., app, subscription)

### Test Set 2: Edge Cases
- [ ] Video with no transcript
- [ ] Video with short title only
- [ ] Non-Vietnamese product
- [ ] Multiple products in one video
- [ ] Tutorial content

### Validation for Each Test:
```typescript
// Check output structure
{
  // ... existing fields ...
  targetAudience: [
    "Gia đình trẻ 25-35 tuổi, thu nhập 15-25 triệu/tháng, cần thiết bị bếp tiện lợi",
    "Người độc thân 22-30 tuổi, thu nhập 10-15 triệu/tháng, nấu ăn ít",
    "Cặp vợ chồng trung niên 40-50 tuổi, thu nhập >30 triệu/tháng, yêu thích nấu nướng"
  ],
  seoKeywords: [
    "nồi chiên không dầu Philips HD9252",
    "review nồi chiên Philips",
    "mua nồi chiên không dầu",
    "so sánh nồi chiên không dầu",
    "giá nồi chiên Philips"
  ]
}

// Validate:
✅ targetAudience.length === 3
✅ seoKeywords.length === 5
✅ Each targetAudience includes: age + income + need
✅ Each seoKeyword is relevant and specific
✅ No empty arrays
✅ No generic descriptions
```

---

## 🎯 NEXT ACTIONS

**Immediate (after local testing of main prompt):**
1. Review this action plan
2. Decide on implementation timeline
3. Start with Phase 1 (Core Fields Addition)

**After Phase 1:**
1. Test all 6 templates with real data
2. Collect success rate metrics
3. Proceed to Phase 2 if successful

**Long-term:**
1. Monitor template performance in production
2. Collect user feedback on generated content
3. Iterate based on real-world usage data

---

**Kết luận**: Áp dụng cùng philosophy "Simple & Trust-based" đã thành công với main prompt vào 6 templates, với focus chính là bổ sung `targetAudience` và `seoKeywords` (5 từ khóa) vào TẤT CẢ templates, đồng thời đơn giản hóa instructions và tăng tính linh hoạt.
