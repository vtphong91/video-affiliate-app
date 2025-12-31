# Hướng Dẫn Chọn Model Gemini

## 🎯 Tổng Quan

Hệ thống đã được cập nhật để cho phép **chọn model Gemini linh hoạt** thay vì hard-code. Bạn có thể chọn từ nhiều model Gemini khác nhau để tối ưu hiệu suất và chi phí.

---

## 📋 Các Model Gemini Khả Dụng

### ✨ **Gemini 2.x Series** (Recommended - Mới nhất)

#### 1. **gemini-2.5-flash** ⚡ **BEST CHOICE**
- **Type**: Free tier
- **Performance**:
  - RPM (Requests/minute): **Unlimited** 🚀
  - TPM (Tokens/minute): **1M** (1,000,000)
  - Current usage: 2.19K/250K TPM
- **Ưu điểm**:
  - ✅ Không giới hạn số request/phút
  - ✅ Throughput cực cao (1M tokens/phút)
  - ✅ Miễn phí
  - ✅ Hiệu suất tốt nhất trong dòng Flash
- **Nhược điểm**: Không có
- **Khuyến nghị**: **Sử dụng cho production**

#### 2. **gemini-2.5-flash-lite**
- **Type**: Free tier
- **Performance**:
  - RPM: 10/minute
  - TPM: 250K
- **Ưu điểm**:
  - ✅ Miễn phí
  - ✅ Nhanh (lite version)
- **Nhược điểm**:
  - ❌ Giới hạn 10 requests/phút
  - ❌ Chất lượng thấp hơn bản Flash
- **Khuyến nghị**: Dùng cho testing hoặc workload nhẹ

---

### 🧪 **Gemini 3.x Series** (Experimental - Thử nghiệm)

#### 3. **gemini-3-flash**
- **Type**: Test-out model
- **Performance**:
  - RPM: 5/minute
  - TPM: 250K
- **Ưu điểm**:
  - ✅ Model mới nhất (experimental)
  - ✅ Có thể có features mới
- **Nhược điểm**:
  - ❌ Test-out (chưa stable)
  - ❌ Giới hạn 5 requests/phút
  - ❌ Có thể thay đổi bất ngờ
- **Khuyến nghị**: **Chỉ dùng cho testing**, không production

---

### 📦 **Gemini 1.x Series** (Stable - Cũ hơn)

#### 4. **gemini-1.5-flash** ⚠️ Deprecated
- **Type**: Free tier
- **Performance**:
  - RPM: 5/minute
  - TPM: 250K
- **Status**: **Deprecated** - Nên upgrade lên 2.5-flash
- **Khuyến nghị**: **Không nên dùng** - đã có phiên bản tốt hơn

#### 5. **gemini-1.5-flash-lite**
- **Type**: Free tier
- **Performance**:
  - RPM: 10/minute
  - TPM: 250K
- **Status**: Stable nhưng cũ
- **Khuyến nghị**: Dùng gemini-2.5-flash-lite thay thế

---

## 🚀 Cách Thay Đổi Model

### **Option 1: Qua UI (Recommended)**

1. Truy cập: http://localhost:3000/admin/ai-settings
2. Click tab **"Manage Providers"**
3. Click nút **Edit** (✏️) ở provider **Gemini**
4. Tại field **"Model Name"**, chọn model từ dropdown:
   ```
   ✨ Gemini 2.x (Recommended - Latest)
     ├─ gemini-2.5-flash (Unlimited RPM, 1M TPM) ⚡ BEST
     └─ gemini-2.5-flash-lite (250K TPM)

   🧪 Gemini 3.x (Experimental)
     └─ gemini-3-flash (Test-out model, 250K TPM)

   📦 Gemini 1.x (Stable - Older)
     ├─ gemini-1.5-flash (250K TPM) - Deprecated
     └─ gemini-1.5-flash-lite (250K TPM)
   ```
5. Click **"Cập nhật Provider"**
6. ✅ Xong! Model mới sẽ được sử dụng ngay lập tức

### **Option 2: Qua SQL**

```sql
-- Update lên gemini-2.5-flash (RECOMMENDED)
UPDATE ai_provider_metadata
SET model_name = 'gemini-2.5-flash', updated_at = NOW()
WHERE provider_name = 'gemini';

-- Hoặc thử gemini-3-flash (experimental)
UPDATE ai_provider_metadata
SET model_name = 'gemini-3-flash', updated_at = NOW()
WHERE provider_name = 'gemini';

-- Verify kết quả
SELECT provider_name, model_name, updated_at
FROM ai_provider_metadata
WHERE provider_name = 'gemini';
```

---

## 📊 So Sánh Hiệu Suất

| Model | RPM | TPM | Status | Khuyến Nghị |
|-------|-----|-----|--------|-------------|
| **gemini-2.5-flash** | **Unlimited** | **1M** | Stable | ✅ **BEST - Dùng cho production** |
| gemini-2.5-flash-lite | 10 | 250K | Stable | ⚠️ OK cho workload nhẹ |
| gemini-3-flash | 5 | 250K | Experimental | 🧪 Test only |
| gemini-1.5-flash | 5 | 250K | Deprecated | ❌ Nên upgrade |
| gemini-1.5-flash-lite | 10 | 250K | Stable | ❌ Dùng 2.5-lite thay thế |

### Giải thích:
- **RPM** (Requests Per Minute): Số requests tối đa/phút
- **TPM** (Tokens Per Minute): Số tokens tối đa/phút
- **Unlimited RPM**: Không giới hạn số request (chỉ giới hạn tokens)

---

## 💡 Khuyến Nghị Theo Use Case

### 1. **Production App - High Traffic**
```
Dùng: gemini-2.5-flash
Lý do: Unlimited RPM, TPM cao nhất (1M), miễn phí
```

### 2. **Development & Testing**
```
Dùng: gemini-2.5-flash-lite
Lý do: Đủ nhanh, miễn phí, tiết kiệm tokens
```

### 3. **Thử Nghiệm Features Mới**
```
Dùng: gemini-3-flash
Lý do: Model mới nhất, có thể có features mới
Cảnh báo: Không stable, chỉ test thôi!
```

### 4. **Budget-Conscious (Tiết kiệm chi phí)**
```
Dùng: gemini-2.5-flash
Lý do: Miễn phí + hiệu suất cao nhất
```

---

## 🔧 Technical Implementation

### Code Flow

```
User selects model in UI
       ↓
Save to database (ai_provider_metadata.model_name)
       ↓
When analyzing video:
  ├─ lib/ai/gemini.ts reads model from DB
  ├─ getConfiguredGeminiModel() queries DB
  ├─ Returns model name (e.g., "gemini-2.5-flash")
  └─ Uses that model for API call
       ↓
Google Gemini API processes request with selected model
       ↓
Returns analysis result
```

### Fallback Logic

Nếu không đọc được model từ database, hệ thống tự động fallback:

```typescript
// Default fallback: gemini-1.5-flash
async function getConfiguredGeminiModel(): Promise<string> {
  try {
    // Try to fetch from database
    const model = await supabase.from('ai_provider_metadata')...;

    if (error) {
      console.warn('⚠️ Using default: gemini-1.5-flash');
      return 'gemini-1.5-flash'; // Fallback
    }

    return model.model_name;
  } catch {
    return 'gemini-1.5-flash'; // Fallback
  }
}
```

---

## 📝 Migration Guide

### Nâng Cấp Từ 1.5-flash Lên 2.5-flash

**Bước 1**: Chạy SQL migration script
```bash
# File: sql/update-gemini-to-2-5-flash.sql
# Copy script vào Supabase SQL Editor và Run
```

**Bước 2**: Verify kết quả
```sql
SELECT provider_name, model_name FROM ai_provider_metadata
WHERE provider_name = 'gemini';

-- Expected: model_name = 'gemini-2.5-flash'
```

**Bước 3**: Test
- Tạo 1 review mới từ video
- Check console logs: `🤖 Gemini - Using model: gemini-2.5-flash`
- Verify review quality tốt hơn

---

## 🐛 Troubleshooting

### Issue 1: Model không thay đổi sau khi update UI

**Nguyên nhân**: Cache hoặc chưa refresh
**Giải pháp**:
```sql
-- Verify database đã update chưa
SELECT model_name FROM ai_provider_metadata WHERE provider_name = 'gemini';

-- Nếu chưa update, chạy lại:
UPDATE ai_provider_metadata SET model_name = 'gemini-2.5-flash'
WHERE provider_name = 'gemini';
```

### Issue 2: Error "Model not found"

**Nguyên nhân**: Nhập sai tên model
**Giải pháp**: Dùng dropdown trong UI thay vì nhập tay

### Issue 3: Rate limit exceeded

**Nguyên nhân**: Dùng model có RPM thấp (5/minute)
**Giải pháp**: Chuyển sang **gemini-2.5-flash** (unlimited RPM)

---

## 📚 Tài Liệu Tham Khảo

- [Google AI Studio - Gemini API Docs](https://ai.google.dev/)
- [Gemini Rate Limits](https://ai.google.dev/pricing)
- [Model Comparison](https://ai.google.dev/models/gemini)

---

## ✅ Checklist

- [x] ✅ Gemini service đọc model từ database
- [x] ✅ UI có dropdown chọn model
- [x] ✅ SQL migration script để update model
- [x] ✅ Fallback logic nếu DB error
- [x] ✅ Logging để debug model selection
- [ ] ⏳ Test với các model khác nhau
- [ ] ⏳ Monitor performance difference

---

**Recommendation**: Ngay lập tức update lên **gemini-2.5-flash** để tận dụng unlimited RPM và TPM cao nhất! 🚀
