// Test script for member creation with password generation
const testMemberCreation = async () => {
  try {
    console.log('🧪 Testing Member Creation with Password Generation...\n');
    
    const testData = {
      email: 'testuser@example.com',
      full_name: 'Test User',
      role: 'viewer',
      permissions: []
    };
    
    console.log('📤 Sending request:', testData);
    
    const response = await fetch('http://localhost:3000/api/admin/members', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    const result = await response.json();
    
    console.log('📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ SUCCESS!');
      console.log('Member created successfully');
      if (result.data.password_generated) {
        console.log('🔐 Password was generated automatically');
        console.log('📧 Email notification was sent');
        console.log('⚠️ User needs to change password on first login');
      }
    } else {
      console.log('\n❌ FAILED!');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Run the test
testMemberCreation();


