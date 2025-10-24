# Tab "Gợi ý" - Giải Thích Chi Tiết

## 🎯 Mục Đích của Tab "Gợi ý"

Tab "Gợi ý" sử dụng **AI để phân tích nội dung video** và **tự động gợi ý template phù hợp nhất**.

---

## 🔄 Luồng Hoạt Động

### **Bước 1: User Phân Tích Video**
```
1. User paste URL: https://youtube.com/watch?v=abc123
2. Click "Phân tích"
3. AI extract:
   ├─ video_title: "iPhone 15 Pro Max REVIEW - Sau 1 tuần!"
   ├─ video_description: "Review chi tiết iPhone 15..."
   ├─ transcript: "Xin chào! Hôm nay tôi review iPhone 15..."
   ├─ videoId: "abc123"
   └─ platform: "youtube"
```

### **Bước 2: User Chọn Mode "Template"**
```
Click "Dùng Template" → TemplateSelector component nhận props:
  - videoTitle: "iPhone 15 Pro Max REVIEW..."
  - videoDescription: "Review chi tiết..."
  - platform: "youtube" (hoặc "facebook" nếu không detect được)
```

### **Bước 3: Auto-call API Recommendation**
```typescript
// File: components/templates/TemplateSelector.tsx
useEffect(() => {
  if (videoTitle && activeTab === 'recommended') {
    getRecommendation(); // ← TỰ ĐỘNG GỌI
  }
}, [videoTitle, activeTab]);

const getRecommendation = async () => {
  setRecommendationLoading(true);

  const response = await fetch('/api/templates/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      video_title: "iPhone 15 Pro Max REVIEW...",
      video_description: "Review chi tiết...",
      platform: "facebook"
    }),
  });

  const data = await response.json();

  if (data.success) {
    setRecommendedTemplate(data.data.recommended_template);
  }

  setRecommendationLoading(false);
};
```

### **Bước 4: API Phân Tích & Gợi Ý**
```
POST /api/templates/recommend
     ↓
1. Get all active public templates from database
2. Analyze video_title với keyword matching:
   - "iPhone", "Pro Max", "REVIEW" → Category: TECH
   - "makeup", "skincare" → Category: BEAUTY
   - "recipe", "food" → Category: FOOD

3. Score each template:
   Tech Review - Facebook: 85% match
   Tech Review - Blog: 75% match
   Beauty Review: 10% match

4. Return best match:
{
  success: true,
  data: {
    recommended_template: { id: "xxx", name: "Tech Review - Facebook Style", ... },
    confidence: 85,
    alternatives: [ ... 3 other templates ... ]
  }
}
```

### **Bước 5: Hiển Thị Kết Quả**
```
┌───────────────────────────────────────────────┐
│ ✨ Template được gợi ý cho video của bạn      │
│ Dựa trên nội dung video, AI nhận thấy         │
│ template này phù hợp nhất                     │
└───────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 💻 Tech Review - Facebook Style (85% match) │
│                                              │
│ Review sản phẩm công nghệ cho Facebook       │
│ với tone casual, dễ hiểu                     │
│                                              │
│ Tone: Casual | Length: Medium | Emoji: ✅   │
│ Đã sử dụng: 12 lần                          │
│                                              │
│           [Chọn template]                    │
└──────────────────────────────────────────────┘

Templates tương tự (75-60% match):
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ Tech     │ │ Product  │ │Tutorial  │ │ Food     │
│ Blog     │ │Comparison│ │ Blog     │ │ TikTok   │
│ (75%)    │ │ (60%)    │ │ (55%)    │ │ (10%)    │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

---

## ❓ Vấn Đề Bạn Gặp Phải

### **Triệu chứng:**
Tab "Gợi ý" vẫn hiển thị:
```
[Icon Sparkles]
Nhập video URL để nhận gợi ý template từ AI
```

### **Nguyên nhân có thể:**

**1. Database chưa có templates** (Most likely)
```sql
SELECT COUNT(*) FROM prompt_templates WHERE is_active = true;
-- Result: 0 rows
```

**Giải pháp:** Chạy migration seed templates (như đã hướng dẫn trước)

---

**2. API không được gọi (Check console)**

Mở **Browser DevTools** (F12) → Tab **Console**, xem có log này không:
```
🤖 Getting template recommendation: { title: "iPhone 15...", platform: "facebook" }
```

Nếu KHÔNG có → `videoTitle` không được truyền vào hoặc `activeTab` không phải 'recommended'

---

**3. API trả về error (Check Network)**

Mở **DevTools** → Tab **Network** → Filter "recommend" → Xem response:

**Response thành công:**
```json
{
  "success": true,
  "data": {
    "recommended_template": { ... },
    "confidence": 85,
    "alternatives": [ ... ]
  }
}
```

**Response lỗi (No templates):**
```json
{
  "success": false,
  "error": "No templates available"
}
```

---

**4. Component state không update**

Check component code logic:
```typescript
// Should set recommendedTemplate
if (data.success) {
  setRecommendedTemplate(data.data.recommended_template);
}

// Render should show template if exists
{recommendedTemplate ? (
  <TemplateCard template={recommendedTemplate} />
) : (
  <p>Nhập video URL...</p> // ← BẠN ĐANG THẤY CÁI NÀY
)}
```

---

## 🔧 Debug Steps

### **Step 1: Check Database**
```sql
-- Chạy trong Supabase SQL Editor
SELECT id, name, category, platform, is_active, is_public
FROM prompt_templates
WHERE is_active = true
ORDER BY is_system DESC, created_at DESC;
```

**Expected:** 6 rows (system templates)

**If 0 rows:** Chạy migration `seed-system-templates.sql`

---

### **Step 2: Check Browser Console**

1. Open browser → Go to `/dashboard/create`
2. F12 → Console tab
3. Paste video URL → Analyze
4. Choose "Dùng Template"
5. Click tab "Gợi ý"
6. Look for:
   - ✅ `🤖 Getting template recommendation: ...`
   - ❌ Any error messages

---

### **Step 3: Check Network Requests**

1. F12 → Network tab
2. Filter: "recommend"
3. Click tab "Gợi ý"
4. Should see: `POST /api/templates/recommend`
5. Click on it → Check:
   - **Request Payload:** Should have video_title, platform
   - **Response:** Should have recommended_template

---

### **Step 4: Check Component Props**

Add console.log to debug:

```typescript
// In TemplateSelector component
console.log('TemplateSelector props:', {
  videoTitle,        // ← Should be "iPhone 15..."
  videoDescription,
  platform,
  activeTab,        // ← Should be "recommended"
});

console.log('Recommended template:', recommendedTemplate); // ← Should be template object
```

---

## ✅ When It Works Correctly

**Tab "Gợi ý" should show:**

```
┌────────────────────────────────────────────┐
│ 💡 Template được gợi ý cho video của bạn   │
│                                            │
│ Dựa trên nội dung "iPhone 15 Pro Max      │
│ REVIEW", AI nhận thấy template "Tech      │
│ Review - Facebook Style" phù hợp nhất     │
│ với video của bạn.                        │
│                                            │
│ Độ phù hợp: 85% ⭐⭐⭐⭐⭐                  │
└────────────────────────────────────────────┘

[Template Card hiển thị]

Templates tương tự:
[Grid of 4 alternative templates]
```

**User có thể:**
- Click "Chọn template" trên recommended template
- Hoặc click "Chọn" trên alternative templates
- Hoặc switch sang tab "Tất cả" / "System" để xem full list

---

## 🎯 Tóm Tắt

**Tab "Gợi ý" là gì?**
- AI tự động gợi ý template dựa trên nội dung video
- Tiết kiệm thời gian, không cần duyệt từng template

**Khi nào nó hoạt động?**
- Sau khi analyze video thành công
- Chọn mode "Template"
- Tab "Gợi ý" tự động call API
- Database có ít nhất 1 template active

**Khi nào nó KHÔNG hoạt động?**
- Chưa analyze video → Show "Nhập video URL..."
- Database trống (0 templates) → Show error
- API lỗi → Show error message

---

## 🚀 Next Actions

**Để tab "Gợi ý" hoạt động:**

1. **Chạy migration** (nếu chưa):
   ```sql
   -- File: sql/migrations/seed-system-templates.sql
   -- Paste vào Supabase SQL Editor
   ```

2. **Verify database**:
   ```sql
   SELECT COUNT(*) FROM prompt_templates WHERE is_active = true;
   -- Should return: 6
   ```

3. **Test again**:
   - Go to `/dashboard/create`
   - Analyze any tech video
   - Choose "Dùng Template"
   - Tab "Gợi ý" should show recommended template

4. **If still not working**:
   - F12 → Console → Screenshot errors
   - F12 → Network → Screenshot recommend API response
   - Send to me for debugging

---

Bạn hiểu rõ hơn chưa? Hãy chạy migration seed-system-templates.sql trước, sau đó test lại nhé! 🎉
