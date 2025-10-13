-- Add missing columns to user_profiles table
-- Run this in Supabase SQL Editor

-- 1. Add status column
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('pending', 'approved', 'rejected', 'active'));

-- 2. Add approval columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS registration_source TEXT DEFAULT 'admin_created';

-- 3. Update existing users to have 'active' status
UPDATE user_profiles 
SET status = 'active' 
WHERE status IS NULL;

-- 4. Check the updated structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;
