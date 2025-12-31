# Migration Guide: Unified Templates Table

## Tổng quan

Migration này hợp nhất 2 bảng `prompt_templates` và `templates` thành một bảng `templates` duy nhất với đầy đủ fields để dễ dàng phát triển và mở rộng trong tương lai.

## Lợi ích

✅ **Single Source of Truth** - Chỉ một bảng cho tất cả templates
✅ **Flexible Schema** - Hỗ trợ cả simple và advanced use cases
✅ **Backward Compatible** - Giữ nguyên tất cả data cũ
✅ **Future-proof** - Dễ mở rộng với các loại template mới
✅ **Better Performance** - Ít join queries hơn

## Schema Mới

```sql
CREATE TABLE templates (
  -- Core
  id UUID PRIMARY KEY,
  user_id UUID, -- NULL cho system templates

  -- Basic
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Classification
  category VARCHAR(100) NOT NULL, -- 'product-review', 'tutorial', etc.
  platform VARCHAR(50), -- 'facebook', 'instagram', etc. (optional)
  content_type VARCHAR(50), -- Additional classification

  -- Template Content (REQUIRED)
  prompt_template TEXT NOT NULL, -- With {{variables}}
  variables JSONB NOT NULL DEFAULT '{}',

  -- Advanced (OPTIONAL - 10-element framework)
  config JSONB,
  role_instruction TEXT,
  objective TEXT,
  constraints JSONB,
  example_input TEXT,
  example_output TEXT,
  feedback_instructions TEXT,
  ai_parameters JSONB,
  additional_notes TEXT,

  -- Access Control
  is_system BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  version VARCHAR(20) DEFAULT '1.0',
  usage_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Migration Steps

### Bước 1: Backup Data

```bash
# Backup bảng prompt_templates hiện tại
pg_dump -t prompt_templates $DATABASE_URL > backup_prompt_templates.sql
```

### Bước 2: Chạy Migration

Trong Supabase SQL Editor, chạy file:

```sql
-- File: sql/migrate-merge-templates-tables.sql
```

Hoặc command line:

```bash
psql $SUPABASE_DATABASE_URL -f sql/migrate-merge-templates-tables.sql
```

Migration sẽ:
1. ✅ Drop bảng `templates` cũ (simple version)
2. ✅ Backup bảng `prompt_templates` → `templates_backup`
3. ✅ Tạo bảng `templates` mới với full schema
4. ✅ Migrate data từ `templates_backup` sang `templates`
5. ✅ Insert 2 system templates: Product Review + Tutorial
6. ✅ Setup indexes, RLS policies, triggers

### Bước 3: Cập nhật Code

#### 3.1. Update `lib/db/supabase.ts`

**Thay đổi:**
```typescript
// TỪ:
.from('prompt_templates')

// THÀNH:
.from('templates')
```

**Các functions cần update:**
- `getTemplate(id)` - line 927
- `createTemplate(template)` - line 947
- `updateTemplate(id, updates)` - line 968
- `deleteTemplate(id)` - nếu có
- `getTemplates(filters)` - nếu có

**Example:**
```typescript
async getTemplate(id: string) {
  try {
    const adminClient = getFreshSupabaseAdminClient();
    const { data, error } = await adminClient
      .from('templates') // ✅ UPDATED
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching template:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception in getTemplate:', error);
    return null;
  }
},
```

#### 3.2. Update API Routes

**File:** `app/api/templates/route.ts` (line 52)

```typescript
// TỪ:
const templates = await db.getTemplates({...});

// THÀNH:
const { data: templates, error } = await supabaseAdmin
  .from('templates')
  .select('*')
  .eq('is_active', true)
  .order('created_at', { ascending: false });
```

#### 3.3. Update Frontend (nếu cần)

**File:** `app/dashboard/create-from-template/page.tsx` (line 166)

```typescript
// SỬ DỤNG API MỚI:
const templatesResponse = await fetch('/api/templates-simple?category=product-review');

// HOẶC query trực tiếp:
const { data } = await supabase
  .from('templates')
  .select('*')
  .eq('category', 'product-review')
  .eq('is_active', true);
```

### Bước 4: Verify Migration

Chạy queries sau để kiểm tra:

```sql
-- 1. Check total templates
SELECT COUNT(*) FROM templates;

-- 2. Check system templates
SELECT id, name, category, platform, is_system
FROM templates
WHERE is_system = true;

-- Expected: 2 rows (Product Review + Tutorial)

-- 3. Check migrated user templates
SELECT id, name, category, user_id, is_system
FROM templates
WHERE is_system = false
ORDER BY created_at DESC;

-- 4. Check by category
SELECT
  category,
  platform,
  COUNT(*) as count,
  SUM(CASE WHEN is_system THEN 1 ELSE 0 END) as system_count,
  SUM(CASE WHEN is_system THEN 0 ELSE 1 END) as user_count
FROM templates
WHERE is_active = true
GROUP BY category, platform;

-- Expected output example:
-- category       | platform  | count | system_count | user_count
-- product-review | facebook  | 3     | 1            | 2
-- tutorial       | facebook  | 1     | 1            | 0
```

### Bước 5: Test End-to-End

#### Test 1: Product Review Template
```bash
# Navigate to
http://localhost:3000/dashboard/create-from-template

# Steps:
1. Paste YouTube URL
2. Click "Phân tích Video"
3. Select: tone=friendly, language=vi, length=medium
4. Click "Generate Content"
5. Verify AI generates Product Review structure
```

#### Test 2: Tutorial Template
```bash
# Method 1: Update page to show template selector
# Method 2: Call API directly

curl -X POST http://localhost:3000/api/generate-review-from-template \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "template_id": "TUTORIAL_TEMPLATE_ID",
    "videoData": {
      "videoTitle": "Cách làm bánh mì",
      "platform": "YouTube"
    },
    "config": {
      "tone": "friendly",
      "language": "vi",
      "length": "medium"
    }
  }'
```

## Rollback Plan

Nếu có vấn đề, rollback bằng cách:

```sql
-- 1. Drop new templates table
DROP TABLE templates CASCADE;

-- 2. Restore from backup
ALTER TABLE templates_backup RENAME TO prompt_templates;

-- 3. Or restore from pg_dump
psql $DATABASE_URL < backup_prompt_templates.sql
```

## Post-Migration Cleanup

Sau khi verify migration thành công (1-2 tuần):

```sql
-- Drop backup table
DROP TABLE IF EXISTS templates_backup;

-- Optional: Clean up old SQL files
-- rm sql/create-templates-table.sql
-- rm sql/insert-tutorial-template.sql
-- rm sql/insert-product-review-template.sql
```

## Sử dụng Templates Mới

### Tạo System Template

```sql
INSERT INTO templates (
  name,
  category,
  platform,
  description,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active
) VALUES (
  'Comparison Template',
  'comparison',
  'facebook',
  'So sánh 2 sản phẩm',
  'Compare {{product1}} vs {{product2}}...',
  '{"product1": "Sản phẩm 1", "product2": "Sản phẩm 2"}'::jsonb,
  true,
  true,
  true
);
```

### Tạo User Template

```typescript
const { data } = await supabase
  .from('templates')
  .insert({
    user_id: userId,
    name: 'My Custom Template',
    category: 'custom',
    prompt_template: 'My prompt with {{variable}}',
    variables: { variable: 'Description' },
    is_system: false,
    is_public: false,
    is_active: true,
  });
```

### Query Templates

```typescript
// Get all active public templates
const { data } = await supabase
  .from('templates')
  .select('*')
  .eq('is_active', true)
  .or('is_public.eq.true,is_system.eq.true');

// Get user's templates
const { data } = await supabase
  .from('templates')
  .select('*')
  .eq('user_id', userId);

// Get templates by category
const { data } = await supabase
  .from('templates')
  .select('*')
  .eq('category', 'tutorial')
  .eq('is_active', true);
```

## Troubleshooting

### Lỗi: Table "templates" does not exist

**Nguyên nhân:** Migration chưa chạy
**Giải pháp:** Chạy `sql/migrate-merge-templates-tables.sql`

### Lỗi: Column "prompt_template" not found in old code

**Nguyên nhân:** Code vẫn reference bảng cũ
**Giải pháp:** Update tất cả `.from('prompt_templates')` → `.from('templates')`

### Lỗi: RLS policy preventing access

**Nguyên nhân:** User không có quyền
**Giải pháp:** Check RLS policies hoặc bypass bằng `supabaseAdmin`

### Templates không hiển thị

**Check:**
```sql
-- 1. Check is_active
SELECT * FROM templates WHERE is_active = false;

-- 2. Check RLS
SET ROLE authenticated;
SELECT * FROM templates;

-- 3. Check filters
SELECT category, COUNT(*) FROM templates GROUP BY category;
```

## Best Practices

1. ✅ **Always use `is_system` flag** cho system templates
2. ✅ **Set `user_id = NULL`** cho system templates
3. ✅ **Use `is_public`** để share user templates
4. ✅ **Increment `usage_count`** khi sử dụng template
5. ✅ **Version templates** khi có breaking changes
6. ✅ **Test với RLS enabled** trước khi deploy

## Summary

Migration này tạo một bảng `templates` thống nhất với:
- ✅ **27 columns** - Đầy đủ cho mọi use case
- ✅ **8 indexes** - Optimized performance
- ✅ **6 RLS policies** - Secure access control
- ✅ **2 system templates** - Product Review + Tutorial
- ✅ **Full backward compatibility** - Migrate toàn bộ data cũ

Sau migration, bạn có thể:
- Tạo bất kỳ loại template nào (simple hoặc advanced)
- Phân quyền user/system templates
- Track usage và version
- Mở rộng dễ dàng cho tương lai
