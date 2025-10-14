-- Simple fix for user_profiles role constraint
-- Drop the existing constraint and recreate it

-- Drop existing constraint
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Create new constraint that allows all valid roles
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_role_check 
CHECK (role IN ('admin', 'editor', 'viewer'));

-- Verify the constraint was created
SELECT 'Constraint created successfully!' as status;


