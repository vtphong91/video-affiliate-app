-- Migration: Merge prompt_templates and templates into unified templates table
-- This creates a single templates table with all necessary fields for future expansion

-- Step 1: Drop existing templates table (simple version)
DROP TABLE IF EXISTS templates CASCADE;

-- Step 2: Rename prompt_templates to templates
ALTER TABLE IF EXISTS prompt_templates RENAME TO templates_backup;

-- Step 3: Create new unified templates table with all fields
CREATE TABLE templates (
  -- Core identification
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic information
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- Categorization
  category VARCHAR(100) NOT NULL, -- 'product-review', 'tutorial', 'comparison', 'general', etc.
  platform VARCHAR(50), -- 'facebook', 'instagram', 'tiktok', etc. (nullable for flexibility)
  content_type VARCHAR(50), -- Additional type classification

  -- Template content (Core fields)
  prompt_template TEXT NOT NULL, -- Template with {{variables}} for substitution
  variables JSONB NOT NULL DEFAULT '{}'::jsonb, -- Define what variables this template needs

  -- Advanced configuration (10-element framework - optional)
  config JSONB, -- Template configuration
  role_instruction TEXT, -- Element 2: Role instruction for AI
  objective TEXT, -- Element 3: Clear objective
  constraints JSONB, -- Element 5: Constraints and rules
  example_input TEXT, -- Element 6: Example input
  example_output TEXT, -- Element 6: Example output
  feedback_instructions TEXT, -- Element 8: Feedback loop instructions
  ai_parameters JSONB, -- Element 9: AI-specific parameters
  additional_notes TEXT, -- Element 10: Additional notes

  -- Access control
  is_system BOOLEAN DEFAULT false, -- System template vs user template
  is_public BOOLEAN DEFAULT false, -- Public visibility
  is_active BOOLEAN DEFAULT true, -- Active status

  -- Metadata
  version VARCHAR(20) DEFAULT '1.0', -- Template version
  usage_count INTEGER DEFAULT 0, -- Track usage

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_platform ON templates(platform);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_is_system ON templates(is_system);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_templates_usage_count ON templates(usage_count DESC);

-- Step 5: Add RLS (Row Level Security) policies
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active public templates" ON templates;
DROP POLICY IF EXISTS "Users can view own templates" ON templates;
DROP POLICY IF EXISTS "Users can create own templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

-- Policy 1: Anyone can view active public templates
CREATE POLICY "Anyone can view active public templates"
  ON templates
  FOR SELECT
  USING (is_active = true AND (is_public = true OR is_system = true));

-- Policy 2: Users can view their own templates
CREATE POLICY "Users can view own templates"
  ON templates
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 3: Users can create their own templates
CREATE POLICY "Users can create own templates"
  ON templates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = false);

-- Policy 4: Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON templates
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON templates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 6: Admins can manage all templates (if you have admin role)
-- Uncomment if you have admin role in your app
-- CREATE POLICY "Admins can manage all templates"
--   ON templates
--   FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   );

-- Step 6: Add updated_at trigger
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS templates_updated_at_trigger ON templates;
CREATE TRIGGER templates_updated_at_trigger
  BEFORE UPDATE ON templates
  FOR EACH ROW
  EXECUTE FUNCTION update_templates_updated_at();

-- Step 7: Add usage count increment function
CREATE OR REPLACE FUNCTION increment_template_usage(template_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE templates
  SET usage_count = usage_count + 1
  WHERE id = template_uuid;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Migrate data from backup (if exists)
-- This preserves existing data from prompt_templates
INSERT INTO templates (
  id,
  user_id,
  name,
  description,
  category,
  platform,
  content_type,
  prompt_template,
  variables,
  config,
  role_instruction,
  objective,
  constraints,
  example_input,
  example_output,
  feedback_instructions,
  ai_parameters,
  additional_notes,
  is_system,
  is_public,
  is_active,
  version,
  usage_count,
  created_at,
  updated_at
)
SELECT
  id,
  user_id,
  name,
  description,
  category,
  platform,
  content_type,
  COALESCE(prompt_template, ''),
  COALESCE(variables, '{}'::jsonb),
  config,
  role_instruction,
  objective,
  constraints,
  example_input,
  example_output,
  feedback_instructions,
  ai_parameters,
  additional_notes,
  COALESCE(is_system, false),
  COALESCE(is_public, false),
  COALESCE(is_active, true),
  COALESCE(version, '1.0'),
  COALESCE(usage_count, 0),
  created_at,
  updated_at
FROM templates_backup
WHERE EXISTS (SELECT 1 FROM templates_backup LIMIT 1);

-- Step 9: Insert Product Review template (system template)
INSERT INTO templates (
  id,
  user_id,
  name,
  category,
  platform,
  description,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  version
) VALUES (
  gen_random_uuid(),
  NULL, -- System template, no user ownership
  'Facebook Product Review Optimized',
  'product-review',
  'facebook',
  'Template mặc định để tạo review sản phẩm từ video cho Facebook. Tối ưu hóa cho engagement và conversion.',
  'Bạn đang phân tích một video review sản phẩm để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Phân tích Sản phẩm:**
   - Tên sản phẩm và thương hiệu
   - Tính năng chính
   - Ưu điểm nổi bật
   - Nhược điểm (nếu có)
   - Đối tượng phù hợp

2. **Tone và Style:**
   - Tone: {{tone}}
   - Ngôn ngữ: {{language}}
   - Độ dài: {{length}}
   - Tự nhiên, chân thực, khách quan

3. **SEO Optimization:**
   - Tạo 5 keywords liên quan đến sản phẩm
   - Target audience cụ thể

4. **Call-to-Action:**
   - Khuyến khích người đọc tìm hiểu thêm
   - Không quá aggressive, tự nhiên

🎨 OUTPUT YÊU CẦU:

Trả về JSON với cấu trúc sau:

{
  "summary": "Tóm tắt ngắn gọn về sản phẩm và review (2-3 câu)",
  "pros": ["Ưu điểm 1", "Ưu điểm 2", "Ưu điểm 3"],
  "cons": ["Nhược điểm 1", "Nhược điểm 2"],
  "keyPoints": [{"time": "00:00", "content": "Điểm nổi bật"}],
  "mainContent": "Nội dung review chi tiết dạng markdown",
  "cta": "Lời kêu gọi hành động tự nhiên",
  "targetAudience": ["Đối tượng 1", "Đối tượng 2"],
  "seoKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}',
  '{
    "videoTitle": "Tiêu đề video",
    "videoDescription": "Mô tả video",
    "channelName": "Tên kênh",
    "platform": "Nền tảng (YouTube, TikTok)",
    "transcript": "Nội dung video",
    "tone": "Giọng điệu (casual, professional, friendly)",
    "language": "Ngôn ngữ (vi, en)",
    "length": "Độ dài (short, medium, long)"
  }'::jsonb,
  true, -- is_system
  true, -- is_public
  true, -- is_active
  '2.0'  -- version
) ON CONFLICT (id) DO NOTHING;

-- Step 10: Insert Tutorial template (system template)
INSERT INTO templates (
  id,
  user_id,
  name,
  category,
  platform,
  description,
  prompt_template,
  variables,
  is_system,
  is_public,
  is_active,
  version
) VALUES (
  gen_random_uuid(),
  NULL, -- System template
  'Tutorial/How-to với Product Placement',
  'tutorial',
  'facebook',
  'Template để tạo nội dung hướng dẫn (Tutorial/How-to) từ video với tích hợp sản phẩm affiliate một cách tự nhiên. Phù hợp với video nấu ăn, DIY, công nghệ, làm đẹp, v.v.',
  'Bạn đang phân tích một video hướng dẫn (Tutorial/How-to) để tạo nội dung cho Facebook với tích hợp affiliate links.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Phân tích Video:** Xác định mục tiêu, vật liệu, các bước, mẹo và lỗi thường gặp
2. **Product Placement:** Tích hợp sản phẩm tự nhiên với giải thích giá trị
3. **Cấu trúc Tutorial:** Tiêu đề, mục tiêu, độ khó, thời gian, vật liệu, các bước, mẹo, lỗi, kết quả, CTA
4. **Tone:** {{tone}}, Ngôn ngữ: {{language}}, Độ dài: {{length}}

🎨 OUTPUT (JSON):

{
  "tutorial_title": "Tiêu đề hấp dẫn",
  "goal_statement": "Mục tiêu",
  "difficulty": "Dễ|Trung bình|Khó",
  "time_estimate": "30 phút",
  "materials_needed": [{"item_name": "", "quantity": "", "why_this_product": "", "affiliate_link": "", "recommended_brands": []}],
  "steps": [{"step_number": 1, "title": "", "description": "", "timestamp": "", "tips": [], "products_used": []}],
  "tips_and_tricks": [],
  "common_mistakes": [{"mistake": "", "why_it_happens": "", "how_to_avoid": ""}],
  "final_result": "",
  "cta": "",
  "target_audience": [],
  "seoKeywords": []
}',
  '{
    "videoTitle": "Tiêu đề video",
    "videoDescription": "Mô tả video",
    "channelName": "Tên kênh",
    "platform": "Nền tảng",
    "transcript": "Nội dung video",
    "affiliateLinks": "Danh sách link affiliate",
    "tone": "Giọng điệu",
    "language": "Ngôn ngữ (vi, en)",
    "length": "Độ dài (short, medium, long)"
  }'::jsonb,
  true, -- is_system
  true, -- is_public
  true, -- is_active
  '2.0'  -- version
) ON CONFLICT (id) DO NOTHING;

-- Step 11: Drop backup table (optional - comment out if you want to keep backup)
-- DROP TABLE IF EXISTS templates_backup;

-- Step 12: Verify migration
SELECT
  id,
  name,
  category,
  platform,
  is_system,
  is_public,
  is_active,
  version,
  created_at
FROM templates
ORDER BY is_system DESC, created_at DESC;

-- Display summary
SELECT
  category,
  platform,
  is_system,
  COUNT(*) as count
FROM templates
WHERE is_active = true
GROUP BY category, platform, is_system
ORDER BY is_system DESC, category, platform;
