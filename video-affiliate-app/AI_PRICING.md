# 💰 Chi Phí API & Giải Pháp Thay Thế Miễn Phí

## 📊 OpenAI Pricing (Có Phí)

### Model GPT-4o-mini (Đang dùng)
- **Input:** $0.150 / 1M tokens (~$0.00015/request)
- **Output:** $0.600 / 1M tokens (~$0.0006/request)
- **Chi phí/request:** ~$0.001 (0.001 USD = 25 VNĐ)

### Ước tính chi phí:
- **1 video analysis:** ~2000 tokens = **$0.0012** (~30 VNĐ)
- **100 reviews/tháng:** ~$0.12 (3,000 VNĐ)
- **1000 reviews/tháng:** ~$1.2 (30,000 VNĐ)

### Model khác:
| Model | Input | Output | Chi phí/review |
|-------|-------|--------|----------------|
| GPT-4o-mini | $0.15/1M | $0.60/1M | ~$0.0012 |
| GPT-3.5-turbo | $0.50/1M | $1.50/1M | ~$0.004 |
| GPT-4o | $2.50/1M | $10/1M | ~$0.025 |

### ✅ Ưu điểm OpenAI:
- Chất lượng AI tốt nhất
- Hỗ trợ JSON mode
- Stable, reliable
- Tiếng Việt tốt

### ❌ Nhược điểm:
- Cần credit card để setup
- Minimum $5 deposit
- Không có free tier

---

## 🆓 Giải Pháp MIỄN PHÍ

### 1️⃣ **Google Gemini API** ⭐ (KHUYÊN DÙNG)

**Free Tier:**
- ✅ **1500 requests/day** (45,000/tháng)
- ✅ Gemini 1.5 Flash miễn phí vĩnh viễn
- ✅ 1M tokens/minute
- ✅ KHÔNG CẦN thẻ tín dụng

**Pricing:**
| Model | Free Tier | Paid |
|-------|-----------|------|
| Gemini 1.5 Flash | 1500 req/day | $0.075/1M tokens |
| Gemini 1.5 Pro | 50 req/day | $1.25/1M tokens |

**Setup:**
```bash
# 1. Lấy API key tại: https://ai.google.dev/
# 2. Thêm vào .env.local:
GOOGLE_AI_API_KEY=AIza...

# 3. Install package:
npm install @google/generative-ai
```

**Chi phí:**
- ✅ FREE: 1500 reviews/ngày
- ✅ Chất lượng tương đương GPT-4

---

### 2️⃣ **Groq API** ⚡ (CỰC NHANH)

**Free Tier:**
- ✅ **30 requests/minute**
- ✅ 14,400/day, 6000/hour
- ✅ Llama 3.1, Mixtral miễn phí
- ✅ Tốc độ cực nhanh (800 tokens/sec)

**Setup:**
```bash
# 1. Lấy API key: https://console.groq.com
# 2. Thêm vào .env.local:
GROQ_API_KEY=gsk_...

# 3. Install:
npm install groq-sdk
```

**Models miễn phí:**
- Llama 3.1 70B
- Llama 3.1 8B
- Mixtral 8x7B

---

### 3️⃣ **Anthropic Claude** (Free Trial)

**Free Trial:**
- ✅ $5 credit miễn phí
- ✅ ~2000 requests với Claude Haiku
- ✅ Chất lượng xuất sắc với tiếng Việt

**Pricing:**
| Model | Input | Output |
|-------|-------|--------|
| Claude 3.5 Haiku | $0.25/1M | $1.25/1M |
| Claude 3.5 Sonnet | $3/1M | $15/1M |

---

### 4️⃣ **Mistral AI**

**Free Tier:**
- ✅ Mistral-small miễn phí
- ✅ Rate limit: 5 req/sec
- ❌ Tiếng Việt kém hơn

---

### 5️⃣ **Cohere**

**Free Trial:**
- ✅ 100 API calls/month
- ❌ Quá ít cho production

---

## 🎯 KHUYẾN NGHỊ

### Option 1: MIỄN PHÍ - Google Gemini ⭐
```typescript
// lib/ai/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export async function analyzeVideoWithGemini(videoInfo) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

**Lý do:**
- ✅ 1500 requests/day = 45,000/tháng
- ✅ Hoàn toàn miễn phí
- ✅ Chất lượng tốt
- ✅ Tiếng Việt OK
- ✅ Không cần thẻ

### Option 2: CỰC NHANH - Groq
```typescript
// lib/ai/groq.ts
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function analyzeVideoWithGroq(videoInfo) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-70b-versatile',
    messages: [...],
    temperature: 0.7,
  });
  return JSON.parse(completion.choices[0].message.content);
}
```

**Lý do:**
- ✅ Miễn phí
- ✅ Tốc độ cực nhanh
- ❌ Tiếng Việt trung bình

### Option 3: CHẤT LƯỢNG CAO - OpenAI (Trả phí)
- Chi phí thấp: ~30 VNĐ/review
- Phù hợp nếu cần chất lượng tốt nhất
- Minimum deposit: $5 (~125k VNĐ)

---

## 📈 So Sánh Tổng Thể

| Provider | Free Tier | Quality | Speed | Vietnamese |
|----------|-----------|---------|-------|------------|
| **Gemini** | ⭐ 1500/day | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Groq** | ⭐ 14400/day | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **OpenAI** | ❌ No | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Claude** | ⚠️ Trial | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 💡 HƯỚNG DẪN SETUP GEMINI (KHUYÊN DÙNG)

### Bước 1: Lấy API Key
1. Truy cập: https://ai.google.dev/
2. Click "Get API Key"
3. Đăng nhập Google
4. Tạo project mới
5. Copy API key

### Bước 2: Install Package
```bash
cd video-affiliate-app
npm install @google/generative-ai
```

### Bước 3: Thêm vào .env.local
```bash
GOOGLE_AI_API_KEY=AIza...
```

### Bước 4: Tôi sẽ tạo file tích hợp
Tôi sẽ code sẵn Gemini integration cho bạn!

---

## 🎁 TỔNG KẾT

**Cho người mới/test:**
→ Dùng **Google Gemini** (miễn phí vĩnh viễn)

**Cho production nhỏ (< 1000 req/tháng):**
→ Dùng **Google Gemini** hoặc **Groq**

**Cho production lớn, cần chất lượng cao:**
→ Dùng **OpenAI GPT-4o-mini** (~30k VNĐ/tháng)

**Tốt nhất:**
→ Cho user chọn AI provider trong settings!
