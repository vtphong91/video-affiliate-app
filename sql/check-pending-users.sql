-- Check pending users in database
-- Run this in Supabase SQL Editor

-- 1. Check user_profiles with pending status
SELECT 
    id,
    email,
    full_name,
    role,
    status,
    created_at,
    approved_by,
    approved_at,
    rejected_by,
    rejected_at
FROM user_profiles 
WHERE status = 'pending'
ORDER BY created_at DESC;

-- 2. Check user_approval_queue
SELECT 
    id,
    user_id,
    email,
    full_name,
    requested_at,
    status,
    reviewer_id,
    reviewed_at,
    review_notes
FROM user_approval_queue 
WHERE status = 'pending'
ORDER BY requested_at DESC;

-- 3. Check user_registration_logs
SELECT 
    id,
    user_id,
    action,
    performed_at,
    details
FROM user_registration_logs 
WHERE action = 'registered'
ORDER BY performed_at DESC
LIMIT 5;

-- 4. Count pending users
SELECT 
    'Pending Users' as type,
    COUNT(*) as count
FROM user_profiles 
WHERE status = 'pending'
UNION ALL
SELECT 
    'Approval Queue' as type,
    COUNT(*) as count
FROM user_approval_queue 
WHERE status = 'pending';
