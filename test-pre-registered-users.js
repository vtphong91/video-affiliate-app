// Test script for Phase 2: Pre-registered Users System
const testPreRegisteredUsersSystem = async () => {
  try {
    console.log('🧪 Testing Pre-registered Users System...\n');
    
    // Test 1: Registration API
    console.log('📝 Test 1: User Registration');
    const registrationData = {
      email: 'testuser@example.com',
      password: 'TestPassword123!',
      full_name: 'Test User',
      registration_source: 'public_registration'
    };
    
    console.log('📤 Sending registration request:', registrationData);
    
    const registrationResponse = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });
    
    const registrationResult = await registrationResponse.json();
    console.log('📥 Registration Response:', registrationResult);
    
    if (registrationResult.success) {
      console.log('✅ Registration successful!');
      console.log('User ID:', registrationResult.user_id);
    } else {
      console.log('❌ Registration failed:', registrationResult.error);
    }
    
    // Test 2: Check Pending Users
    console.log('\n📋 Test 2: Check Pending Users');
    const pendingResponse = await fetch('http://localhost:3000/api/admin/pending-users');
    const pendingResult = await pendingResponse.json();
    console.log('📥 Pending Users Response:', pendingResult);
    
    if (pendingResult.success) {
      console.log('✅ Pending users fetched successfully!');
      console.log('Count:', pendingResult.count);
      console.log('Users:', pendingResult.users);
    } else {
      console.log('❌ Failed to fetch pending users:', pendingResult.error);
    }
    
    // Test 3: Approve User (if we have a user)
    if (pendingResult.users && pendingResult.users.length > 0) {
      console.log('\n✅ Test 3: Approve User');
      const userToApprove = pendingResult.users[0];
      
      const approvalData = {
        role: 'viewer',
        notes: 'Test approval'
      };
      
      console.log('📤 Approving user:', userToApprove.user_id);
      
      const approvalResponse = await fetch(`http://localhost:3000/api/admin/users/${userToApprove.user_id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(approvalData),
      });
      
      const approvalResult = await approvalResponse.json();
      console.log('📥 Approval Response:', approvalResult);
      
      if (approvalResult.success) {
        console.log('✅ User approved successfully!');
      } else {
        console.log('❌ Approval failed:', approvalResult.error);
      }
    }
    
    // Test 4: Check Members List
    console.log('\n👥 Test 4: Check Members List');
    const membersResponse = await fetch('http://localhost:3000/api/admin/members');
    const membersResult = await membersResponse.json();
    console.log('📥 Members Response:', membersResult);
    
    if (membersResult.success) {
      console.log('✅ Members fetched successfully!');
      console.log('Count:', membersResult.data?.length || 0);
    } else {
      console.log('❌ Failed to fetch members:', membersResult.error);
    }
    
    console.log('\n🎉 Testing completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testPreRegisteredUsersSystem();
