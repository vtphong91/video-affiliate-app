# AI Provider Management - Hướng dẫn sử dụng

## Tổng quan

Module AI Provider Management cho phép admin quản lý tất cả các AI providers trong hệ thống một cách linh hoạt, bao gồm:

- ✅ Xem danh sách tất cả AI providers
- ✅ Thêm provider mới không cần code
- ✅ Bật/tắt provider
- ✅ Xóa provider
- ✅ Theo dõi trạng thái API key
- ✅ Xem thông tin chi tiết (giá, tốc độ, context window, etc.)

## Cách sử dụng

### 1. Truy cập trang Settings

Đăng nhập với tài khoản Admin và truy cập:
```
/admin/settings
```

### 2. Xem danh sách AI Providers hiện có

Scroll xuống section **"Quản lý AI Providers"** với biểu tượng 🧠 (Brain).

Bạn sẽ thấy:
- **Tổng số providers**: Hiển thị ở badge bên cạnh tiêu đề
- **Danh sách providers**: Mỗi card hiển thị:
  - Display Name và trạng thái (Đang hoạt động / Tắt)
  - Provider name (tên kỹ thuật)
  - Loại: FREE (miễn phí) / CHEAP (rẻ) / PAID (trả phí)
  - Thứ tự ưu tiên (#1, #2, #3...)
  - Chi phí per 1M tokens
  - Tốc độ (tokens/s)
  - Trạng thái API Key (Đã cấu hình / Chưa cấu hình)

### 3. Thêm AI Provider mới

#### Bước 1: Click nút "Thêm AI Provider"

Một modal sẽ hiện ra với form nhập liệu.

#### Bước 2: Điền thông tin

**Thông tin bắt buộc (*)**:
- **Provider Name**: Tên kỹ thuật (lowercase, không dấu)
  - Ví dụ: `deepseek`, `cohere`, `together`
  - Tên này sẽ được dùng trong code

- **Display Name**: Tên hiển thị đẹp
  - Ví dụ: `DeepSeek V3 (685B)`, `Cohere Command R+`

- **Provider Type**: Chọn loại
  - `Free (Miễn phí)`: Providers miễn phí hoàn toàn
  - `Cheap (Rẻ)`: Providers rẻ (~$0.5-2/1M tokens)
  - `Paid (Trả phí)`: Providers đắt (>$2/1M tokens)

**Thông tin tùy chọn**:
- **Priority Order**: Thứ tự ưu tiên (số càng nhỏ càng ưu tiên)
  - Ví dụ: 1, 2, 3... 999
  - Hệ thống sẽ thử providers theo thứ tự này

- **API Key Environment Variable**: Tên biến môi trường
  - Ví dụ: `DEEPSEEK_API_KEY`, `COHERE_API_KEY`
  - Phải khớp với tên trong file `.env.local`

- **Model Name**: Model identifier
  - Ví dụ: `deepseek-chat`, `command-r-plus`, `mixtral-8x7b`

- **Base URL**: API endpoint
  - Ví dụ: `https://api.deepseek.com`, `https://api.cohere.ai`

- **Cost per Million Tokens**: Chi phí ($)
  - Ví dụ: `0` (free), `2.5`, `10`

- **Tokens per Second**: Tốc độ
  - Ví dụ: `500`, `800`, `150`

- **Free Tier Limit**: Giới hạn free tier
  - Ví dụ: `999999` (unlimited), `1500` (requests/day)

- **Context Window**: Kích thước context
  - Ví dụ: `64000`, `128000`, `200000`

#### Bước 3: Click "Thêm Provider"

Provider mới sẽ được lưu vào database và hiển thị ngay lập tức.

### 4. Bật/Tắt Provider

- Click icon 👁️ (Eye) để **tắt** provider
- Click icon 👁️‍🗨️ (EyeOff) để **bật** provider

Provider bị tắt sẽ không được sử dụng trong quá trình phân tích video.

### 5. Xóa Provider

- Click icon 🗑️ (Trash) để xóa provider
- Xác nhận trong dialog popup
- Provider sẽ bị xóa khỏi database

⚠️ **Cảnh báo**: Hành động này không thể hoàn tác!

## Cấu hình API Key

Sau khi thêm provider mới, bạn cần cấu hình API key:

### 1. Thêm API Key vào `.env.local`

Mở file `.env.local` và thêm:

```env
# Ví dụ cho DeepSeek
DEEPSEEK_API_KEY=sk-your-actual-api-key-here

# Ví dụ cho Cohere
COHERE_API_KEY=your-cohere-api-key-here
```

### 2. Restart server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### 3. Kiểm tra trạng thái

Quay lại trang Settings, badge "API Key" sẽ chuyển từ:
- ❌ **Chưa cấu hình** (đỏ)
- ✅ **Đã cấu hình** (xanh)

## Ví dụ thêm Providers phổ biến

### DeepSeek V3 (FREE - Recommended)

```
Provider Name: deepseek
Display Name: DeepSeek V3 (685B)
Provider Type: Free
Priority Order: 2
API Key Env Var: DEEPSEEK_API_KEY
Model Name: deepseek-chat
Base URL: https://api.deepseek.com
Cost: 0
Tokens/sec: 500
Free Tier: 999999
Context Window: 64000
```

**Lấy API key**: https://platform.deepseek.com

### Cohere Command R+ (FREE trial)

```
Provider Name: cohere
Display Name: Cohere Command R+
Provider Type: free
Priority Order: 3
API Key Env Var: COHERE_API_KEY
Model Name: command-r-plus
Base URL: https://api.cohere.ai
Cost: 0
Tokens/sec: 200
Free Tier: 1000
Context Window: 128000
```

**Lấy API key**: https://dashboard.cohere.com/api-keys

### Together AI Mixtral (CHEAP)

```
Provider Name: together
Display Name: Together AI Mixtral 8x7B
Provider Type: cheap
Priority Order: 5
API Key Env Var: TOGETHER_API_KEY
Model Name: mistralai/Mixtral-8x7B-Instruct-v0.1
Base URL: https://api.together.xyz
Cost: 0.6
Tokens/sec: 300
Free Tier: 0
Context Window: 32000
```

**Lấy API key**: https://api.together.xyz/settings/api-keys

### Hugging Face Inference (FREE)

```
Provider Name: huggingface
Display Name: Hugging Face Inference API
Provider Type: free
Priority Order: 4
API Key Env Var: HUGGINGFACE_API_KEY
Model Name: meta-llama/Llama-2-70b-chat-hf
Base URL: https://api-inference.huggingface.co
Cost: 0
Tokens/sec: 100
Free Tier: 30000
Context Window: 4096
```

**Lấy API key**: https://huggingface.co/settings/tokens

## Thứ tự ưu tiên nên dùng

Để tối ưu chi phí và hiệu năng, đặt thứ tự như sau:

1. **Gemini** (Priority: 1) - FREE, 1500 req/day, nhanh
2. **DeepSeek V3** (Priority: 2) - FREE, chất lượng cao, 685B params
3. **Groq** (Priority: 3) - FREE, siêu nhanh 800 tokens/s
4. **Cohere** (Priority: 4) - FREE trial, context window lớn
5. **Mistral** (Priority: 5) - CHEAP, ~$2/1M tokens
6. **OpenAI** (Priority: 6) - PAID, $10/1M tokens
7. **Claude** (Priority: 7) - PAID, $3/1M tokens

## Database Schema

Providers được lưu trong 2 bảng:

### `ai_provider_settings`
```sql
- id (UUID)
- provider_name (VARCHAR) - Unique
- display_name (VARCHAR)
- provider_type (VARCHAR) - 'free', 'cheap', 'paid'
- is_enabled (BOOLEAN)
- priority_order (INTEGER)
- api_key_configured (BOOLEAN)
- cost_per_million_tokens (DECIMAL)
- tokens_per_second (INTEGER)
- free_tier_limit (INTEGER)
- context_window (INTEGER)
- total_requests (INTEGER)
- successful_requests (INTEGER)
- failed_requests (INTEGER)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### `ai_provider_metadata`
```sql
- id (UUID)
- provider_name (VARCHAR) - Foreign Key
- base_url (TEXT)
- model_name (VARCHAR)
- api_key_env_var (VARCHAR)
- extra_config (JSONB)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

## API Endpoints

### GET `/api/admin/settings/ai-providers`
Lấy danh sách tất cả providers

**Response**:
```json
{
  "success": true,
  "providers": [...]
}
```

### POST `/api/admin/settings/ai-providers`
Thêm provider mới

**Request Body**:
```json
{
  "provider_name": "deepseek",
  "display_name": "DeepSeek V3",
  "provider_type": "free",
  "priority_order": 2,
  "api_key_env_var": "DEEPSEEK_API_KEY",
  "base_url": "https://api.deepseek.com",
  "model_name": "deepseek-chat",
  "cost_per_million_tokens": 0,
  "tokens_per_second": 500,
  "free_tier_limit": 999999,
  "context_window": 64000
}
```

### PUT `/api/admin/settings/ai-providers`
Cập nhật provider

**Request Body**:
```json
{
  "provider_name": "deepseek",
  "updates": {
    "is_enabled": false
  }
}
```

### DELETE `/api/admin/settings/ai-providers?provider_name=deepseek`
Xóa provider

## Troubleshooting

### Provider không xuất hiện trong danh sách
1. Kiểm tra database có table `ai_provider_settings` chưa
2. Chạy SQL migration: `sql/create-ai-provider-metadata-table.sql`

### API Key hiển thị "Chưa cấu hình"
1. Kiểm tra tên biến trong `.env.local` khớp với `api_key_env_var`
2. Restart server: `Ctrl+C` → `npm run dev`
3. Refresh trang Settings

### Provider bị lỗi khi phân tích video
1. Check API key đúng chưa
2. Check base URL và model name đúng format
3. Xem logs tại console/terminal
4. Test provider riêng tại `/admin/ai-settings`

## Tích hợp với Code

Để sử dụng provider mới trong code, bạn cần:

### 1. Tạo file provider trong `lib/ai/`

Ví dụ: `lib/ai/cohere.ts`

```typescript
import { VideoInfo, AIAnalysis } from '@/types';
import { generateAnalysisPrompt } from './prompts';

let cohereClient: any = null;

function getCohereClient() {
  if (!cohereClient) {
    // Import Cohere SDK
    const { CohereClient } = require('cohere-ai');
    cohereClient = new CohereClient({
      token: process.env.COHERE_API_KEY || '',
    });
  }
  return cohereClient;
}

export async function analyzeVideoWithCohere(videoInfo: VideoInfo): Promise<AIAnalysis> {
  const prompt = generateAnalysisPrompt(videoInfo);

  const response = await getCohereClient().chat({
    model: 'command-r-plus',
    message: prompt,
    temperature: 0.7,
  });

  // Parse response và return AIAnalysis
  // ...
}
```

### 2. Thêm vào `lib/ai/index.ts`

```typescript
import { analyzeVideoWithCohere } from './cohere';

// Add to AIProvider type
type AIProvider =
  | 'gemini'
  | 'deepseek'
  | 'groq'
  | 'mistral'
  | 'cohere'  // NEW
  | 'openai'
  | 'claude';

// Add to availableProviders
if (process.env.COHERE_API_KEY) availableProviders.push('cohere');

// Add to switch case
switch (currentProvider) {
  // ...
  case 'cohere':
    result = await analyzeVideoWithCohere(videoInfo);
    break;
  // ...
}

// Export
export * from './cohere';
```

### 3. Install SDK (nếu cần)

```bash
npm install cohere-ai
```

## Kết luận

Module AI Provider Management giúp bạn:
- ✅ Linh hoạt thêm/xóa providers không cần code
- ✅ Dễ dàng quản lý và theo dõi trạng thái
- ✅ Tối ưu chi phí bằng cách ưu tiên FREE providers
- ✅ Nhanh chóng thử nghiệm providers mới

Nếu có vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ admin.
