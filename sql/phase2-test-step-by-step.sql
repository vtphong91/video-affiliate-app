-- Test Phase 2 Database Setup - Step by Step
-- Run each section separately to identify issues

-- STEP 1: Add columns to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejected_by UUID,
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS registration_source VARCHAR(50) DEFAULT 'public_registration';

-- STEP 2: Create user_registration_logs table
CREATE TABLE IF NOT EXISTS user_registration_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMP DEFAULT NOW(),
    details JSONB,
    ip_address INET,
    user_agent TEXT
);

-- STEP 3: Create user_approval_queue table
CREATE TABLE IF NOT EXISTS user_approval_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    registration_data JSONB,
    requested_at TIMESTAMP DEFAULT NOW(),
    priority INTEGER DEFAULT 0,
    notes TEXT
);

-- STEP 4: Add indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_approved_by ON user_profiles(approved_by);
CREATE INDEX IF NOT EXISTS idx_user_registration_logs_user_id ON user_registration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_registration_logs_action ON user_registration_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_approval_queue_status ON user_approval_queue(user_id);

-- STEP 5: Enable RLS
ALTER TABLE user_registration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_approval_queue ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS policies
CREATE POLICY "Users can view their own registration logs" ON user_registration_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registration logs" ON user_registration_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage approval queue" ON user_approval_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- STEP 7: Create log_user_action function
CREATE OR REPLACE FUNCTION log_user_action(
    p_user_id UUID,
    p_action VARCHAR(50),
    p_performed_by UUID DEFAULT auth.uid(),
    p_details JSONB DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO user_registration_logs (
        user_id, action, performed_by, details, ip_address, user_agent
    ) VALUES (
        p_user_id, p_action, p_performed_by, p_details, p_ip_address, p_user_agent
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 8: Create approve_user function
CREATE OR REPLACE FUNCTION approve_user(
    p_user_id UUID,
    p_role VARCHAR(20) DEFAULT 'viewer',
    p_permissions JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    default_permissions JSONB;
BEGIN
    -- Get current user (admin)
    current_user_id := auth.uid();
    
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = current_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can approve users';
    END IF;
    
    -- Set default permissions based on role
    CASE p_role
        WHEN 'admin' THEN default_permissions := '["admin:all"]'::jsonb;
        WHEN 'editor' THEN default_permissions := '["read:reviews", "write:reviews", "delete:reviews", "read:schedules", "write:schedules", "delete:schedules", "read:categories", "write:categories", "delete:categories"]'::jsonb;
        WHEN 'viewer' THEN default_permissions := '["read:reviews", "read:schedules", "read:categories", "read:analytics"]'::jsonb;
        ELSE default_permissions := '[]'::jsonb;
    END CASE;
    
    -- Update user profile
    UPDATE user_profiles SET
        status = 'approved',
        role = p_role,
        permissions = COALESCE(p_permissions, default_permissions),
        approved_by = current_user_id,
        approved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log the action
    PERFORM log_user_action(
        p_user_id, 
        'approved', 
        current_user_id, 
        jsonb_build_object(
            'role', p_role,
            'permissions', COALESCE(p_permissions, default_permissions),
            'notes', p_notes
        )
    );
    
    -- Remove from approval queue
    DELETE FROM user_approval_queue WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 9: Create reject_user function
CREATE OR REPLACE FUNCTION reject_user(
    p_user_id UUID,
    p_rejection_reason TEXT,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
BEGIN
    -- Get current user (admin)
    current_user_id := auth.uid();
    
    -- Check if current user is admin
    IF NOT EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE id = current_user_id AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can reject users';
    END IF;
    
    -- Update user profile
    UPDATE user_profiles SET
        status = 'rejected',
        rejected_by = current_user_id,
        rejected_at = NOW(),
        rejection_reason = p_rejection_reason,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Log the action
    PERFORM log_user_action(
        p_user_id, 
        'rejected', 
        current_user_id, 
        jsonb_build_object(
            'rejection_reason', p_rejection_reason,
            'notes', p_notes
        )
    );
    
    -- Remove from approval queue
    DELETE FROM user_approval_queue WHERE user_id = p_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 10: Grant permissions
GRANT EXECUTE ON FUNCTION log_user_action TO authenticated;
GRANT EXECUTE ON FUNCTION approve_user TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user TO authenticated;

-- STEP 11: Update existing data
UPDATE user_profiles 
SET permissions = '["admin:all"]'::jsonb 
WHERE role = 'admin' AND permissions IS NULL;

UPDATE user_profiles 
SET status = 'approved', is_active = true 
WHERE status IS NULL AND role IN ('admin', 'editor', 'viewer');

-- STEP 12: Verify setup
SELECT 'Setup completed successfully!' as status;
