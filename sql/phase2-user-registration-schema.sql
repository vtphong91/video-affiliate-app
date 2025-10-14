-- Database Schema Updates for Pre-registered Users System
-- Phase 2 Implementation: User Registration + Admin Approval

-- 1. Add user status columns to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejected_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS registration_source VARCHAR(50) DEFAULT 'public_registration';

-- 2. Create user_registration_logs table for audit trail
CREATE TABLE IF NOT EXISTS user_registration_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- 'registered', 'approved', 'rejected', 'activated'
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMP DEFAULT NOW(),
    details JSONB,
    ip_address INET,
    user_agent TEXT
);

-- 3. Create user_approval_queue table for pending approvals
CREATE TABLE IF NOT EXISTS user_approval_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    registration_data JSONB,
    requested_at TIMESTAMP DEFAULT NOW(),
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    notes TEXT
);

-- 4. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_approved_by ON user_profiles(approved_by);
CREATE INDEX IF NOT EXISTS idx_user_registration_logs_user_id ON user_registration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_registration_logs_action ON user_registration_logs(action);
CREATE INDEX IF NOT EXISTS idx_user_approval_queue_status ON user_approval_queue(user_id);

-- 5. Add RLS policies for user_registration_logs
ALTER TABLE user_registration_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own registration logs" ON user_registration_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registration logs" ON user_registration_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 6. Add RLS policies for user_approval_queue
ALTER TABLE user_approval_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage approval queue" ON user_approval_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Create function to log user actions
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

-- 8. Create function to approve user
CREATE OR REPLACE FUNCTION approve_user(
    p_user_id UUID,
    p_role VARCHAR(20) DEFAULT 'viewer',
    p_permissions JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    user_email VARCHAR(255);
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
    
    -- Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = p_user_id;
    
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

-- 9. Create function to reject user
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

-- 10. Insert default admin user if not exists
INSERT INTO user_profiles (id, email, full_name, role, permissions, status, is_active)
SELECT 
    auth.users.id,
    auth.users.email,
    COALESCE(auth.users.raw_user_meta_data->>'full_name', auth.users.email),
    'admin',
    '["admin:all"]'::jsonb,
    'approved',
    true
FROM auth.users
WHERE auth.users.email = 'admin@example.com' -- Replace with your admin email
AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = auth.users.id
);

-- 11. Create view for admin dashboard
CREATE OR REPLACE VIEW admin_user_overview AS
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.status,
    up.created_at,
    up.approved_at,
    up.rejected_at,
    up.rejection_reason,
    approver.full_name as approved_by_name,
    rejector.full_name as rejected_by_name,
    CASE 
        WHEN up.status = 'pending' THEN 'Chờ duyệt'
        WHEN up.status = 'approved' THEN 'Đã duyệt'
        WHEN up.status = 'rejected' THEN 'Đã từ chối'
        WHEN up.status = 'active' THEN 'Hoạt động'
        ELSE 'Không xác định'
    END as status_display
FROM user_profiles up
LEFT JOIN user_profiles approver ON up.approved_by = approver.id
LEFT JOIN user_profiles rejector ON up.rejected_by = rejector.id
ORDER BY up.created_at DESC;

-- 12. Grant permissions
GRANT SELECT ON admin_user_overview TO authenticated;
GRANT EXECUTE ON FUNCTION log_user_action TO authenticated;
GRANT EXECUTE ON FUNCTION approve_user TO authenticated;
GRANT EXECUTE ON FUNCTION reject_user TO authenticated;

-- 13. Add comments
COMMENT ON TABLE user_registration_logs IS 'Audit trail for user registration actions';
COMMENT ON TABLE user_approval_queue IS 'Queue for users waiting for admin approval';
COMMENT ON COLUMN user_profiles.status IS 'User status: pending, approved, rejected, active';
COMMENT ON COLUMN user_profiles.approved_by IS 'Admin who approved the user';
COMMENT ON COLUMN user_profiles.rejected_by IS 'Admin who rejected the user';
COMMENT ON COLUMN user_profiles.rejection_reason IS 'Reason for rejection';

-- 14. Sample data for testing
INSERT INTO user_approval_queue (user_id, email, full_name, registration_data, notes)
VALUES 
    (gen_random_uuid(), 'test1@example.com', 'Test User 1', '{"source": "public_registration"}', 'Test user 1'),
    (gen_random_uuid(), 'test2@example.com', 'Test User 2', '{"source": "public_registration"}', 'Test user 2')
ON CONFLICT DO NOTHING;
