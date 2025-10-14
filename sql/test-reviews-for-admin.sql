-- Test API reviews endpoint
-- This will help us debug the authentication issue

-- First, let's check if there are any reviews for the current admin user
SELECT 
    r.id,
    r.title,
    r.status,
    r.user_id,
    r.created_at,
    up.email,
    up.role
FROM reviews r
LEFT JOIN user_profiles up ON r.user_id = up.id
ORDER BY r.created_at DESC 
LIMIT 5;

-- Check if admin user has any reviews
SELECT 
    COUNT(*) as admin_reviews_count
FROM reviews r
JOIN user_profiles up ON r.user_id = up.id
WHERE up.email = 'lammmodotcom@gmail.com'; -- Replace with your admin email


