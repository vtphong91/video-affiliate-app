-- =====================================================
-- RESET PROMPT TEMPLATES - XÓA TẤT CẢ VÀ TẠO MỚI
-- =====================================================
-- Script này xóa tất cả templates cũ và tạo lại theo cấu trúc mới

-- Bước 1: Backup templates cũ (optional - comment out nếu không cần)
-- CREATE TABLE IF NOT EXISTS prompt_templates_backup AS
-- SELECT * FROM prompt_templates;

-- Bước 2: Xóa tất cả templates hiện tại
DELETE FROM prompt_templates;

-- Bước 3: Reset sequence nếu có
-- ALTER SEQUENCE IF EXISTS prompt_templates_id_seq RESTART WITH 1;

-- Bước 4: Verify - Kiểm tra đã xóa hết chưa
SELECT COUNT(*) as remaining_templates FROM prompt_templates;

-- Kết quả mong đợi: remaining_templates = 0
