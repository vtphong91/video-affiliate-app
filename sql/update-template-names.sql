-- Update template names for better clarity
-- Đổi tên templates để phân biệt rõ ràng giữa Product Review và Tutorial

-- 1. Update Product Review Template
UPDATE templates
SET
  name = '📦 Review Sản Phẩm',
  category = 'product-review',
  platform = 'facebook'
WHERE
  (name = 'Facebook Product Review Optimized' OR name = 'facebook_product_review_optimized')
  AND is_system = true;

-- 2. Update Tutorial Template
UPDATE templates
SET
  name = '📚 Tutorial + Giới Thiệu Sản Phẩm',
  category = 'tutorial',
  platform = 'facebook'
WHERE
  (name = 'Tutorial/How-to với Product Placement' OR name LIKE '%Tutorial%Product Placement%')
  AND is_system = true;

-- 3. Update other templates with emojis for consistency
UPDATE templates
SET name = '⚖️ So Sánh Sản Phẩm'
WHERE category = 'comparison' AND is_system = true;

UPDATE templates
SET name = '📦 Unboxing - Mở Hộp Trải Nghiệm'
WHERE category = 'unboxing' AND is_system = true;

UPDATE templates
SET name = '🍳 Hướng Dẫn Nấu Ăn'
WHERE category = 'cooking-tutorial' AND is_system = true;

UPDATE templates
SET name = '💻 Hướng Dẫn Công Nghệ'
WHERE category = 'tech-tutorial' AND is_system = true;

UPDATE templates
SET name = '💄 Hướng Dẫn Làm Đẹp'
WHERE category = 'beauty-tutorial' AND is_system = true;

-- Verify updates
SELECT
  id,
  name,
  category,
  platform,
  is_system,
  is_active,
  created_at
FROM templates
WHERE is_system = true
ORDER BY category, created_at;

-- Expected results:
-- beauty-tutorial    | 💄 Hướng Dẫn Làm Đẹp
-- comparison         | ⚖️ So Sánh Sản Phẩm
-- cooking-tutorial   | 🍳 Hướng Dẫn Nấu Ăn
-- product-review     | 📦 Review Sản Phẩm
-- tech-tutorial      | 💻 Hướng Dẫn Công Nghệ
-- tutorial           | 📚 Tutorial + Giới Thiệu Sản Phẩm
-- unboxing           | 📦 Unboxing - Mở Hộp Trải Nghiệm
